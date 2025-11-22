import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/buckets/$bucketId")({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { bucketId: string };
      }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const { bucketId } = params;

          const [bucket] = await db
            .select()
            .from(buckets)
            .where(
              and(
                eq(buckets.id, bucketId),
                eq(buckets.userId, userId),
                isNull(buckets.deletedAt),
              ),
            )
            .limit(1);

          if (!bucket) {
            return Response.json(
              { error: "Bucket not found" },
              { status: 404 },
            );
          }

          return Response.json({ bucket });
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
        params: { bucketId: string };
      }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const { bucketId } = params;

          const body = await request.json();
          const {
            name,
            description,
            allowedDomains,
            emailNotificationsEnabled,
          } = body;

          // Verify bucket belongs to user
          const [existingBucket] = await db
            .select()
            .from(buckets)
            .where(
              and(
                eq(buckets.id, bucketId),
                eq(buckets.userId, userId),
                isNull(buckets.deletedAt),
              ),
            )
            .limit(1);

          if (!existingBucket) {
            return Response.json(
              { error: "Bucket not found" },
              { status: 404 },
            );
          }

          const [updatedBucket] = await db
            .update(buckets)
            .set({
              name: name ?? existingBucket.name,
              description: description ?? existingBucket.description,
              allowedDomains: allowedDomains ?? existingBucket.allowedDomains,
              emailNotificationsEnabled:
                emailNotificationsEnabled ??
                existingBucket.emailNotificationsEnabled,
              updatedAt: new Date(),
            })
            .where(eq(buckets.id, bucketId))
            .returning();

          return Response.json({ bucket: updatedBucket });
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
        params: { bucketId: string };
      }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const userId = session.user.id;
          const { bucketId } = params;

          // Verify bucket belongs to user
          const [bucket] = await db
            .select()
            .from(buckets)
            .where(
              and(
                eq(buckets.id, bucketId),
                eq(buckets.userId, userId),
                isNull(buckets.deletedAt),
              ),
            )
            .limit(1);

          if (!bucket) {
            return Response.json(
              { error: "Bucket not found" },
              { status: 404 },
            );
          }

          await db
            .update(buckets)
            .set({ deletedAt: new Date() })
            .where(eq(buckets.id, bucketId));

          return Response.json({ message: "Bucket deleted" });
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
