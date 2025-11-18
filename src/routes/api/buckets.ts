import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/buckets")({
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

          const userBuckets = await db
            .select()
            .from(buckets)
            .where(eq(buckets.userId, userId))
            .orderBy(desc(buckets.createdAt));

          return Response.json({ buckets: userBuckets });
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
          const { name, description, allowedDomains } = body;

          if (!name) {
            return Response.json(
              { error: "Bucket name is required" },
              { status: 400 },
            );
          }

          const [bucket] = await db
            .insert(buckets)
            .values({
              userId,
              name,
              description: description || null,
              allowedDomains: allowedDomains || [],
            })
            .returning();

          return Response.json({ bucket }, { status: 201 });
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
