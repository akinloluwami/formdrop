import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  uniqueIndex,
  index,
  pgEnum,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { account, session, user, verification } from "./auth-schema";

export const notificationTypeEnum = pgEnum("notification_type", [
  "email",
  "webhook",
  "slack",
  "discord",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "bucket_created",
  "submission_created",
  "submission_deleted",
  "notification_sent",
  "api_key_generated",
]);

export const apiKeyTypeEnum = pgEnum("api_key_type", ["public", "private"]);

export const buckets = pgTable(
  "buckets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    emailNotificationsEnabled: boolean("email_notifications_enabled")
      .default(true)
      .notNull(),

    // Slack integration
    slackWebhookUrl: text("slack_webhook_url"),
    slackChannelId: text("slack_channel_id"),
    slackChannelName: text("slack_channel_name"),
    slackTeamName: text("slack_team_name"),
    slackNotificationsEnabled: boolean("slack_notifications_enabled")
      .default(false)
      .notNull(),

    // Discord integration
    discordWebhookUrl: text("discord_webhook_url"),
    discordChannelId: text("discord_channel_id"),
    discordChannelName: text("discord_channel_name"),
    discordGuildName: text("discord_guild_name"),
    discordNotificationsEnabled: boolean("discord_notifications_enabled")
      .default(false)
      .notNull(),

    allowedDomains: jsonb("allowed_domains").$type<string[]>().default([]),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table: any) => [
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
    deletedAt: timestamp("deleted_at"),
  },
  (table: any) => [
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
  (table: any) => [index("notifications_bucket_id_idx").on(table.bucketId)],
);

export const emailNotificationRecipients = pgTable(
  "email_notification_recipients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bucketId: uuid("bucket_id")
      .notNull()
      .references(() => buckets.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    verifiedAt: timestamp("verified_at"),
    verificationToken: text("verification_token"),
    verificationTokenExpiresAt: timestamp("verification_token_expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table: any) => [
    index("email_notification_recipients_bucket_id_idx").on(table.bucketId),
  ],
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
  (table: any) => [
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
    type: apiKeyTypeEnum("type").notNull(),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table: any) => [
    index("api_keys_key_idx").on(table.key),
    index("api_keys_user_id_idx").on(table.userId),
    uniqueIndex("api_keys_user_type_unique").on(table.userId, table.type),
  ],
);

export const usage = pgTable(
  "usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    bucketId: uuid("bucket_id")
      .notNull()
      .references(() => buckets.id, { onDelete: "cascade" }),

    // for daily counting — easiest for quotas
    period: text("period").notNull(),

    count: integer("count").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table: any) => [
    // prevent duplicate rows per period
    uniqueIndex("usage_unique_idx").on(
      table.userId,
      table.bucketId,
      table.period,
    ),
    index("usage_user_period_idx").on(table.userId, table.period),
  ],
);

export const notificationUsage = pgTable(
  "notification_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    bucketId: uuid("bucket_id")
      .notNull()
      .references(() => buckets.id, { onDelete: "cascade" }),

    type: notificationTypeEnum("type").notNull(),

    // for daily counting — easiest for quotas
    period: text("period").notNull(),

    count: integer("count").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table: any) => [
    // prevent duplicate rows per period
    uniqueIndex("notification_usage_unique_idx").on(
      table.userId,
      table.bucketId,
      table.period,
      table.type,
    ),
    index("notification_usage_user_period_idx").on(table.userId, table.period),
  ],
);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "unpaid",
  "trialing",
  "paused",
]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export { account, session, user, verification };
