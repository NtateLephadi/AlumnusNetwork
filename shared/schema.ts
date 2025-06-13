import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Posts/Notifications table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: varchar("type", { enum: ["notification", "announcement"] }).default("notification"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  venue: varchar("venue").notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  speakers: text("speakers"),
  donationGoal: decimal("donation_goal", { precision: 10, scale: 2 }),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RSVPs table
export const rsvps = pgTable("rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ["attending", "not_attending", "maybe"] }).default("attending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Donations table
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: varchar("donor_id").notNull().references(() => users.id),
  eventId: integer("event_id").references(() => events.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reference: varchar("reference"),
  status: varchar("status", { enum: ["pending", "confirmed", "failed"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post likes table
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post comments table
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  events: many(events),
  rsvps: many(rsvps),
  donations: many(donations),
  postLikes: many(postLikes),
  postComments: many(postComments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, { fields: [events.organizerId], references: [users.id] }),
  rsvps: many(rsvps),
  donations: many(donations),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  event: one(events, { fields: [rsvps.eventId], references: [events.id] }),
  user: one(users, { fields: [rsvps.userId], references: [users.id] }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  donor: one(users, { fields: [donations.donorId], references: [users.id] }),
  event: one(events, { fields: [donations.eventId], references: [events.id] }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
  author: one(users, { fields: [postComments.authorId], references: [users.id] }),
}));

// Insert schemas
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRsvpSchema = createInsertSchema(rsvps).omit({
  id: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Rsvp = typeof rsvps.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
export type PostComment = typeof postComments.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
