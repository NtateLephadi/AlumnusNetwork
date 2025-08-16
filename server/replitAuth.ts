import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
  provider: 'replit' | 'microsoft' = 'replit'
) {
  if (provider === 'microsoft') {
    await storage.upsertUser({
      id: claims.oid || claims.sub,
      email: claims.mail || claims.email,
      firstName: claims.given_name || claims.first_name,
      lastName: claims.family_name || claims.last_name,
      profileImageUrl: claims.picture || claims.profile_image_url,
    });
  } else {
    await storage.upsertUser({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Replit OIDC
  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = { provider: 'replit' };
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims(), 'replit');
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  // Setup Microsoft OAuth (optional - only if credentials are provided)
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    console.log('Setting up Microsoft authentication...');
    passport.use(new MicrosoftStrategy({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: "/api/auth/microsoft/callback",
      scope: ['user.read']
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const user = { 
          provider: 'microsoft',
          access_token: accessToken,
          refresh_token: refreshToken,
          claims: {
            sub: profile.id,
            email: profile.emails?.[0]?.value,
            given_name: profile.name?.givenName,
            family_name: profile.name?.familyName,
            picture: profile.photos?.[0]?.value
          }
        };
        
        await upsertUser({
          oid: profile.id,
          mail: profile.emails?.[0]?.value,
          given_name: profile.name?.givenName,
          family_name: profile.name?.familyName,
          picture: profile.photos?.[0]?.value
        }, 'microsoft');
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  } else {
    console.log('Microsoft authentication not configured - missing credentials');
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Replit auth routes
  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  // Microsoft auth routes (only if Microsoft strategy is configured)
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    app.get("/api/auth/microsoft", 
      passport.authenticate("microsoft", { scope: ["user.read"] })
    );

    app.get("/api/auth/microsoft/callback",
      passport.authenticate("microsoft", { 
        successRedirect: "/",
        failureRedirect: "/api/login"
      })
    );
  } else {
    // Fallback routes if Microsoft auth is not configured
    app.get("/api/auth/microsoft", (req, res) => {
      res.status(503).json({ message: "Microsoft authentication not configured" });
    });

    app.get("/api/auth/microsoft/callback", (req, res) => {
      res.redirect("/api/login");
    });
  }

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Microsoft auth doesn't use the same token expiry system
  if (user.provider === 'microsoft') {
    return next();
  }

  // Replit auth token validation
  if (!user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
