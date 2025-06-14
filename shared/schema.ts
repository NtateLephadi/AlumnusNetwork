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
  isAdmin: boolean("is_admin").default(false),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  location: varchar("location"),
  jobTitle: varchar("job_title"),
  company: varchar("company"),
  businessVenture: varchar("business_venture"),
  industry: varchar("industry"),
  interests: text("interests"), // JSON array as text
  hobbies: text("hobbies"), // JSON array as text
  bio: text("bio"),
  graduationYear: integer("graduation_year"),
  degree: varchar("degree"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userEducation = pgTable("user_education", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  institution: varchar("institution").notNull(),
  degree: varchar("degree").notNull(),
  fieldOfStudy: varchar("field_of_study"),
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityExits = pgTable("community_exits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  userName: varchar("user_name").notNull(),
  reason: text("reason"),
  exitedAt: timestamp("exited_at").defaultNow(),
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
  paymentReference: varchar("payment_reference"),
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

// Polls table
export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Poll options table
export const pollOptions = pgTable("poll_options", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull().references(() => polls.id),
  optionText: varchar("option_text").notNull(),
  voteCount: integer("vote_count").default(0),
});

// Poll votes table
export const pollVotes = pgTable("poll_votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull().references(() => polls.id),
  optionId: integer("option_id").notNull().references(() => pollOptions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Featured events table (for carousel)
export const featuredEvents = pgTable("featured_events", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pledges table
export const pledges = pgTable("pledges", {
  id: serial("id").primaryKey(),
  pledgerId: varchar("pledger_id").notNull().references(() => users.id),
  eventId: integer("event_id").references(() => events.id), // Made optional for generic donations
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reference: varchar("reference"),
  status: varchar("status", { enum: ["pending", "fulfilled", "cancelled"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business Ventures table
export const userBusinessVentures = pgTable("user_business_ventures", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: varchar("company_name").notNull(),
  role: varchar("role").notNull(),
  industry: varchar("industry"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isCurrent: boolean("is_current").default(false),
  description: text("description"),
  website: varchar("website"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Non-Profit Organizations table
export const userNonprofits = pgTable("user_nonprofits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationName: varchar("organization_name").notNull(),
  role: varchar("role").notNull(),
  cause: varchar("cause"), // e.g., Education, Health, Environment
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isCurrent: boolean("is_current").default(false),
  description: text("description"),
  website: varchar("website"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Banking details configuration (admin-only)
export const bankingDetails = pgTable("banking_details", {
  id: serial("id").primaryKey(),
  bankName: varchar("bank_name").notNull(),
  accountName: varchar("account_name").notNull(),
  accountNumber: varchar("account_number").notNull(),
  branchCode: varchar("branch_code").notNull(),
  swiftCode: varchar("swift_code"),
  reference: varchar("reference").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  events: many(events),
  rsvps: many(rsvps),
  donations: many(donations),
  postLikes: many(postLikes),
  postComments: many(postComments),
  polls: many(polls),
  pollVotes: many(pollVotes),
  pledges: many(pledges),
  education: many(userEducation),
  businessVentures: many(userBusinessVentures),
  nonprofits: many(userNonprofits),
}));

export const userEducationRelations = relations(userEducation, ({ one }) => ({
  user: one(users, { fields: [userEducation.userId], references: [users.id] }),
}));

export const userBusinessVenturesRelations = relations(userBusinessVentures, ({ one }) => ({
  user: one(users, { fields: [userBusinessVentures.userId], references: [users.id] }),
}));

export const userNonprofitsRelations = relations(userNonprofits, ({ one }) => ({
  user: one(users, { fields: [userNonprofits.userId], references: [users.id] }),
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
  pledges: many(pledges),
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

export const pollsRelations = relations(polls, ({ one, many }) => ({
  createdBy: one(users, { fields: [polls.createdById], references: [users.id] }),
  options: many(pollOptions),
  votes: many(pollVotes),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(polls, { fields: [pollOptions.pollId], references: [polls.id] }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, { fields: [pollVotes.pollId], references: [polls.id] }),
  option: one(pollOptions, { fields: [pollVotes.optionId], references: [pollOptions.id] }),
  user: one(users, { fields: [pollVotes.userId], references: [users.id] }),
}));

export const featuredEventsRelations = relations(featuredEvents, ({ one }) => ({
  event: one(events, { fields: [featuredEvents.eventId], references: [events.id] }),
}));

export const pledgesRelations = relations(pledges, ({ one }) => ({
  pledger: one(users, { fields: [pledges.pledgerId], references: [users.id] }),
  event: one(events, { fields: [pledges.eventId], references: [events.id] }),
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

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
});

export const insertPollOptionSchema = createInsertSchema(pollOptions).omit({
  id: true,
  voteCount: true,
});

export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({
  id: true,
  createdAt: true,
});

export const insertFeaturedEventSchema = createInsertSchema(featuredEvents).omit({
  id: true,
  createdAt: true,
});

export const insertPledgeSchema = createInsertSchema(pledges).omit({
  id: true,
  createdAt: true,
});

export const insertBankingDetailsSchema = createInsertSchema(bankingDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type Poll = typeof polls.$inferSelect;
export type PollOption = typeof pollOptions.$inferSelect;
export type PollVote = typeof pollVotes.$inferSelect;
export type FeaturedEvent = typeof featuredEvents.$inferSelect;
export type Pledge = typeof pledges.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type InsertPollOption = z.infer<typeof insertPollOptionSchema>;
export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;
export type InsertFeaturedEvent = z.infer<typeof insertFeaturedEventSchema>;
export type InsertPledge = z.infer<typeof insertPledgeSchema>;

export type UserEducation = typeof userEducation.$inferSelect;
export type InsertUserEducation = typeof userEducation.$inferInsert;

export type UserBusinessVenture = typeof userBusinessVentures.$inferSelect;
export type InsertUserBusinessVenture = typeof userBusinessVentures.$inferInsert;

export type UserNonprofit = typeof userNonprofits.$inferSelect;
export type InsertUserNonprofit = typeof userNonprofits.$inferInsert;

export type BankingDetails = typeof bankingDetails.$inferSelect;
export type InsertBankingDetails = z.infer<typeof insertBankingDetailsSchema>;
