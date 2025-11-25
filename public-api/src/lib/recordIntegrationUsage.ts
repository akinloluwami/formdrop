import { db } from "../db";
import { events } from "../db/schema";

interface RecordIntegrationParams {
  userId: string;
  bucketId: string;
  submissionId: string;
  integration: "google-sheets" | "airtable";
}

export async function recordIntegrationUsage({
  userId,
  bucketId,
  submissionId,
  integration,
}: RecordIntegrationParams): Promise<void> {
  try {
    // Record integration sync event
    await db.insert(events).values({
      userId,
      bucketId,
      eventType: "integration_synced",
      details: {
        integration,
        submissionId,
      },
    });
  } catch (error) {
    console.error("Failed to record integration usage:", error);
    // Don't throw, just log error
  }
}
