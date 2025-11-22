import { Response, useRoute, Route } from "react-serve-js";
import { db } from "../db";
import {
  buckets,
  submissions,
  apiKeys,
  usage,
  user,
  emailNotificationRecipients,
} from "../db/schema";
import { eq, and, sql, isNotNull } from "drizzle-orm";
import { config } from "dotenv";
import { sendEmailNotification } from "../lib/sendEmailNotification";

config();

// Helper to check if domain is allowed for bucket
const isDomainAllowed = (origin: string, allowedDomains: string[]) => {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true; // Empty array means allow all
  }

  try {
    const originHost = new URL(origin).hostname;

    return allowedDomains.some((domain) => {
      // Support wildcards like *.example.com
      if (domain.startsWith("*.")) {
        const baseDomain = domain.slice(2);
        return originHost.endsWith(baseDomain);
      }
      return originHost === domain || origin.includes(domain);
    });
  } catch {
    return false;
  }
};

export const CollectRoute = () => (
  <Route path="/collect" method="POST">
    {async () => {
      const { req } = useRoute();
      let apiKey = req.headers.authorization?.replace("Bearer ", "");

      if (!apiKey) {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        apiKey = url.searchParams.get("key") || undefined;
      }

      const origin = req.headers.origin || req.headers.referer || "";

      if (!apiKey) {
        return (
          <Response
            status={401}
            json={{ error: "API key required in Authorization header or URL" }}
          />
        );
      }

      try {
        // Verify API key
        const [key] = await db
          .select()
          .from(apiKeys)
          .where(eq(apiKeys.key, apiKey))
          .limit(1);

        if (!key) {
          return (
            <Response
              status={401}
              json={{ error: "Invalid or unauthorized API key" }}
            />
          );
        }

        // Get owner details
        const [owner] = await db
          .select()
          .from(user)
          .where(eq(user.id, key.userId))
          .limit(1);

        // Update last used timestamp
        await db
          .update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, key.id));

        const { bucket: bucketName, data } = req.body as {
          bucket: string;
          data: Record<string, any>;
        };

        if (!bucketName || !data) {
          return (
            <Response
              status={400}
              json={{ error: "bucket and data are required" }}
            />
          );
        }

        // Get or create bucket
        let [bucket] = await db
          .select()
          .from(buckets)
          .where(
            and(eq(buckets.userId, key.userId), eq(buckets.name, bucketName)),
          )
          .limit(1);

        if (bucket && bucket.deletedAt) {
          return (
            <Response status={400} json={{ error: "Bucket is deleted" }} />
          );
        }

        if (!bucket) {
          // Auto-create bucket on first submission
          [bucket] = await db
            .insert(buckets)
            .values({
              userId: key.userId,
              name: bucketName,
              allowedDomains: [],
            })
            .returning();
        }

        // Check domain restrictions
        const allowedDomains = (bucket.allowedDomains as string[]) || [];
        if (origin && !isDomainAllowed(origin, allowedDomains)) {
          return (
            <Response
              status={403}
              json={{ error: "Domain not allowed for this bucket" }}
            />
          );
        }

        // Create submission
        const [submission] = await db
          .insert(submissions)
          .values({
            bucketId: bucket.id,
            payload: data,
            ip: (req.headers["x-forwarded-for"] as string) || req.ip,
            userAgent: req.headers["user-agent"] as string,
          })
          .returning();

        const period = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // Send email notification
        if (bucket.emailNotificationsEnabled) {
          const recipients = await db
            .select()
            .from(emailNotificationRecipients)
            .where(
              and(
                eq(emailNotificationRecipients.bucketId, bucket.id),
                eq(emailNotificationRecipients.enabled, true),
                isNotNull(emailNotificationRecipients.verifiedAt),
              ),
            );

          const allRecipients = [
            { email: owner.email }, // Owner always receives email if enabled (handled by bucket.emailNotificationsEnabled)
            ...recipients,
          ];

          // Deduplicate emails
          const uniqueEmails = [...new Set(allRecipients.map((r) => r.email))];

          console.log("Attempting to send email notification to:", {
            emails: uniqueEmails,
            bucketName,
            userId: key.userId,
          });

          // Non-blocking email sending
          Promise.all(
            uniqueEmails.map(async (email) => {
              try {
                await sendEmailNotification({
                  recipientEmail: email,
                  bucketName,
                  data,
                  userId: key.userId,
                  bucketId: bucket.id,
                  submissionId: submission.id,
                  period,
                });
              } catch (error) {
                console.error(
                  `Failed to send email notification to ${email}:`,
                  error,
                );
              }
            }),
          );
        }

        // Track usage
        await db
          .insert(usage)
          .values({
            userId: key.userId,
            bucketId: bucket.id,
            period,
            count: 1,
          })
          .onConflictDoUpdate({
            target: [usage.userId, usage.bucketId, usage.period],
            set: {
              count: sql`${usage.count} + 1`,
            },
          });

        return (
          <Response
            status={201}
            json={{
              success: true,
              submissionId: submission.id,
              message: "Submission received",
            }}
          />
        );
      } catch (error: any) {
        console.error("Submit error:", error);
        return (
          <Response
            status={500}
            json={{
              error: "Internal server error",
              details: error.message,
            }}
          />
        );
      }
    }}
  </Route>
);
