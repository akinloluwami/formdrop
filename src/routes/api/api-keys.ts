import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { apiKeys, apiKeyBucketScopes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export const Route = createFileRoute("/api/api-keys")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;

          const userApiKeys = await db
            .select({
              id: apiKeys.id,
              name: apiKeys.name,
              key: apiKeys.key,
              canRead: apiKeys.canRead,
              canWrite: apiKeys.canWrite,
              scopeType: apiKeys.scopeType,
              scopeBucketIds: apiKeys.scopeBucketIds,
              lastUsedAt: apiKeys.lastUsedAt,
              createdAt: apiKeys.createdAt,
            })
            .from(apiKeys)
            .where(eq(apiKeys.userId, userId));

          // Mask keys for security - show only first 10 chars
          const maskedKeys = userApiKeys.map((key) => ({
            ...key,
            key: key.key.substring(0, 10) + "..." + key.key.slice(-4),
          }));

          return Response.json({ apiKeys: maskedKeys });
        } catch (error: any) {
          return Response.json(
            {
              error: "Internal server error",
              details: error.message,
            },
            { status: 500 },
          );
        }
      },

      POST: async ({ request }: { request: Request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;

          const body = await request.json();
          const {
            name,
            canRead = true,
            canWrite = true,
            scopeType = "all",
            bucketIds = [],
          } = body;

          if (!name) {
            return Response.json(
              { error: "Name is required" },
              { status: 400 },
            );
          }

          // Generate API key: fd_<random_32_chars>
          const randomBytes = crypto.randomBytes(24);
          const keyValue = `fd_${randomBytes.toString("hex")}`;

          // Create API key
          const [newApiKey] = await db
            .insert(apiKeys)
            .values({
              userId,
              name,
              key: keyValue,
              canRead,
              canWrite,
              scopeType,
              scopeBucketIds:
                scopeType === "restricted" && bucketIds.length > 0
                  ? bucketIds
                  : null,
            })
            .returning();

          // If scope is restricted, create bucket scopes
          if (scopeType === "restricted" && bucketIds.length > 0) {
            await db.insert(apiKeyBucketScopes).values(
              bucketIds.map((bucketId: string) => ({
                apiKeyId: newApiKey.id,
                bucketId,
              })),
            );
          }

          return Response.json(
            {
              apiKey: {
                id: newApiKey.id,
                name: newApiKey.name,
                canRead: newApiKey.canRead,
                canWrite: newApiKey.canWrite,
                scopeType: newApiKey.scopeType,
                scopeBucketIds: newApiKey.scopeBucketIds,
                createdAt: newApiKey.createdAt,
              },
              // IMPORTANT: Return the full key ONLY once at creation
              key: keyValue,
              warning: "Save this key securely. It will not be shown again.",
            },
            { status: 201 },
          );
        } catch (error: any) {
          return Response.json(
            {
              error: "Internal server error",
              details: error.message,
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
