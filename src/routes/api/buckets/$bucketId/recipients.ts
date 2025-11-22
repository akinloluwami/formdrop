import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets, emailNotificationRecipients } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { Resend } from "resend";
import { RecipientVerificationEmail } from "@/emails/RecipientVerificationEmail";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export const Route = createFileRoute("/api/buckets/$bucketId/recipients")({
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

          const recipients = await db
            .select()
            .from(emailNotificationRecipients)
            .where(eq(emailNotificationRecipients.bucketId, bucketId));

          return Response.json({ recipients });
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

      POST: async ({
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
          const { email } = await request.json();

          if (!email) {
            return Response.json(
              { error: "Email is required" },
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

          // Generate verification token
          const verificationToken = crypto.randomBytes(32).toString("hex");
          const verificationTokenExpiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ); // 24 hours

          const [recipient] = await db
            .insert(emailNotificationRecipients)
            .values({
              bucketId,
              email,
              verificationToken,
              verificationTokenExpiresAt,
            })
            .returning();

          // Send verification email
          const baseUrl =
            process.env.BETTER_AUTH_URL || "http://localhost:1200";
          const verificationUrl = `${baseUrl}/verify-recipient?token=${verificationToken}`;

          try {
            const { error, data } = await resend.emails.send({
              from: "FormDrop <onboarding@mail.formdrop.co>",
              to: email,
              subject: `Verify your email for ${bucket.name} notifications`,
              react: RecipientVerificationEmail({
                verificationUrl,
                bucketName: bucket.name,
              }),
            });

            if (data) {
              console.log("Resend response data:", data);
            }

            if (error) {
              throw new Error(`Resend error: ${error.message}`);
            }
          } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Don't fail the request if email fails, recipient can be re-sent verification later
          }

          return Response.json({ recipient });
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
