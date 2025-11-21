import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import crypto from "crypto";

const generateApiKey = (type: "public" | "private") => {
  if (type === "public") {
    return `fd_pk_${crypto.randomBytes(7).toString("hex")}`;
  }
  return `fd_sk_${crypto.randomBytes(24).toString("hex")}`;
};

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

          // Get existing keys
          const userApiKeys = await db
            .select()
            .from(apiKeys)
            .where(eq(apiKeys.userId, userId));

          let publicKey = userApiKeys.find((k) => k.type === "public");
          let privateKey = userApiKeys.find((k) => k.type === "private");

          // Create missing keys if necessary
          const keysToInsert = [];
          if (!publicKey) {
            keysToInsert.push({
              userId,
              key: generateApiKey("public"),
              type: "public" as const,
            });
          }
          if (!privateKey) {
            keysToInsert.push({
              userId,
              key: generateApiKey("private"),
              type: "private" as const,
            });
          }

          if (keysToInsert.length > 0) {
            const newKeys = await db
              .insert(apiKeys)
              .values(keysToInsert)
              .returning();

            if (!publicKey)
              publicKey = newKeys.find((k) => k.type === "public");
            if (!privateKey)
              privateKey = newKeys.find((k) => k.type === "private");
          }

          return Response.json({
            keys: {
              public: publicKey,
              private: privateKey,
            },
          });
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
          const { type } = body;

          if (type !== "public" && type !== "private") {
            return Response.json(
              { error: "Invalid key type" },
              { status: 400 },
            );
          }

          const newKey = generateApiKey(type);

          const [updatedKey] = await db
            .update(apiKeys)
            .set({
              key: newKey,
              createdAt: new Date(), // Reset created at on roll
            })
            .where(and(eq(apiKeys.userId, userId), eq(apiKeys.type, type)))
            .returning();

          return Response.json({ key: updatedKey });
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
