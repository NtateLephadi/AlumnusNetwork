import {
  users,
  posts,
  events,
  rsvps,
  donations,
  postLikes,
  postComments,
  type User,
  type UpsertUser,
  type Post,
  type Event,
  type Rsvp,
  type Donation,
  type PostLike,
  type PostComment,
  type InsertPost,
  type InsertEvent,
  type InsertRsvp,
  type InsertDonation,
  type InsertPostLike,
  type InsertPostComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Post operations
  getPosts(): Promise<(Post & { author: User; likes: number; comments: number })[]>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(like: InsertPostLike): Promise<void>;
  unlikePost(postId: number, userId: string): Promise<void>;
  addPostComment(comment: InsertPostComment): Promise<PostComment>;
  getPostComments(postId: number): Promise<(PostComment & { author: User })[]>;
  
  // Event operations
  getEvents(): Promise<(Event & { organizer: User; attendees: number; totalDonations: number })[]>;
  getEvent(id: number): Promise<(Event & { organizer: User; attendees: number; totalDonations: number }) | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // RSVP operations
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  getRsvp(eventId: number, userId: string): Promise<Rsvp | undefined>;
  updateRsvp(eventId: number, userId: string, status: string): Promise<void>;
  getEventAttendees(eventId: number): Promise<(Rsvp & { user: User })[]>;
  
  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getEventDonations(eventId: number): Promise<(Donation & { donor: User })[]>;
  getTotalDonations(): Promise<number>;
  
  // Stats
  getStats(): Promise<{
    totalAlumni: number;
    totalDonations: number;
    eventsThisYear: number;
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

  // Stats
  async getStats(): Promise<{
    totalAlumni: number;
    totalDonations: number;
    eventsThisYear: number;
  }> {
    const [totalAlumni] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [totalDonationsResult] = await db
      .select({ total: sql<number>`coalesce(sum(${donations.amount}), 0)` })
      .from(donations);

    const [eventsThisYear] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(sql`extract(year from ${events.createdAt}) = extract(year from now())`);

    return {
      totalAlumni: Number(totalAlumni.count),
      totalDonations: Number(totalDonationsResult.total),
      eventsThisYear: Number(eventsThisYear.count),
    };
  }
}

export const storage = new DatabaseStorage();
