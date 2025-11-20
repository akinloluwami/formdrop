import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { submissions, buckets } from "@/db/schema";
import { eq, and, desc, isNull, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/buckets/$bucketId/submissions")({
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

          const allSubmissions = await db
            .select()
            .from(submissions)
            .where(
              and(
                eq(submissions.bucketId, bucketId),
                isNull(submissions.deletedAt),
              ),
            )
            .orderBy(desc(submissions.createdAt));

          return Response.json({ submissions: allSubmissions });
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
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const { bucketId } = params;
          const { submissionIds } = await request.json();

          if (
            !submissionIds ||
            !Array.isArray(submissionIds) ||
            submissionIds.length === 0
          ) {
            return Response.json(
              { error: "Invalid submission IDs" },
              { status: 400 },
            );
          }

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
            .update(submissions)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(submissions.bucketId, bucketId),
                inArray(submissions.id, submissionIds),
              ),
            );

          return Response.json({ success: true });
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
