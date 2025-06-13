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
  insertFeaturedEventSchema
} from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
