import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  uniqueIndex,
  index,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { account, session, user, verification } from "./auth-schema";

export const notificationTypeEnum = pgEnum("notification_type", [
  "email",
  "webhook",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "bucket_created",
  "submission_created",
  "submission_deleted",
  "notification_sent",
  "api_key_generated",
]);

export const apiKeyScopeTypeEnum = pgEnum("api_key_scope_type", [
  "all",
  "specific",
  "restricted",
]);

export const buckets = pgTable(
  "buckets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),

    allowedDomains: jsonb("allowed_domains").$type<string[]>().default([]),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_bucket_unique_idx").on(table.userId, table.name),

    index("buckets_user_id_idx").on(table.userId),
  ],
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bucketId: uuid("bucket_id")
      .notNull()
      .references(() => buckets.id, { onDelete: "cascade" }),
    payload: jsonb("payload").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("submissions_bucket_created_idx").on(table.bucketId, table.createdAt),

    index("submissions_bucket_id_idx").on(table.bucketId),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bucketId: uuid("bucket_id")
      .notNull()
      .references(() => buckets.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    target: text("target").notNull(),
    enabled: text("enabled").default("true").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("notifications_bucket_id_idx").on(table.bucketId)],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bucketId: uuid("bucket_id").references(() => buckets.id, {
      onDelete: "set null",
    }),
    eventType: eventTypeEnum("event_type").notNull(),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("events_user_created_idx").on(table.userId, table.createdAt),

    index("events_bucket_created_idx").on(table.bucketId, table.createdAt),
  ],
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),

    canRead: boolean("can_read").default(true).notNull(),
    canWrite: boolean("can_write").default(true).notNull(),

    scopeType: apiKeyScopeTypeEnum("scope_type").default("all").notNull(),
    scopeBucketIds: jsonb("scope_bucket_ids").$type<string[]>(),

    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("api_keys_key_idx").on(table.key),
    index("api_keys_user_id_idx").on(table.userId),
  ],
);

export const apiKeyBucketScopes = pgTable(
  "api_key_bucket_scopes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    apiKeyId: uuid("api_key_id")
      .notNull()
      .references(() => apiKeys.id, { onDelete: "cascade" }),
    bucketId: uuid("bucket_id")
      .notNull()
      .references(() => buckets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("api_key_bucket_unique_idx").on(table.apiKeyId, table.bucketId),
    index("api_key_bucket_scopes_api_key_idx").on(table.apiKeyId),
    index("api_key_bucket_scopes_bucket_idx").on(table.bucketId),
  ],
);

export { account, session, user, verification };
