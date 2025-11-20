import { Response, useRoute, Route } from "react-serve-js";
import { db } from "../db";
import { buckets, submissions, apiKeys } from "../db/schema";
import { eq, and } from "drizzle-orm";

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
      const apiKey = req.headers.authorization?.replace("Bearer ", "");
      const origin = req.headers.origin || req.headers.referer || "";

      if (!apiKey) {
        return (
          <Response
            status={401}
            json={{ error: "API key required in Authorization header" }}
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

        if (!key || !key.canWrite) {
          return (
            <Response
              status={401}
              json={{ error: "Invalid or unauthorized API key" }}
            />
          );
        }

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

        // Check if API key has access to this bucket
        if (key.scopeType === "specific") {
          const allowedBucketIds = (key.scopeBucketIds as string[]) || [];
          if (!allowedBucketIds.includes(bucket.id)) {
            return (
              <Response
                status={403}
                json={{
                  error: "API key does not have access to this bucket",
                }}
              />
            );
          }
        } else if (key.scopeType === "restricted") {
          const restrictedBucketIds = (key.scopeBucketIds as string[]) || [];
          if (restrictedBucketIds.includes(bucket.id)) {
            return (
              <Response
                status={403}
                json={{ error: "API key is restricted from this bucket" }}
              />
            );
          }
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
