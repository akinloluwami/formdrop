import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

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

          // TODO: Implement token refresh if expired
          const accessToken = bucket.googleSheetsAccessToken;

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
