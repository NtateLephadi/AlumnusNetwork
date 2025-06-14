import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertPostSchema, 
  insertEventSchema, 
  insertRsvpSchema, 
  insertDonationSchema,
  insertPostCommentSchema,
  insertPostLikeSchema,
  insertPollSchema,
  insertPollVoteSchema,
  insertFeaturedEventSchema,
  insertPledgeSchema,
  userEducation
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Admin middleware
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Failed to verify admin status" });
  }
};

// Approved user middleware
const isApprovedUser = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user || user.status !== 'approved') {
      return res.status(403).json({ message: "User approval required" });
    }
    
    next();
  } catch (error) {
    console.error("Error checking user approval:", error);
    res.status(500).json({ message: "Failed to verify user status" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin-only user management routes
  app.get('/api/admin/pending-users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.post('/api/admin/approve-user/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.approveUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post('/api/admin/reject-user/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.rejectUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  app.post('/api/admin/promote-user/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await storage.promoteToAdmin(req.params.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  app.post('/api/admin/remove-admin/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await storage.removeAdminStatus(req.params.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing admin status:", error);
      res.status(500).json({ message: "Failed to remove admin status" });
    }
  });

  // Profile management routes
  app.get('/api/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.getUserProfile(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      console.log("Profile update request:", {
        userId,
        currentUserId,
        body: req.body
      });
      
      // Only allow users to update their own profile
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Unauthorized to update this profile" });
      }
      
      const user = await storage.updateUserProfile(userId, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      console.error("Error details:", error.message, error.stack);
      res.status(500).json({ message: "Failed to update user profile", error: error.message });
    }
  });

  app.post('/api/users/exit-community', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const userName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.email || 'A community member';
      
      await storage.exitCommunity(userId, userName, req.body.reason);
      res.json({ success: true });
    } catch (error) {
      console.error("Error exiting community:", error);
      res.status(500).json({ message: "Failed to exit community" });
    }
  });

  // Education routes
  app.get('/api/users/:userId/education', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const education = await storage.getUserEducation(userId);
      res.json(education);
    } catch (error) {
      console.error("Error fetching user education:", error);
      res.status(500).json({ message: "Failed to fetch education" });
    }
  });

  app.post('/api/users/:userId/education', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      // Only allow users to add their own education
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Can only manage your own education" });
      }

      const educationData = { ...req.body, userId };
      const education = await storage.addUserEducation(educationData);
      res.json(education);
    } catch (error) {
      console.error("Error adding education:", error);
      res.status(500).json({ message: "Failed to add education" });
    }
  });

  app.put('/api/education/:id', isAuthenticated, async (req: any, res) => {
    try {
      const educationId = parseInt(req.params.id);
      const currentUserId = req.user.claims.sub;
      
      // Get user's education to verify ownership
      const userEducations = await storage.getUserEducation(currentUserId);
      const userEducationRecord = userEducations.find(edu => edu.id === educationId);
      
      if (!userEducationRecord) {
        return res.status(403).json({ message: "Can only edit your own education" });
      }

      const education = await storage.updateUserEducation(educationId, req.body);
      res.json(education);
    } catch (error) {
      console.error("Error updating education:", error);
      res.status(500).json({ message: "Failed to update education" });
    }
  });

  app.delete('/api/education/:id', isAuthenticated, async (req: any, res) => {
    try {
      const educationId = parseInt(req.params.id);
      const currentUserId = req.user.claims.sub;
      
      // Get user's education to verify ownership
      const userEducations = await storage.getUserEducation(currentUserId);
      const userEducationRecord = userEducations.find(edu => edu.id === educationId);
      
      if (!userEducationRecord) {
        return res.status(403).json({ message: "Can only delete your own education" });
      }

      await storage.deleteUserEducation(educationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting education:", error);
      res.status(500).json({ message: "Failed to delete education" });
    }
  });

  // Business Ventures routes
  app.get('/api/users/:userId/business-ventures', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const ventures = await storage.getUserBusinessVentures(userId);
      res.json(ventures);
    } catch (error) {
      console.error("Error fetching business ventures:", error);
      res.status(500).json({ message: "Failed to fetch business ventures" });
    }
  });

  app.post('/api/users/:userId/business-ventures', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      // Only allow users to add their own business ventures
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Can only manage your own business ventures" });
      }

      const ventureData = { 
        ...req.body, 
        userId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };
      const venture = await storage.addUserBusinessVenture(ventureData);
      res.json(venture);
    } catch (error) {
      console.error("Error adding business venture:", error);
      res.status(500).json({ message: "Failed to add business venture" });
    }
  });

  app.put('/api/business-ventures/:id', isAuthenticated, async (req: any, res) => {
    try {
      const ventureId = parseInt(req.params.id);
      const currentUserId = req.user.claims.sub;
      
      // Get user's ventures to verify ownership
      const userVentures = await storage.getUserBusinessVentures(currentUserId);
      const userVentureRecord = userVentures.find(venture => venture.id === ventureId);
      
      if (!userVentureRecord) {
        return res.status(403).json({ message: "Can only edit your own business ventures" });
      }

      const updateData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };
      const venture = await storage.updateUserBusinessVenture(ventureId, updateData);
      res.json(venture);
    } catch (error) {
      console.error("Error updating business venture:", error);
      res.status(500).json({ message: "Failed to update business venture" });
    }
  });

  app.delete('/api/business-ventures/:id', isAuthenticated, async (req: any, res) => {
    try {
      const ventureId = parseInt(req.params.id);
      const currentUserId = req.user.claims.sub;
      
      // Get user's ventures to verify ownership
      const userVentures = await storage.getUserBusinessVentures(currentUserId);
      const userVentureRecord = userVentures.find(venture => venture.id === ventureId);
      
      if (!userVentureRecord) {
        return res.status(403).json({ message: "Can only delete your own business ventures" });
      }

      await storage.deleteUserBusinessVenture(ventureId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting business venture:", error);
      res.status(500).json({ message: "Failed to delete business venture" });
    }
  });

  // Non-Profit Organizations routes
  app.get('/api/users/:userId/nonprofits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const nonprofits = await storage.getUserNonprofits(userId);
      res.json(nonprofits);
    } catch (error) {
      console.error("Error fetching nonprofits:", error);
      res.status(500).json({ message: "Failed to fetch nonprofits" });
    }
  });

  app.post('/api/users/:userId/nonprofits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      // Only allow users to add their own nonprofit experience
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Can only manage your own nonprofit experience" });
      }

      const nonprofitData = { 
        ...req.body, 
        userId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };
      const nonprofit = await storage.addUserNonprofit(nonprofitData);
      res.json(nonprofit);
    } catch (error) {
      console.error("Error adding nonprofit:", error);
      res.status(500).json({ message: "Failed to add nonprofit" });
    }
  });

  app.put('/api/nonprofits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const nonprofitId = parseInt(req.params.id);
      const currentUserId = req.user.claims.sub;
      
      // Get user's nonprofits to verify ownership
      const userNonprofits = await storage.getUserNonprofits(currentUserId);
      const userNonprofitRecord = userNonprofits.find(np => np.id === nonprofitId);
      
      if (!userNonprofitRecord) {
        return res.status(403).json({ message: "Can only edit your own nonprofit experience" });
      }

      const updateData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };
      const nonprofit = await storage.updateUserNonprofit(nonprofitId, updateData);
      res.json(nonprofit);
    } catch (error) {
      console.error("Error updating nonprofit:", error);
      res.status(500).json({ message: "Failed to update nonprofit" });
    }
  });

  app.delete('/api/nonprofits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const nonprofitId = parseInt(req.params.id);
      const currentUserId = req.user.claims.sub;
      
      // Get user's nonprofits to verify ownership
      const userNonprofits = await storage.getUserNonprofits(currentUserId);
      const userNonprofitRecord = userNonprofits.find(np => np.id === nonprofitId);
      
      if (!userNonprofitRecord) {
        return res.status(403).json({ message: "Can only delete your own nonprofit experience" });
      }

      await storage.deleteUserNonprofit(nonprofitId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting nonprofit:", error);
      res.status(500).json({ message: "Failed to delete nonprofit" });
    }
  });

  // Posts routes (viewable by approved users)
  app.get('/api/posts', isAuthenticated, isApprovedUser, async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Admin-only post creation
  app.post('/api/posts', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({ ...req.body, authorId: userId });
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post('/api/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const likeData = insertPostLikeSchema.parse({ postId, userId });
      await storage.likePost(likeData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete('/api/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      await storage.unlikePost(postId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const commentData = insertPostCommentSchema.parse({ 
        ...req.body, 
        postId, 
        authorId: userId 
      });
      const comment = await storage.addPostComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Events routes (viewable by approved users)
  app.get('/api/events', isAuthenticated, isApprovedUser, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', isAuthenticated, isApprovedUser, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Admin-only event management
  app.post('/api/events', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse({ ...req.body, organizerId: userId });
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put('/api/events/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(eventId, eventData);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      await storage.deleteEvent(eventId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // RSVP routes
  app.post('/api/events/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      const { status = 'attending' } = req.body;
      
      const existingRsvp = await storage.getRsvp(eventId, userId);
      
      if (existingRsvp) {
        await storage.updateRsvp(eventId, userId, status);
      } else {
        const rsvpData = insertRsvpSchema.parse({ eventId, userId, status });
        await storage.createRsvp(rsvpData);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error handling RSVP:", error);
      res.status(500).json({ message: "Failed to handle RSVP" });
    }
  });

  app.get('/api/events/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      const rsvp = await storage.getRsvp(eventId, userId);
      res.json(rsvp);
    } catch (error) {
      console.error("Error fetching RSVP:", error);
      res.status(500).json({ message: "Failed to fetch RSVP" });
    }
  });

  app.get('/api/events/:id/attendees', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const attendees = await storage.getEventAttendees(eventId);
      res.json(attendees);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      res.status(500).json({ message: "Failed to fetch attendees" });
    }
  });

  // Donation routes
  app.post('/api/donations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const donationData = insertDonationSchema.parse({ ...req.body, donorId: userId });
      const donation = await storage.createDonation(donationData);
      res.json(donation);
    } catch (error) {
      console.error("Error creating donation:", error);
      res.status(500).json({ message: "Failed to create donation" });
    }
  });

  app.get('/api/events/:id/donations', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const donations = await storage.getEventDonations(eventId);
      res.json(donations);
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  // Featured events routes (carousel)
  app.get('/api/featured-events', isAuthenticated, isApprovedUser, async (req, res) => {
    try {
      const featuredEvents = await storage.getFeaturedEvents();
      res.json(featuredEvents);
    } catch (error) {
      console.error("Error fetching featured events:", error);
      res.status(500).json({ message: "Failed to fetch featured events" });
    }
  });

  app.post('/api/admin/featured-events', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const featuredEventData = insertFeaturedEventSchema.parse(req.body);
      const featuredEvent = await storage.addFeaturedEvent(featuredEventData);
      res.json(featuredEvent);
    } catch (error) {
      console.error("Error adding featured event:", error);
      res.status(500).json({ message: "Failed to add featured event" });
    }
  });

  app.delete('/api/admin/featured-events/:eventId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      await storage.removeFeaturedEvent(eventId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing featured event:", error);
      res.status(500).json({ message: "Failed to remove featured event" });
    }
  });

  // Polls routes
  app.get('/api/polls', isAuthenticated, isApprovedUser, async (req, res) => {
    try {
      const polls = await storage.getPolls();
      res.json(polls);
    } catch (error) {
      console.error("Error fetching polls:", error);
      res.status(500).json({ message: "Failed to fetch polls" });
    }
  });

  app.get('/api/polls/:id', isAuthenticated, isApprovedUser, async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      const poll = await storage.getPoll(pollId);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      res.json(poll);
    } catch (error) {
      console.error("Error fetching poll:", error);
      res.status(500).json({ message: "Failed to fetch poll" });
    }
  });

  // Admin-only poll creation
  app.post('/api/admin/polls', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { options, ...pollData } = req.body;
      const pollSchema = insertPollSchema.parse({ ...pollData, createdById: userId });
      const poll = await storage.createPoll(pollSchema, options);
      res.json(poll);
    } catch (error) {
      console.error("Error creating poll:", error);
      res.status(500).json({ message: "Failed to create poll" });
    }
  });

  // Poll voting (approved users only)
  app.post('/api/polls/:id/vote', isAuthenticated, isApprovedUser, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pollId = parseInt(req.params.id);
      const { optionId } = req.body;
      
      const voteData = insertPollVoteSchema.parse({ pollId, optionId, userId });
      await storage.votePoll(voteData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on poll:", error);
      res.status(500).json({ message: "Failed to vote on poll" });
    }
  });

  app.get('/api/polls/:id/my-vote', isAuthenticated, isApprovedUser, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pollId = parseInt(req.params.id);
      const vote = await storage.getUserPollVote(pollId, userId);
      res.json(vote);
    } catch (error) {
      console.error("Error fetching user vote:", error);
      res.status(500).json({ message: "Failed to fetch user vote" });
    }
  });

  // Stats route
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Pledge routes
  app.post('/api/pledges', isAuthenticated, isApprovedUser, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const amount = parseFloat(req.body.amount);
      
      // Validate amount is within database limits (max 99,999,999.99)
      if (amount > 99999999.99) {
        return res.status(400).json({ message: "Pledge amount cannot exceed R99,999,999.99" });
      }
      
      if (amount <= 0) {
        return res.status(400).json({ message: "Pledge amount must be greater than 0" });
      }
      
      const pledgeData = {
        pledgerId: userId,
        eventId: req.body.eventId,
        amount: amount.toString(), // Convert to string for decimal field
        reference: req.body.reference || null,
        status: "pending"
      };
      
      const validatedData = insertPledgeSchema.parse(pledgeData);
      const pledge = await storage.createPledge(validatedData);
      
      res.json(pledge);
    } catch (error) {
      console.error("Error creating pledge:", error);
      res.status(500).json({ message: "Failed to create pledge" });
    }
  });

  app.get('/api/events/:eventId/pledges', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const pledges = await storage.getEventPledges(eventId);
      res.json(pledges);
    } catch (error) {
      console.error("Error fetching event pledges:", error);
      res.status(500).json({ message: "Failed to fetch event pledges" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
