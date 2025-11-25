import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { account, usage, subscriptions } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/user/settings")({
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

          // Check if user has a password set
          const [passwordAccount] = await db
            .select()
            .from(account)
            .where(and(eq(account.userId, userId), isNotNull(account.password)))
            .limit(1);

          const hasPassword = !!passwordAccount;

          // Get usage for current month
          const now = new Date();
          const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

          const usageRecords = await db
            .select()
            .from(usage)
            .where(and(eq(usage.userId, userId), eq(usage.period, period)));

          const totalSubmissions = usageRecords.reduce(
            (acc, curr) => acc + curr.count,
            0,
          );

          // Get subscription for limits
          const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId))
            .limit(1);

          const isPro = subscription?.status === "active";
          const limit = isPro ? 10000 : 100; // Hardcoded limits for now, ideally from config

          return Response.json({
            hasPassword,
            usage: {
              used: totalSubmissions,
              limit,
              period,
            },
            subscription: subscription || null,
          });
        } catch (error: any) {
          console.error(error);
          return Response.json(
            { error: "Failed to fetch user settings" },
            { status: 500 },
          );
        }
      },
    },
  },
});
