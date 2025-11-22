import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute(
  "/api/buckets/$bucketId/disconnect-slack",
)({
  server: {
    handlers: {
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

          // Clear Slack integration
          await db
            .update(buckets)
            .set({
              slackWebhookUrl: null,
              slackChannelId: null,
              slackChannelName: null,
              slackTeamName: null,
              slackNotificationsEnabled: false,
            })
            .where(eq(buckets.id, bucketId));

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
