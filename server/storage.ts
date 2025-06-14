import {
  users,
  posts,
  events,
  rsvps,
  donations,
  postLikes,
  postComments,
  polls,
  pollOptions,
  pollVotes,
  featuredEvents,
  pledges,
  communityExits,
  type User,
  type UpsertUser,
  type Post,
  type Event,
  type Rsvp,
  type Donation,
  type PostLike,
  type PostComment,
  type Poll,
  type PollOption,
  type PollVote,
  type FeaturedEvent,
  type Pledge,
  type InsertPost,
  type InsertEvent,
  type InsertRsvp,
  type InsertDonation,
  type InsertPostLike,
  type InsertPostComment,
  type InsertPoll,
  type InsertPollOption,
  type InsertPollVote,
  type InsertFeaturedEvent,
  type InsertPledge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Admin user operations
  getPendingUsers(): Promise<User[]>;
  approveUser(userId: string): Promise<void>;
  rejectUser(userId: string): Promise<void>;
  updateUserStatus(userId: string, status: string): Promise<void>;
  promoteToAdmin(userId: string): Promise<void>;
  removeAdminStatus(userId: string): Promise<void>;
  
  // Profile management
  getUserProfile(userId: string): Promise<User | undefined>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  exitCommunity(userId: string, userName: string, reason?: string): Promise<void>;
  
  // Post operations (admin-only creation)
  getPosts(): Promise<(Post & { author: User; likes: number; comments: number })[]>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(like: InsertPostLike): Promise<void>;
  unlikePost(postId: number, userId: string): Promise<void>;
  addPostComment(comment: InsertPostComment): Promise<PostComment>;
  getPostComments(postId: number): Promise<(PostComment & { author: User })[]>;
  
  // Event operations (admin-only creation)
  getEvents(): Promise<(Event & { organizer: User; attendees: number; totalDonations: number })[]>;
  getEvent(id: number): Promise<(Event & { organizer: User; attendees: number; totalDonations: number }) | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  
  // Featured events (carousel)
  getFeaturedEvents(): Promise<(FeaturedEvent & { event: Event & { organizer: User; attendees: number; totalDonations: number } })[]>;
  addFeaturedEvent(featuredEvent: InsertFeaturedEvent): Promise<FeaturedEvent>;
  removeFeaturedEvent(eventId: number): Promise<void>;
  
  // RSVP operations
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  getRsvp(eventId: number, userId: string): Promise<Rsvp | undefined>;
  updateRsvp(eventId: number, userId: string, status: string): Promise<void>;
  getEventAttendees(eventId: number): Promise<(Rsvp & { user: User })[]>;
  
  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getEventDonations(eventId: number): Promise<(Donation & { donor: User })[]>;
  getTotalDonations(): Promise<number>;
  
  // Poll operations (admin-only creation)
  getPolls(): Promise<(Poll & { createdBy: User; options: (PollOption & { voteCount: number })[] })[]>;
  getPoll(id: number): Promise<(Poll & { createdBy: User; options: (PollOption & { voteCount: number })[] }) | undefined>;
  createPoll(poll: InsertPoll, options: string[]): Promise<Poll>;
  votePoll(vote: InsertPollVote): Promise<void>;
  getUserPollVote(pollId: number, userId: string): Promise<PollVote | undefined>;
  
  // Pledge operations
  createPledge(pledge: InsertPledge): Promise<Pledge>;
  getEventPledges(eventId: number): Promise<(Pledge & { pledger: User })[]>;
  
  // Stats
  getStats(): Promise<{
    totalAlumni: number;
    totalDonations: number;
    eventsThisYear: number;
    pendingUsers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Admin user operations
  async getPendingUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.status, 'pending'))
      .orderBy(desc(users.createdAt));
  }

  async approveUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async rejectUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    await db
      .update(users)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async promoteToAdmin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isAdmin: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async removeAdminStatus(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isAdmin: false, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Profile management
  async getUserProfile(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async exitCommunity(userId: string, userName: string, reason?: string): Promise<void> {
    // Record the exit
    await db.insert(communityExits).values({
      userId,
      userName,
      reason: reason || null,
    });

    // Create a notification post about the exit
    await db.insert(posts).values({
      authorId: userId,
      content: `${userName} has left the UCT SCF Alumni community. We wish them well in their future endeavors.`,
      type: 'announcement',
    });

    // Mark user as inactive or remove from community
    await db
      .update(users)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Post operations
  async getPosts(): Promise<(Post & { author: User; likes: number; comments: number })[]> {
    const postsWithDetails = await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        type: posts.type,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: users,
        likes: sql<number>`count(distinct ${postLikes.id})`.as('likes'),
        comments: sql<number>`count(distinct ${postComments.id})`.as('comments'),
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(postLikes, eq(posts.id, postLikes.postId))
      .leftJoin(postComments, eq(posts.id, postComments.postId))
      .groupBy(posts.id, users.id)
      .orderBy(desc(posts.createdAt));

    return postsWithDetails.map(post => ({
      id: post.id,
      authorId: post.authorId,
      content: post.content,
      type: post.type,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author!,
      likes: Number(post.likes),
      comments: Number(post.comments),
    }));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async likePost(like: InsertPostLike): Promise<void> {
    await db
      .insert(postLikes)
      .values(like)
      .onConflictDoNothing();
  }

  async unlikePost(postId: number, userId: string): Promise<void> {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  }

  async addPostComment(comment: InsertPostComment): Promise<PostComment> {
    const [newComment] = await db
      .insert(postComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getPostComments(postId: number): Promise<(PostComment & { author: User })[]> {
    const comments = await db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        authorId: postComments.authorId,
        content: postComments.content,
        createdAt: postComments.createdAt,
        author: users,
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.authorId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);

    return comments.map(comment => ({
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author!,
    }));
  }

  // Event operations
  async getEvents(): Promise<(Event & { organizer: User; attendees: number; totalDonations: number })[]> {
    const eventsWithDetails = await db
      .select({
        id: events.id,
        organizerId: events.organizerId,
        title: events.title,
        description: events.description,
        venue: events.venue,
        date: events.date,
        time: events.time,
        speakers: events.speakers,
        donationGoal: events.donationGoal,
        imageUrl: events.imageUrl,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: users,
        attendees: sql<number>`count(distinct ${rsvps.id})`.as('attendees'),
        totalDonations: sql<number>`coalesce(sum(${donations.amount}), 0)`.as('totalDonations'),
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(rsvps, and(eq(events.id, rsvps.eventId), eq(rsvps.status, 'attending')))
      .leftJoin(donations, eq(events.id, donations.eventId))
      .groupBy(events.id, users.id)
      .orderBy(desc(events.createdAt));

    return eventsWithDetails.map(event => ({
      id: event.id,
      organizerId: event.organizerId,
      title: event.title,
      description: event.description,
      venue: event.venue,
      date: event.date,
      time: event.time,
      speakers: event.speakers,
      donationGoal: event.donationGoal,
      imageUrl: event.imageUrl,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      organizer: event.organizer!,
      attendees: Number(event.attendees),
      totalDonations: Number(event.totalDonations),
    }));
  }

  async getEvent(id: number): Promise<(Event & { organizer: User; attendees: number; totalDonations: number }) | undefined> {
    const [eventWithDetails] = await db
      .select({
        id: events.id,
        organizerId: events.organizerId,
        title: events.title,
        description: events.description,
        venue: events.venue,
        date: events.date,
        time: events.time,
        speakers: events.speakers,
        donationGoal: events.donationGoal,
        imageUrl: events.imageUrl,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: users,
        attendees: sql<number>`count(distinct ${rsvps.id})`.as('attendees'),
        totalDonations: sql<number>`coalesce(sum(${donations.amount}), 0)`.as('totalDonations'),
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(rsvps, and(eq(events.id, rsvps.eventId), eq(rsvps.status, 'attending')))
      .leftJoin(donations, eq(events.id, donations.eventId))
      .where(eq(events.id, id))
      .groupBy(events.id, users.id);

    if (!eventWithDetails) return undefined;

    return {
      id: eventWithDetails.id,
      organizerId: eventWithDetails.organizerId,
      title: eventWithDetails.title,
      description: eventWithDetails.description,
      venue: eventWithDetails.venue,
      date: eventWithDetails.date,
      time: eventWithDetails.time,
      speakers: eventWithDetails.speakers,
      donationGoal: eventWithDetails.donationGoal,
      imageUrl: eventWithDetails.imageUrl,
      createdAt: eventWithDetails.createdAt,
      updatedAt: eventWithDetails.updatedAt,
      organizer: eventWithDetails.organizer!,
      attendees: Number(eventWithDetails.attendees),
      totalDonations: Number(eventWithDetails.totalDonations),
    };
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Featured events operations
  async getFeaturedEvents(): Promise<(FeaturedEvent & { event: Event & { organizer: User; attendees: number; totalDonations: number } })[]> {
    const featuredEventsWithDetails = await db
      .select({
        id: featuredEvents.id,
        eventId: featuredEvents.eventId,
        order: featuredEvents.order,
        isActive: featuredEvents.isActive,
        createdAt: featuredEvents.createdAt,
        eventId2: events.id,
        eventOrganizerId: events.organizerId,
        eventTitle: events.title,
        eventDescription: events.description,
        eventVenue: events.venue,
        eventDate: events.date,
        eventTime: events.time,
        eventSpeakers: events.speakers,
        eventDonationGoal: events.donationGoal,
        eventImageUrl: events.imageUrl,
        eventCreatedAt: events.createdAt,
        eventUpdatedAt: events.updatedAt,
        organizerId: users.id,
        organizerEmail: users.email,
        organizerFirstName: users.firstName,
        organizerLastName: users.lastName,
        organizerProfileImageUrl: users.profileImageUrl,
        organizerIsAdmin: users.isAdmin,
        organizerStatus: users.status,
        organizerCreatedAt: users.createdAt,
        organizerUpdatedAt: users.updatedAt,
        attendees: sql<number>`count(distinct ${rsvps.id})`.as('attendees'),
        totalDonations: sql<number>`coalesce(sum(${donations.amount}), 0)`.as('totalDonations'),
      })
      .from(featuredEvents)
      .leftJoin(events, eq(featuredEvents.eventId, events.id))
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(rsvps, and(eq(events.id, rsvps.eventId), eq(rsvps.status, 'attending')))
      .leftJoin(donations, eq(events.id, donations.eventId))
      .where(eq(featuredEvents.isActive, true))
      .groupBy(featuredEvents.id, events.id, users.id)
      .orderBy(featuredEvents.order);

    return featuredEventsWithDetails.map(item => ({
      id: item.id!,
      eventId: item.eventId!,
      order: item.order,
      isActive: item.isActive,
      createdAt: item.createdAt,
      event: {
        id: item.eventId2!,
        organizerId: item.eventOrganizerId!,
        title: item.eventTitle!,
        description: item.eventDescription!,
        venue: item.eventVenue!,
        date: item.eventDate!,
        time: item.eventTime!,
        speakers: item.eventSpeakers,
        donationGoal: item.eventDonationGoal,
        imageUrl: item.eventImageUrl,
        createdAt: item.eventCreatedAt,
        updatedAt: item.eventUpdatedAt,
        organizer: {
          id: item.organizerId!,
          email: item.organizerEmail,
          firstName: item.organizerFirstName,
          lastName: item.organizerLastName,
          profileImageUrl: item.organizerProfileImageUrl,
          isAdmin: item.organizerIsAdmin,
          status: item.organizerStatus,
          createdAt: item.organizerCreatedAt,
          updatedAt: item.organizerUpdatedAt,
        },
        attendees: Number(item.attendees),
        totalDonations: Number(item.totalDonations),
      }
    }));
  }

  async addFeaturedEvent(featuredEvent: InsertFeaturedEvent): Promise<FeaturedEvent> {
    const [newFeaturedEvent] = await db
      .insert(featuredEvents)
      .values(featuredEvent)
      .returning();
    return newFeaturedEvent;
  }

  async removeFeaturedEvent(eventId: number): Promise<void> {
    await db
      .delete(featuredEvents)
      .where(eq(featuredEvents.eventId, eventId));
  }

  // RSVP operations
  async createRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    const [newRsvp] = await db
      .insert(rsvps)
      .values(rsvp)
      .returning();
    return newRsvp;
  }

  async getRsvp(eventId: number, userId: string): Promise<Rsvp | undefined> {
    const [rsvp] = await db
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, userId)));
    return rsvp;
  }

  async updateRsvp(eventId: number, userId: string, status: string): Promise<void> {
    await db
      .update(rsvps)
      .set({ status: status as any })
      .where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, userId)));
  }

  async getEventAttendees(eventId: number): Promise<(Rsvp & { user: User })[]> {
    const attendees = await db
      .select({
        id: rsvps.id,
        eventId: rsvps.eventId,
        userId: rsvps.userId,
        status: rsvps.status,
        createdAt: rsvps.createdAt,
        user: users,
      })
      .from(rsvps)
      .leftJoin(users, eq(rsvps.userId, users.id))
      .where(and(eq(rsvps.eventId, eventId), eq(rsvps.status, 'attending')));

    return attendees.map(attendee => ({
      id: attendee.id,
      eventId: attendee.eventId,
      userId: attendee.userId,
      status: attendee.status,
      createdAt: attendee.createdAt,
      user: attendee.user!,
    }));
  }

  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [newDonation] = await db
      .insert(donations)
      .values(donation)
      .returning();
    return newDonation;
  }

  async getEventDonations(eventId: number): Promise<(Donation & { donor: User })[]> {
    const eventDonations = await db
      .select({
        id: donations.id,
        donorId: donations.donorId,
        eventId: donations.eventId,
        amount: donations.amount,
        reference: donations.reference,
        status: donations.status,
        createdAt: donations.createdAt,
        donor: users,
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .where(eq(donations.eventId, eventId))
      .orderBy(desc(donations.createdAt));

    return eventDonations.map(donation => ({
      id: donation.id,
      donorId: donation.donorId,
      eventId: donation.eventId,
      amount: donation.amount,
      reference: donation.reference,
      status: donation.status,
      createdAt: donation.createdAt,
      donor: donation.donor!,
    }));
  }

  async getTotalDonations(): Promise<number> {
    const [result] = await db
      .select({
        total: sql<number>`coalesce(sum(${donations.amount}), 0)`,
      })
      .from(donations);
    return Number(result.total);
  }

  // Poll operations
  async getPolls(): Promise<(Poll & { createdBy: User; options: (PollOption & { voteCount: number })[] })[]> {
    const pollsWithDetails = await db
      .select({
        id: polls.id,
        createdById: polls.createdById,
        title: polls.title,
        description: polls.description,
        isActive: polls.isActive,
        createdAt: polls.createdAt,
        expiresAt: polls.expiresAt,
        createdBy: users,
      })
      .from(polls)
      .leftJoin(users, eq(polls.createdById, users.id))
      .orderBy(desc(polls.createdAt));

    const pollsWithOptions = await Promise.all(
      pollsWithDetails.map(async (poll) => {
        const options = await db
          .select()
          .from(pollOptions)
          .where(eq(pollOptions.pollId, poll.id));

        return {
          id: poll.id,
          createdById: poll.createdById,
          title: poll.title,
          description: poll.description,
          isActive: poll.isActive,
          createdAt: poll.createdAt,
          expiresAt: poll.expiresAt,
          createdBy: poll.createdBy!,
          options: options.map(option => ({
            ...option,
            voteCount: option.voteCount || 0,
          })),
        };
      })
    );

    return pollsWithOptions;
  }

  async getPoll(id: number): Promise<(Poll & { createdBy: User; options: (PollOption & { voteCount: number })[] }) | undefined> {
    const [pollWithDetails] = await db
      .select({
        id: polls.id,
        createdById: polls.createdById,
        title: polls.title,
        description: polls.description,
        isActive: polls.isActive,
        createdAt: polls.createdAt,
        expiresAt: polls.expiresAt,
        createdBy: users,
      })
      .from(polls)
      .leftJoin(users, eq(polls.createdById, users.id))
      .where(eq(polls.id, id));

    if (!pollWithDetails) return undefined;

    const options = await db
      .select()
      .from(pollOptions)
      .where(eq(pollOptions.pollId, id));

    return {
      id: pollWithDetails.id,
      createdById: pollWithDetails.createdById,
      title: pollWithDetails.title,
      description: pollWithDetails.description,
      isActive: pollWithDetails.isActive,
      createdAt: pollWithDetails.createdAt,
      expiresAt: pollWithDetails.expiresAt,
      createdBy: pollWithDetails.createdBy!,
      options: options.map(option => ({
        ...option,
        voteCount: option.voteCount || 0,
      })),
    };
  }

  async createPoll(poll: InsertPoll, options: string[]): Promise<Poll> {
    const [newPoll] = await db
      .insert(polls)
      .values(poll)
      .returning();

    const pollOptionsData = options.map(optionText => ({
      pollId: newPoll.id,
      optionText,
      voteCount: 0,
    }));

    await db.insert(pollOptions).values(pollOptionsData);

    return newPoll;
  }

  async votePoll(vote: InsertPollVote): Promise<void> {
    // Remove existing vote for this user on this poll
    await db
      .delete(pollVotes)
      .where(and(eq(pollVotes.pollId, vote.pollId), eq(pollVotes.userId, vote.userId)));

    // Add new vote
    await db.insert(pollVotes).values(vote);

    // Update vote count
    await db
      .update(pollOptions)
      .set({ voteCount: sql`${pollOptions.voteCount} + 1` })
      .where(eq(pollOptions.id, vote.optionId));
  }

  async getUserPollVote(pollId: number, userId: string): Promise<PollVote | undefined> {
    const [vote] = await db
      .select()
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));
    return vote;
  }

  // Pledge operations
  async createPledge(pledge: InsertPledge): Promise<Pledge> {
    const [newPledge] = await db.insert(pledges).values(pledge).returning();
    
    // Create a notification post for admins about the new pledge
    const pledger = await this.getUser(pledge.pledgerId);
    const event = await this.getEvent(pledge.eventId);
    
    if (pledger && event) {
      const pledgerName = `${pledger.firstName || ''} ${pledger.lastName || ''}`.trim() || pledger.email || 'Anonymous';
      const notificationContent = `New pledge received! ${pledgerName} pledged R${parseFloat(pledge.amount).toLocaleString()} for "${event.title}". Reference: ${pledge.reference || 'N/A'}`;
      
      await this.createPost({
        authorId: pledge.pledgerId,
        content: notificationContent,
        type: "notification"
      });
    }
    
    return newPledge;
  }

  async getEventPledges(eventId: number): Promise<(Pledge & { pledger: User })[]> {
    return await db.select()
      .from(pledges)
      .leftJoin(users, eq(pledges.pledgerId, users.id))
      .where(eq(pledges.eventId, eventId))
      .then(results => 
        results.map(result => ({
          ...result.pledges,
          pledger: result.users!
        }))
      );
  }

  // Stats
  async getStats(): Promise<{
    totalAlumni: number;
    totalDonations: number;
    eventsThisYear: number;
    pendingUsers: number;
  }> {
    const [totalAlumni] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.status, 'approved'));

    const [totalDonationsResult] = await db
      .select({ total: sql<number>`coalesce(sum(${donations.amount}), 0)` })
      .from(donations);

    const [eventsThisYear] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(sql`extract(year from ${events.createdAt}) = extract(year from now())`);

    const [pendingUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.status, 'pending'));

    return {
      totalAlumni: Number(totalAlumni.count),
      totalDonations: Number(totalDonationsResult.total),
      eventsThisYear: Number(eventsThisYear.count),
      pendingUsers: Number(pendingUsers.count),
    };
  }
}

export const storage = new DatabaseStorage();
