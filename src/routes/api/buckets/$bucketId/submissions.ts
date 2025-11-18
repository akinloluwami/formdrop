import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { submissions, buckets } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
            .where(and(eq(buckets.id, bucketId), eq(buckets.userId, userId)))
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
            .where(eq(submissions.bucketId, bucketId))
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
    },
  },
});
