import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/integrations/discord/authorize")({
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

          const clientId = process.env.DISCORD_CLIENT_ID;
          const redirectUri = `${process.env.APP_URL}/api/integrations/discord/callback`;

          if (!clientId) {
            return Response.json(
              { error: "Discord integration not configured" },
              { status: 500 },
            );
          }

          // Build Discord OAuth URL
          const discordAuthUrl = new URL(
            "https://discord.com/api/oauth2/authorize",
          );
          discordAuthUrl.searchParams.set("client_id", clientId);
          discordAuthUrl.searchParams.set("response_type", "code");
          discordAuthUrl.searchParams.set("scope", "webhook.incoming");
          discordAuthUrl.searchParams.set("redirect_uri", redirectUri);
          discordAuthUrl.searchParams.set("state", bucketId); // Pass bucketId in state

          // Redirect to Discord OAuth
          return Response.redirect(discordAuthUrl.toString(), 302);
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
