import { db } from "../db";
import { buckets } from "../db/schema";
import { eq } from "drizzle-orm";

interface SyncGoogleSheetsParams {
  spreadsheetId: string;
  sheetId?: string | null;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiry?: Date | null;
  submissionData: Record<string, any>;
  submissionId: string;
  bucketId: string;
  userId: string;
  bucketName?: string;
}

interface TokenRefreshResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Refresh Google OAuth access token
 */
async function refreshAccessToken(
  refreshToken: string,
  bucketId: string,
): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Token refresh failed:", error);
    throw new Error("Failed to refresh Google access token");
  }

  const data: TokenRefreshResponse = await response.json();
  const newAccessToken = data.access_token;
  const expiresIn = data.expires_in;
  const newTokenExpiry = new Date(Date.now() + expiresIn * 1000);

  // Update bucket with new token
  await db
    .update(buckets)
    .set({
      googleSheetsAccessToken: newAccessToken,
      googleSheetsTokenExpiry: newTokenExpiry,
    })
    .where(eq(buckets.id, bucketId));

  return newAccessToken;
}

/**
 * Get valid access token, refreshing if necessary
 */
async function getValidAccessToken(
  accessToken: string,
  refreshToken: string | null | undefined,
  tokenExpiry: Date | null | undefined,
  bucketId: string,
): Promise<string> {
  // Check if token is expired or about to expire (within 5 minutes)
  const now = new Date();
  const expiryThreshold = new Date(now.getTime() + 5 * 60 * 1000);

  if (tokenExpiry && new Date(tokenExpiry) < expiryThreshold) {
    if (!refreshToken) {
      throw new Error("Access token expired and no refresh token available");
    }
    console.log("Access token expired, refreshing...");
    return await refreshAccessToken(refreshToken, bucketId);
  }

  return accessToken;
}

/**
 * Get or create header row in spreadsheet
 */
async function ensureHeaders(
  spreadsheetId: string,
  sheetName: string,
  headers: string[],
  accessToken: string,
): Promise<void> {
  // Get current values in first row
  const range = `${sheetName}!A1:ZZ1`;
  const getResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!getResponse.ok) {
    console.error("Failed to get headers:", await getResponse.text());
    throw new Error("Failed to check spreadsheet headers");
  }

  const getData = await getResponse.json();
  const existingHeaders = getData.values?.[0] || [];

  // If headers exist and match, we're good
  if (existingHeaders.length > 0) {
    return; // Headers already exist
  }

  // Set headers if they don't exist
  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [headers],
      }),
    },
  );

  if (!updateResponse.ok) {
    console.error("Failed to set headers:", await updateResponse.text());
    throw new Error("Failed to set spreadsheet headers");
  }
}

/**
 * Append submission data to Google Sheet
 */
export async function syncGoogleSheets({
  spreadsheetId,
  sheetId,
  accessToken,
  refreshToken,
  tokenExpiry,
  submissionData,
  submissionId,
  bucketId,
  userId,
  bucketName,
}: SyncGoogleSheetsParams) {
  try {
    // Get valid access token (refresh if needed)
    const validToken = await getValidAccessToken(
      accessToken,
      refreshToken,
      tokenExpiry,
      bucketId,
    );

    // Get spreadsheet info to find sheet name
    const spreadsheetResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      },
    );

    if (!spreadsheetResponse.ok) {
      throw new Error("Failed to fetch spreadsheet info");
    }

    const spreadsheetInfo = await spreadsheetResponse.json();
    const sheet = spreadsheetInfo.sheets?.[0];
    const sheetName = sheet?.properties?.title || "Sheet1";

    // Prepare headers and values
    const headers = [
      "Submission ID",
      "Timestamp",
      ...Object.keys(submissionData),
    ];

    const values = [
      submissionId,
      new Date().toISOString(),
      ...Object.keys(submissionData).map((key) => {
        const value = submissionData[key];
        if (typeof value === "object") {
          return JSON.stringify(value);
        }
        return String(value);
      }),
    ];

    // Ensure headers exist
    await ensureHeaders(spreadsheetId, sheetName, headers, validToken);

    // Append the row
    const range = `${sheetName}!A:ZZ`;
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${validToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [values],
        }),
      },
    );

    if (!appendResponse.ok) {
      const error = await appendResponse.text();
      console.error("Failed to append row:", error);
      throw new Error("Failed to append row to spreadsheet");
    }

    console.log(
      `Successfully synced submission ${submissionId} to Google Sheets`,
    );

    // TODO: Record integration sync event/usage
    // Similar to recordNotificationUsage but for integrations

    return { success: true };
  } catch (error: any) {
    console.error("Google Sheets sync error:", error);
    // Don't throw - we don't want to fail the submission if sync fails
    return { success: false, error: error.message };
  }
}
