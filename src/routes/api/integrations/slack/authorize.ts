import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { isUserPro } from "@/lib/subscription-check";

export const Route = createFileRoute("/api/integrations/slack/authorize")({
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

          const url = new URL(request.url);
          const bucketId = url.searchParams.get("bucketId");

          if (!bucketId) {
            return Response.json(
              { error: "bucketId is required" },
              { status: 400 },
            );
          }

          const isPro = await isUserPro(session.user.id);
          if (!isPro) {
            return Response.redirect(
              `${url.origin}/app/forms/${bucketId}/notifications?error=requires_pro`,
            );
          }

          // Verify bucket belongs to user
          const [bucket] = await db
            .select()
            .from(buckets)
            .where(
              and(
                eq(buckets.id, bucketId),
                eq(buckets.userId, session.user.id),
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

          const clientId = process.env.SLACK_CLIENT_ID;
          const redirectUri = `${process.env.APP_URL}/api/integrations/slack/callback`;

          if (!clientId) {
            return Response.json(
              { error: "Slack integration not configured" },
              { status: 500 },
            );
          }

          // Build Slack OAuth URL
          const slackAuthUrl = new URL("https://slack.com/oauth/v2/authorize");
          slackAuthUrl.searchParams.set("client_id", clientId);
          slackAuthUrl.searchParams.set("scope", "incoming-webhook");
          slackAuthUrl.searchParams.set("redirect_uri", redirectUri);
          slackAuthUrl.searchParams.set("state", bucketId); // Pass bucketId in state

          // Redirect to Slack OAuth
          return Response.redirect(slackAuthUrl.toString(), 302);
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
