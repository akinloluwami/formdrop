import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute(
  "/api/integrations/google-sheets/configure",
)({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const body = await request.json();
          const { bucketId, spreadsheetId, spreadsheetName } = body;

          if (!bucketId || !spreadsheetId || !spreadsheetName) {
            return Response.json(
              {
                error:
                  "bucketId, spreadsheetId, and spreadsheetName are required",
              },
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

          if (!bucket.googleSheetsAccessToken) {
            return Response.json(
              { error: "Google Sheets not connected" },
              { status: 400 },
            );
          }

          // Update bucket with spreadsheet info and enable integration
          await db
            .update(buckets)
            .set({
              googleSheetsSpreadsheetId: spreadsheetId,
              googleSheetsSpreadsheetName: spreadsheetName,
              googleSheetsEnabled: true,
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
