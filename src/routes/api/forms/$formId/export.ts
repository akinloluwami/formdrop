import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { submissions, forms } from "@/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/forms/$formId/export")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session?.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        const userId = session.user.id;
        const { formId } = params;

        const [form] = await db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, formId),
              eq(forms.userId, userId),
              isNull(forms.deletedAt),
            ),
          )
          .limit(1);

        if (!form) {
          return new Response("Form not found", { status: 404 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            // Write BOM for Excel compatibility
            controller.enqueue(encoder.encode("\uFEFF"));

            // Write Headers
            const csvHeaders = [
              "ID",
              "Created At",
              "IP",
              "User Agent",
              "Payload (JSON)",
            ];
            controller.enqueue(encoder.encode(csvHeaders.join(",") + "\n"));

            const limit = 100;
            let offset = 0;

            while (true) {
              const chunk = await db
                .select()
                .from(submissions)
                .where(
                  and(
                    eq(submissions.formId, formId),
                    isNull(submissions.deletedAt),
                  ),
                )
                .orderBy(desc(submissions.createdAt))
                .limit(limit)
                .offset(offset);

              if (chunk.length === 0) {
                break;
              }

              for (const sub of chunk) {
                const row = [
                  sub.id,
                  sub.createdAt.toISOString(),
                  sub.ip || "",
                  sub.userAgent || "",
                  JSON.stringify(sub.payload).replace(/"/g, '""'), // Escape quotes for CSV
                ];

                // Format as CSV line
                const line = row.map((field) => `"${field}"`).join(",") + "\n";
                controller.enqueue(encoder.encode(line));
              }

              offset += limit;
            }

            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="submissions-${form.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.csv"`,
          },
        });
      },
    },
  },
});
