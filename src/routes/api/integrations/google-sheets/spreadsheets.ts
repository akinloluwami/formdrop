import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { refreshGoogleSheetsToken } from "@/lib/google-sheets";

export const Route = createFileRoute(
  "/api/integrations/google-sheets/spreadsheets",
)({
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

          // Get bucket with tokens
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

          if (!bucket.googleSheetsAccessToken) {
            return Response.json(
              { error: "Google Sheets not connected" },
              { status: 400 },
            );
          }

          // Check if token is expired or about to expire (within 5 minutes)
          let accessToken = bucket.googleSheetsAccessToken;
          const isExpired =
            bucket.googleSheetsTokenExpiry &&
            new Date(bucket.googleSheetsTokenExpiry).getTime() - 5 * 60 * 1000 <
              Date.now();

          if (isExpired && bucket.googleSheetsRefreshToken) {
            try {
              const { accessToken: newAccessToken, expiresIn } =
                await refreshGoogleSheetsToken(bucket.googleSheetsRefreshToken);

              accessToken = newAccessToken;
              const newExpiry = new Date(Date.now() + expiresIn * 1000);

              // Update bucket with new token
              await db
                .update(buckets)
                .set({
                  googleSheetsAccessToken: newAccessToken,
                  googleSheetsTokenExpiry: newExpiry,
                })
                .where(eq(buckets.id, bucketId));
            } catch (error) {
              console.error("Failed to refresh Google Sheets token:", error);
              // Continue with old token if refresh fails, or return error
              // For now we'll try to proceed, but it will likely fail at the API call
            }
          }

          // List spreadsheets from Google Drive
          const response = await fetch(
            "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&pageSize=50&fields=files(id,name,modifiedTime)",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

          if (!response.ok) {
            const error = await response.json();
            return Response.json(
              { error: "Failed to fetch spreadsheets", details: error },
              { status: response.status },
            );
          }

          const data = await response.json();

          return Response.json({
            spreadsheets: data.files || [],
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
    },
  },
});
