import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { submissions, buckets } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute(
  "/api/buckets/$bucketId/submissions/$submissionId",
)({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { bucketId: string; submissionId: string };
      }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const { bucketId, submissionId } = params;

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

          const [submission] = await db
            .select()
            .from(submissions)
            .where(
              and(
                eq(submissions.id, submissionId),
                eq(submissions.bucketId, bucketId),
              ),
            )
            .limit(1);

          if (!submission) {
            return Response.json(
              { error: "Submission not found" },
              { status: 404 },
            );
          }

          return Response.json({ submission });
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
        params: { bucketId: string; submissionId: string };
      }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const { bucketId, submissionId } = params;

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

          // Verify submission exists in this bucket
          const [submission] = await db
            .select()
            .from(submissions)
            .where(
              and(
                eq(submissions.id, submissionId),
                eq(submissions.bucketId, bucketId),
              ),
            )
            .limit(1);

          if (!submission) {
            return Response.json(
              { error: "Submission not found" },
              { status: 404 },
            );
          }

          await db.delete(submissions).where(eq(submissions.id, submissionId));

          return Response.json({ message: "Submission deleted" });
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
