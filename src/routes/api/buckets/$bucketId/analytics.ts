import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets, usage } from "@/db/schema";
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
            .select({ count: sql<number>`sum(${usage.count})` })
            .from(usage)
            .where(eq(usage.bucketId, bucketId));

          // Get this month's submissions
          const startOfMonthStr = moment()
            .startOf("month")
            .format("YYYY-MM-DD");
          const [monthResult] = await db
            .select({ count: sql<number>`sum(${usage.count})` })
            .from(usage)
            .where(
              and(
                eq(usage.bucketId, bucketId),
                gte(usage.period, startOfMonthStr),
              ),
            );

          // Get today's submissions
          const todayStr = moment().format("YYYY-MM-DD");
          const [todayResult] = await db
            .select({ count: sql<number>`sum(${usage.count})` })
            .from(usage)
            .where(
              and(eq(usage.bucketId, bucketId), eq(usage.period, todayStr)),
            );

          // Get chart data (last 30 days)
          const thirtyDaysAgoStr = moment()
            .subtract(29, "days")
            .format("YYYY-MM-DD");

          const dailyStats = await db
            .select({
              date: usage.period,
              count: sql<number>`sum(${usage.count})`,
            })
            .from(usage)
            .where(
              and(
                eq(usage.bucketId, bucketId),
                gte(usage.period, thirtyDaysAgoStr),
              ),
            )
            .groupBy(usage.period)
            .orderBy(usage.period);

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
