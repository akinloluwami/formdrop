import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { apiKeys, apiKeyBucketScopes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/api-keys/$keyId")({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { keyId: string };
      }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const { keyId } = params;

          const [apiKey] = await db
            .select()
            .from(apiKeys)
            .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
            .limit(1);

          if (!apiKey) {
            return Response.json(
              { error: "API key not found" },
              { status: 404 },
            );
          }

          // Mask the key for security
          const maskedKey = {
            ...apiKey,
            key: apiKey.key.substring(0, 10) + "..." + apiKey.key.slice(-4),
          };

          return Response.json({ apiKey: maskedKey });
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

      PATCH: async ({
        request,
        params,
      }: {
        request: Request;
        params: { keyId: string };
      }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const { keyId } = params;

          const body = await request.json();
          const { name, canRead, canWrite, scopeType, bucketIds } = body;

          // Verify API key belongs to user
          const [existingKey] = await db
            .select()
            .from(apiKeys)
            .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
            .limit(1);

          if (!existingKey) {
            return Response.json(
              { error: "API key not found" },
              { status: 404 },
            );
          }

          // Update API key
          const [updatedKey] = await db
            .update(apiKeys)
            .set({
              name: name ?? existingKey.name,
              canRead: canRead ?? existingKey.canRead,
              canWrite: canWrite ?? existingKey.canWrite,
              scopeType: scopeType ?? existingKey.scopeType,
              scopeBucketIds:
                scopeType === "restricted" && bucketIds
                  ? bucketIds
                  : scopeType === "all"
                    ? null
                    : existingKey.scopeBucketIds,
            })
            .where(eq(apiKeys.id, keyId))
            .returning();

          // Update bucket scopes if needed
          if (scopeType === "restricted" && bucketIds) {
            // Delete existing scopes
            await db
              .delete(apiKeyBucketScopes)
              .where(eq(apiKeyBucketScopes.apiKeyId, keyId));

            // Insert new scopes
            if (bucketIds.length > 0) {
              await db.insert(apiKeyBucketScopes).values(
                bucketIds.map((bucketId: string) => ({
                  apiKeyId: keyId,
                  bucketId,
                })),
              );
            }
          }

          // Mask the key for security
          const maskedKey = {
            ...updatedKey,
            key:
              updatedKey.key.substring(0, 10) +
              "..." +
              updatedKey.key.slice(-4),
          };

          return Response.json({ apiKey: maskedKey });
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

      DELETE: async ({
        request,
        params,
      }: {
        request: Request;
        params: { keyId: string };
      }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const { keyId } = params;

          // Verify API key belongs to user
          const [apiKey] = await db
            .select()
            .from(apiKeys)
            .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
            .limit(1);

          if (!apiKey) {
            return Response.json(
              { error: "API key not found" },
              { status: 404 },
            );
          }

          await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

          return Response.json({ message: "API key deleted" });
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
