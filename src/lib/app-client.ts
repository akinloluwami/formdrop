import axios from "axios";

const apiClient = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  headers: {
    "Content-Type": "application/json",
  },
});

interface Bucket {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  emailNotificationsEnabled: boolean;
  slackWebhookUrl: string | null;
  slackChannelId: string | null;
  slackChannelName: string | null;
  slackTeamName: string | null;
  slackNotificationsEnabled: boolean;
  discordWebhookUrl: string | null;
  discordChannelId: string | null;
  discordChannelName: string | null;
  discordGuildName: string | null;
  discordNotificationsEnabled: boolean;
  googleSheetsAccessToken: string | null;
  googleSheetsRefreshToken: string | null;
  googleSheetsTokenExpiry: Date | null;
  googleSheetsSpreadsheetId: string | null;
  googleSheetsSpreadsheetName: string | null;
  googleSheetsSheetId: string | null;
  googleSheetsEnabled: boolean;
  airtableAccessToken: string | null;
  airtableRefreshToken: string | null;
  airtableTokenExpiry: Date | null;
  airtableBaseId: string | null;
  airtableBaseName: string | null;
  airtableTableId: string | null;
  airtableTableName: string | null;
  airtableEnabled: boolean;
  allowedDomains: string[];
  createdAt: Date;
  updatedAt: Date;
  submissionCount: number;
}

interface Recipient {
  id: string;
  bucketId: string;
  email: string;
  enabled: boolean;
  verifiedAt: Date | null;
  verificationToken: string | null;
  verificationTokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Submission {
  id: string;
  bucketId: string;
  payload: Record<string, any>;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

interface ApiKey {
  id: string;
  userId: string;
  key: string;
  type: "public" | "private";
  lastUsedAt: Date | null;
  createdAt: Date;
}

interface CreateBucketParams {
  name: string;
  description?: string;
  allowedDomains?: string[];
}

interface UpdateBucketParams {
  name?: string;
  description?: string;
  emailNotificationsEnabled?: boolean;
  slackNotificationsEnabled?: boolean;
  discordNotificationsEnabled?: boolean;
  googleSheetsEnabled?: boolean;
  airtableEnabled?: boolean;
  allowedDomains?: string[];
}

interface RollApiKeyParams {
  type: "public" | "private";
}

type SuccessResponse<T> = T;
type ErrorResponse = { error: string; details?: string };
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Helper function to handle API calls with consistent error handling
async function apiCall<T = any>(
  method: "get" | "post" | "patch" | "delete",
  url: string,
  options?: { params?: any; data?: any },
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient[method](
      url,
      options?.params ? { params: options.params } : options?.data,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    return { error: "An unexpected error occurred" };
  }
}

export const appClient = {
  buckets: {
    list: async () => apiCall<{ buckets: Bucket[] }>("get", "/api/buckets"),

    create: async (params: CreateBucketParams) =>
      apiCall<{ bucket: Bucket }>("post", "/api/buckets", { data: params }),

    get: async (bucketId: string) =>
      apiCall<{ bucket: Bucket }>("get", `/api/buckets/${bucketId}`),

    update: async (bucketId: string, params: UpdateBucketParams) =>
      apiCall<{ bucket: Bucket }>("patch", `/api/buckets/${bucketId}`, {
        data: params,
      }),

    delete: async (bucketId: string) =>
      apiCall<{ message: string }>("delete", `/api/buckets/${bucketId}`),
  },

  recipients: {
    list: async (bucketId: string) =>
      apiCall<{ recipients: Recipient[] }>(
        "get",
        `/api/buckets/${bucketId}/recipients`,
      ),

    add: async (bucketId: string, email: string) =>
      apiCall<{ recipient: Recipient }>(
        "post",
        `/api/buckets/${bucketId}/recipients`,
        { data: { email } },
      ),

    remove: async (bucketId: string, recipientId: string) =>
      apiCall<{ success: boolean }>(
        "delete",
        `/api/buckets/${bucketId}/recipients/${recipientId}`,
      ),

    update: async (bucketId: string, recipientId: string, enabled: boolean) =>
      apiCall<{ recipient: Recipient }>(
        "patch",
        `/api/buckets/${bucketId}/recipients/${recipientId}`,
        { data: { enabled } },
      ),

    resendVerification: async (bucketId: string, recipientId: string) =>
      apiCall<{ success: boolean }>(
        "post",
        `/api/buckets/${bucketId}/recipients/${recipientId}/resend-verification`,
      ),

    disconnectSlack: async (bucketId: string) =>
      apiCall<{ success: boolean }>(
        "delete",
        `/api/buckets/${bucketId}/disconnect-slack`,
      ),

    disconnectDiscord: async (bucketId: string) =>
      apiCall<{ success: boolean }>(
        "delete",
        `/api/buckets/${bucketId}/disconnect-discord`,
      ),
  },

  submissions: {
    list: async (bucketId: string) =>
      apiCall<{ submissions: Submission[] }>(
        "get",
        `/api/buckets/${bucketId}/submissions`,
      ),

    get: async (bucketId: string, submissionId: string) =>
      apiCall<{ submission: Submission }>(
        "get",
        `/api/buckets/${bucketId}/submissions/${submissionId}`,
      ),

    delete: async (bucketId: string, submissionId: string) =>
      apiCall<{ message: string }>(
        "delete",
        `/api/buckets/${bucketId}/submissions/${submissionId}`,
      ),

    bulkDelete: async (bucketId: string, submissionIds: string[]) =>
      apiCall<{ success: boolean }>(
        "delete",
        `/api/buckets/${bucketId}/submissions`,
        { data: { submissionIds } },
      ),

    analytics: async (bucketId: string) =>
      apiCall<{
        stats: { total: number; thisMonth: number; today: number };
        chartData: { date: string; submissions: number }[];
      }>("get", `/api/buckets/${bucketId}/analytics`),
  },

  apiKeys: {
    list: async () =>
      apiCall<{ keys: { public: ApiKey; private: ApiKey } }>(
        "get",
        "/api/api-keys",
      ),

    roll: async (params: RollApiKeyParams) =>
      apiCall<{ key: ApiKey }>("post", "/api/api-keys", { data: params }),
  },

  analytics: {
    get: async () =>
      apiCall<{
        stats: {
          totalBuckets: number;
          totalSubmissions: number;
          submissionsThisMonth: number;
        };
        chartData: { date: string; submissions: number }[];
        topForms: { id: string; name: string; submissionCount: number }[];
      }>("get", "/api/analytics"),
  },
};
