import { db } from "../db";
import { events, notificationUsage } from "../db/schema";
import { sql } from "drizzle-orm";

interface SendEmailNotificationParams {
  recipientEmail: string;
  bucketName: string;
  data: Record<string, any>;
  userId: string;
  bucketId: string;
  submissionId: string;
  period: string;
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function sendEmailNotification({
  recipientEmail,
  bucketName,
  data,
  userId,
  bucketId,
  submissionId,
  period,
}: SendEmailNotificationParams): Promise<void> {
  try {
    // Validate email before sending
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      console.error("Invalid email address:", {
        recipientEmail,
        bucketName,
        submissionId,
      });
      throw new Error(`Invalid email address: ${recipientEmail}`);
    }

    const response = await fetch("https://api.useplunk.com/v1/send", {
      method: "POST",
      body: JSON.stringify({
        to: recipientEmail,
        subject: `New submission for ${bucketName}`,
        from: process.env.NOTIFICATION_SENDER_EMAIL,
        body: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #18181b;">New Submission for ${bucketName}</h2>
            <p style="color: #52525b;">You have received a new submission:</p>
            <div style="background: #f4f4f5; padding: 24px; border-radius: 12px; margin-top: 20px;">
              ${Object.entries(data)
                .map(
                  ([key, value]) => `
                <div style="margin-bottom: 16px;">
                  <div style="font-weight: 600; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${key}</div>
                  <div style="color: #18181b; font-size: 16px; white-space: pre-wrap;">${
                    Array.isArray(value)
                      ? value.join(", ")
                      : typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : value
                  }</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PLUNK_API_KEY}`,
      },
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Plunk API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        recipientEmail,
        bucketName,
        submissionId,
      });

      throw new Error(`Plunk API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Email sent successfully:", {
      recipientEmail,
      bucketName,
      submissionId,
      response: responseData,
    });

    // Record notification event
    await db.insert(events).values({
      userId,
      bucketId,
      eventType: "notification_sent",
      details: {
        type: "email",
        target: recipientEmail,
        submissionId,
      },
    });

    // Track notification usage
    await db
      .insert(notificationUsage)
      .values({
        userId,
        bucketId,
        period,
        type: "email",
        count: 1,
      })
      .onConflictDoUpdate({
        target: [
          notificationUsage.userId,
          notificationUsage.bucketId,
          notificationUsage.period,
          notificationUsage.type,
        ],
        set: {
          count: sql`${notificationUsage.count} + 1`,
        },
      });
  } catch (error) {
    console.error("Failed to send email notification:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      recipientEmail,
      bucketName,
      submissionId,
    });

    // Don't fail the request if email fails
    throw error;
  }
}
