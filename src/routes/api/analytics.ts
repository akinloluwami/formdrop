import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets, submissions } from "@/db/schema";
import { eq, and, sql, gte, isNull, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import moment from "moment";

export const Route = createFileRoute("/api/analytics")({
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

          const userId = session.user.id;

          // Get total buckets
          const [bucketsResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(buckets)
            .where(and(eq(buckets.userId, userId), isNull(buckets.deletedAt)));

          // Get total submissions across all user buckets
          const [submissionsResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(submissions)
            .innerJoin(buckets, eq(submissions.bucketId, buckets.id))
            .where(
              and(
                eq(buckets.userId, userId),
                isNull(buckets.deletedAt),
                isNull(submissions.deletedAt),
              ),
            );

          // Get submissions for this month
          const startOfMonth = moment().startOf("month").toDate();
          const [thisMonthResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(submissions)
            .innerJoin(buckets, eq(submissions.bucketId, buckets.id))
            .where(
              and(
                eq(buckets.userId, userId),
                isNull(buckets.deletedAt),
                isNull(submissions.deletedAt),
                gte(submissions.createdAt, startOfMonth),
              ),
            );

          // Get submissions for the last 30 days for chart
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
            .innerJoin(buckets, eq(submissions.bucketId, buckets.id))
            .where(
              and(
                eq(buckets.userId, userId),
                isNull(buckets.deletedAt),
                isNull(submissions.deletedAt),
                gte(submissions.createdAt, thirtyDaysAgo),
              ),
            )
            .groupBy(sql`to_char(${submissions.createdAt}, 'YYYY-MM-DD')`)
            .orderBy(sql`to_char(${submissions.createdAt}, 'YYYY-MM-DD')`);

          // Fill in missing days
          const chartData = Array.from({ length: 30 }, (_, i) => {
            const date = moment().subtract(29 - i, "days");
            const dateStr = date.format("YYYY-MM-DD");
            const dayStat = dailyStats.find((s) => s.date === dateStr);
            return {
              date: date.format("MMM DD"),
              submissions: Number(dayStat?.count || 0),
            };
          });

          // Get top performing forms
          const topForms = await db
            .select({
              id: buckets.id,
              name: buckets.name,
              submissionCount: sql<number>`count(${submissions.id})`,
            })
            .from(buckets)
            .leftJoin(
              submissions,
              and(
                eq(buckets.id, submissions.bucketId),
                isNull(submissions.deletedAt),
              ),
            )
            .where(and(eq(buckets.userId, userId), isNull(buckets.deletedAt)))
            .groupBy(buckets.id, buckets.name)
            .orderBy(desc(sql`count(${submissions.id})`))
            .limit(5);

          return Response.json({
            stats: {
              totalBuckets: Number(bucketsResult?.count || 0),
              totalSubmissions: Number(submissionsResult?.count || 0),
              submissionsThisMonth: Number(thisMonthResult?.count || 0),
            },
            chartData,
            topForms: topForms.map((f) => ({
              ...f,
              submissionCount: Number(f.submissionCount),
            })),
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
