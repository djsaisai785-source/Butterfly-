import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
export { user as authUser, session as authSession, account as authAccount, verification as authVerification } from "./auth-schema";

// Users
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  bio: text("bio"),
  type: text("type").notNull().default("user"), // user, pro, vip
  categories: text("categories"), // JSON array of categories they operate in
  location: text("location"),
  phone: text("phone"),
  verified: integer("verified", { mode: "boolean" }).default(false),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Listings / Annonces
export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // offer | demand
  category: text("category").notNull(), // transport, hebergement, restauration, nightlife, emploi, location, vip, entertainment
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: real("price"),
  priceUnit: text("price_unit"), // heure, nuit, soiree, personne, semaine
  currency: text("currency").default("EUR"),
  location: text("location"),
  date: text("date"), // date/créneau dispo
  images: text("images"), // JSON array
  tags: text("tags"), // JSON array
  status: text("status").notNull().default("active"), // active, paused, closed
  featured: integer("featured", { mode: "boolean" }).default(false),
  viewCount: integer("view_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Reservations
export const reservations = sqliteTable("reservations", {
  id: text("id").primaryKey(),
  listingId: text("listing_id").notNull().references(() => listings.id),
  buyerId: text("buyer_id").notNull().references(() => users.id),
  sellerId: text("seller_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  price: real("price").notNull(),
  currency: text("currency").default("EUR"),
  date: text("date"),
  notes: text("notes"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Messages
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  listingId: text("listing_id").references(() => listings.id),
  reservationId: text("reservation_id").references(() => reservations.id),
  participant1Id: text("participant1_id").notNull().references(() => users.id),
  participant2Id: text("participant2_id").notNull().references(() => users.id),
  lastMessage: text("last_message"),
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  senderId: text("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Reviews
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  listingId: text("listing_id").references(() => listings.id),
  reviewerId: text("reviewer_id").notNull().references(() => users.id),
  reviewedId: text("reviewed_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
