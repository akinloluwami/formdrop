import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { buckets, emailNotificationRecipients } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { Resend } from "resend";
import { RecipientVerificationEmail } from "@/emails/RecipientVerificationEmail";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export const Route = createFileRoute(
  "/api/buckets/$bucketId/recipients/$recipientId/resend-verification",
)({
  server: {
    handlers: {
      POST: async ({
        request,
        params,
      }: {
        request: Request;
        params: { bucketId: string; recipientId: string };
      }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const userId = session.user.id;
          const { bucketId, recipientId } = params;

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

          // Get recipient
          const [recipient] = await db
            .select()
            .from(emailNotificationRecipients)
            .where(
              and(
                eq(emailNotificationRecipients.id, recipientId),
                eq(emailNotificationRecipients.bucketId, bucketId),
              ),
            )
            .limit(1);

          if (!recipient) {
            return Response.json(
              { error: "Recipient not found" },
              { status: 404 },
            );
          }

          // Check if already verified
          if (recipient.verifiedAt) {
            return Response.json(
              { error: "Recipient already verified" },
              { status: 400 },
            );
          }

          // Generate new verification token
          const verificationToken = crypto.randomBytes(32).toString("hex");
          const verificationTokenExpiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ); // 24 hours

          // Update recipient with new token
          await db
            .update(emailNotificationRecipients)
            .set({
              verificationToken,
              verificationTokenExpiresAt,
            })
            .where(eq(emailNotificationRecipients.id, recipientId));

          // Send verification email
          const verificationUrl = `${process.env.APP_URL}/verify-recipient?token=${verificationToken}`;

          try {
            await resend.emails.send({
              from: "FormDrop <noreply@formdrop.io>",
              to: recipient.email,
              subject: "Verify your email for FormDrop notifications",
              react: RecipientVerificationEmail({
                verificationUrl,
                bucketName: bucket.name,
              }),
            });
          } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Don't fail the request if email fails
          }

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
