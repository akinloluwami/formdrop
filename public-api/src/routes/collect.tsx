import { Response, useRoute, Route } from "react-serve-js";
import { db } from "../db";
import {
  forms,
  submissions,
  usage,
  user,
  emailNotificationRecipients,
} from "../db/schema";
import { eq, and, sql, isNotNull } from "drizzle-orm";
import { config } from "dotenv";
import { parse } from "node:querystring";
import { sendEmailNotification } from "../lib/sendEmailNotification";
import {
  sendSlackNotification,
  sendDiscordNotification,
} from "../lib/sendWebhookNotification";
import { syncGoogleSheets } from "../lib/syncGoogleSheets";

config();

// Helper to check if domain is allowed for form
const isDomainAllowed = (origin: string, allowedDomains: string[]) => {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true; // Empty array means allow all
  }

  try {
    const originHost = new URL(origin).hostname;

    return allowedDomains.some((domain) => {
      // Support wildcards like *.example.com
      if (domain.startsWith("*.")) {
        const baseDomain = domain.slice(2);
        return originHost.endsWith(baseDomain);
      }
      return originHost === domain || origin.includes(domain);
    });
  } catch {
    return false;
  }
};

export const CollectRoute = () => (
  <Route path="/f/:slug" method="POST">
    {async () => {
      const { req, params } = useRoute();
      const { slug } = params as { slug: string };
      const origin = req.headers.origin || req.headers.referer || "";

      try {
        // Get form by slug
        const [form] = await db
          .select()
          .from(forms)
          .where(eq(forms.slug, slug))
          .limit(1);

        if (!form) {
          return <Response status={404} json={{ error: "Form not found" }} />;
        }

        if (form.deletedAt) {
          return <Response status={400} json={{ error: "Form is deleted" }} />;
        }

        // Check domain restrictions
        const allowedDomains = (form.allowedDomains as string[]) || [];
        if (origin && !isDomainAllowed(origin, allowedDomains)) {
          return (
            <Response
              status={403}
              json={{ error: "Domain not allowed for this form" }}
            />
          );
        }

        // Get owner details
        const [owner] = await db
          .select()
          .from(user)
          .where(eq(user.id, form.userId))
          .limit(1);

        let submissionData = (req.body || {}) as Record<string, any>;

        if (
          Object.keys(submissionData).length === 0 &&
          req.headers["content-type"]?.includes(
            "application/x-www-form-urlencoded",
          )
        ) {
          try {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const data = Buffer.concat(buffers).toString();
            // Convert null-prototype object to plain object
            submissionData = { ...parse(data) };
          } catch (e) {
            console.error("Failed to parse form body", e);
          }
        }

        if (!submissionData || Object.keys(submissionData).length === 0) {
          return (
            <Response
              status={400}
              json={{ error: "No submission data found" }}
            />
          );
        }

        // Create submission
        const [submission] = await db
          .insert(submissions)
          .values({
            formId: form.id,
            payload: submissionData,
            ip:
              (req.headers["x-forwarded-for"] as string) ||
              req.socket?.remoteAddress ||
              null,
            userAgent: (req.headers["user-agent"] as string) || null,
          })
          .returning();

        const period = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // Send email notification
        if (form.emailNotificationsEnabled) {
          const recipients = await db
            .select()
            .from(emailNotificationRecipients)
            .where(
              and(
                eq(emailNotificationRecipients.formId, form.id),
                eq(emailNotificationRecipients.enabled, true),
                isNotNull(emailNotificationRecipients.verifiedAt),
              ),
            );

          const allRecipients = [
            { email: owner.email }, // Owner always receives email if enabled (handled by form.emailNotificationsEnabled)
            ...recipients,
          ];

          // Deduplicate emails
          const uniqueEmails = [...new Set(allRecipients.map((r) => r.email))];

          console.log("Attempting to send email notification to:", {
            emails: uniqueEmails,
            formName: form.name,
            userId: form.userId,
          });

          // Non-blocking email sending
          Promise.all(
            uniqueEmails.map(async (email) => {
              try {
                await sendEmailNotification({
                  recipientEmail: email,
                  formName: form.name,
                  data: submissionData,
                  userId: form.userId,
                  formId: form.id,
                  submissionId: submission.id,
                  period,
                });
              } catch (error) {
                console.error(
                  `Failed to send email notification to ${email}:`,
                  error,
                );
              }
            }),
          );
        }

        // Send Slack notification
        if (form.slackNotificationsEnabled && form.slackWebhookUrl) {
          Promise.resolve().then(async () => {
            try {
              await sendSlackNotification({
                webhookUrl: form.slackWebhookUrl!,
                formName: form.name,
                data: submissionData,
                submissionId: submission.id,
                userId: form.userId,
                formId: form.id,
                period,
                channelName: form.slackChannelName,
              });
            } catch (error) {
              console.error("Failed to send Slack notification:", error);
            }
          });
        }

        // Send Discord notification
        if (form.discordNotificationsEnabled && form.discordWebhookUrl) {
          Promise.resolve().then(async () => {
            try {
              await sendDiscordNotification({
                webhookUrl: form.discordWebhookUrl!,
                formName: form.name,
                data: submissionData,
                submissionId: submission.id,
                userId: form.userId,
                formId: form.id,
                period,
                channelName: form.discordChannelName,
              });
            } catch (error) {
              console.error("Failed to send Discord notification:", error);
            }
          });
        }

        // Sync to Google Sheets
        if (
          form.googleSheetsEnabled &&
          form.googleSheetsSpreadsheetId &&
          form.googleSheetsAccessToken
        ) {
          Promise.resolve().then(async () => {
            try {
              await syncGoogleSheets({
                spreadsheetId: form.googleSheetsSpreadsheetId!,
                sheetId: form.googleSheetsSheetId,
                accessToken: form.googleSheetsAccessToken!,
                refreshToken: form.googleSheetsRefreshToken,
                tokenExpiry: form.googleSheetsTokenExpiry,
                submissionData,
                submissionId: submission.id,
                formId: form.id,
                userId: form.userId,
                formName: form.name,
              });
            } catch (error) {
              console.error("Failed to sync to Google Sheets:", error);
            }
          });
        }

        // Track usage
        await db
          .insert(usage)
          .values({
            userId: form.userId,
            formId: form.id,
            period,
            count: 1,
          })
          .onConflictDoUpdate({
            target: [usage.userId, usage.formId, usage.period],
            set: {
              count: sql`${usage.count} + 1`,
            },
          });

        return (
          <Response
            status={201}
            json={{
              success: true,
              submissionId: submission.id,
              message: "Submission received",
            }}
          />
        );
      } catch (error: any) {
        console.error("Submit error:", error);
        return (
          <Response
            status={500}
            json={{
              error: "Internal server error",
              details: error.message,
            }}
          />
        );
      }
    }}
  </Route>
);
