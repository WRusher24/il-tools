import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*  Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const userRoleEnum = pgEnum("user_role", ["admin", "premium", "free"]);

export const uploadStatusEnum = pgEnum("upload_status", [
  "pending",
  "completed",
  "failed",
]);

/* -------------------------------------------------------------------------- */
/*  Identity & access (RBAC)                                                   */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("free"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

/**
 * Only the SHA-256 hash of the bearer token is persisted — a DB leak never
 * exposes usable session tokens (token-hashing pattern).
 */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // sha256(token) hex
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/* -------------------------------------------------------------------------- */
/*  Catalog (migrated out of the monolithic script into queryable tables)      */
/* -------------------------------------------------------------------------- */

export const tools = pgTable("tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  target: text("target").notNull(),
  startingPriceIls: integer("starting_price_ils").notNull(),
  freeTierAvailable: boolean("free_tier_available").notNull().default(false),
  hasMobileApp: boolean("has_mobile_app").notNull().default(false),
  ecommerceIntegration: text("ecommerce_integration").notNull(),
  hebrewSupport: text("hebrew_support").notNull(),
  hasApi: boolean("has_api").notNull().default(false),
  israelVatSupport: text("israel_vat_support").notNull(),
  affiliateLink: text("affiliate_link").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const guides = pgTable("guides", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  /** Authored HTML — always rendered through the server-side allowlist sanitizer. */
  content: text("content").notNull(),
  readingMinutes: integer("reading_minutes").notNull().default(4),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const comparisons = pgTable("comparisons", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  toolAId: uuid("tool_a_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
  toolBId: uuid("tool_b_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  Feature 1 — user dashboard                                                 */
/* -------------------------------------------------------------------------- */

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toolId: uuid("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("favorites_user_tool_idx").on(t.userId, t.toolId)],
);

/* -------------------------------------------------------------------------- */
/*  Feature 3 — real-time notifications + activity feed                        */
/* -------------------------------------------------------------------------- */

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    actorName: text("actor_name").notNull(),
    message: text("message").notNull(),
    toolSlug: text("tool_slug"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("activity_created_idx").on(t.createdAt)],
);

/* -------------------------------------------------------------------------- */
/*  Feature 2 — chunked uploads                                                */
/* -------------------------------------------------------------------------- */

export const uploads = pgTable(
  "uploads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    totalChunks: integer("total_chunks").notNull(),
    receivedChunks: integer("received_chunks").notNull().default(0),
    status: uploadStatusEnum("status").notNull().default("pending"),
    sha256: text("sha256"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [index("uploads_user_idx").on(t.userId, t.createdAt)],
);

/* -------------------------------------------------------------------------- */
/*  Inferred types                                                             */
/* -------------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type Guide = typeof guides.$inferSelect;
export type Comparison = typeof comparisons.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ActivityEvent = typeof activityEvents.$inferSelect;
export type Upload = typeof uploads.$inferSelect;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
