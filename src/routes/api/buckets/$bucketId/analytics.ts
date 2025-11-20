import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { submissions, buckets } from "@/db/schema";
import { eq, and, sql, gte, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import moment from "moment";

export const Route = createFileRoute("/api/buckets/$bucketId/analytics")({
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

          // Get total submissions
          const [totalResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(submissions)
            .where(
              and(
                eq(submissions.bucketId, bucketId),
                isNull(submissions.deletedAt),
              ),
            );

          // Get this month's submissions
          const startOfMonth = moment().startOf("month").toDate();
          const [monthResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(submissions)
            .where(
              and(
                eq(submissions.bucketId, bucketId),
                gte(submissions.createdAt, startOfMonth),
                isNull(submissions.deletedAt),
              ),
            );

          // Get today's submissions
          const startOfDay = moment().startOf("day").toDate();
          const [todayResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(submissions)
            .where(
              and(
                eq(submissions.bucketId, bucketId),
                gte(submissions.createdAt, startOfDay),
                isNull(submissions.deletedAt),
              ),
            );

          // Get chart data (last 30 days)
          const thirtyDaysAgo = moment()
            .subtract(29, "days")
            .startOf("day")
            .toDate();

          const dailyStats = await db
            .select({
              date: sql<string>`to_char(${submissions.createdAt}, 'YYYY-MM-DD')`,
              count: sql<number>`count(*)`,
            })
            .from(submissions)
            .where(
              and(
                eq(submissions.bucketId, bucketId),
                gte(submissions.createdAt, thirtyDaysAgo),
                isNull(submissions.deletedAt),
              ),
            )
            .groupBy(sql`to_char(${submissions.createdAt}, 'YYYY-MM-DD')`)
            .orderBy(sql`to_char(${submissions.createdAt}, 'YYYY-MM-DD')`);

          // Fill in missing days
          const chartData = Array.from({ length: 30 }, (_, i) => {
            const date = moment().subtract(29 - i, "days");
            const dateStr = date.format("YYYY-MM-DD");
            const stat = dailyStats.find((s) => s.date === dateStr);
            return {
              date: date.format("MMM DD"),
              submissions: stat ? Number(stat.count) : 0,
            };
          });

          return Response.json({
            stats: {
              total: Number(totalResult.count),
              thisMonth: Number(monthResult.count),
              today: Number(todayResult.count),
            },
            chartData,
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
