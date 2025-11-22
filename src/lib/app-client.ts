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
  allowedDomains?: string[];
}

interface RollApiKeyParams {
  type: "public" | "private";
}

type SuccessResponse<T> = T;
type ErrorResponse = { error: string; details?: string };
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export const appClient = {
  buckets: {
    list: async (): Promise<ApiResponse<{ buckets: Bucket[] }>> => {
      try {
        const response = await apiClient.get<{ buckets: Bucket[] }>(
          "/api/buckets",
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    create: async (
      params: CreateBucketParams,
    ): Promise<ApiResponse<{ bucket: Bucket }>> => {
      try {
        const response = await apiClient.post<{ bucket: Bucket }>(
          "/api/buckets",
          params,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    get: async (bucketId: string): Promise<ApiResponse<{ bucket: Bucket }>> => {
      try {
        const response = await apiClient.get<{ bucket: Bucket }>(
          `/api/buckets/${bucketId}`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    update: async (
      bucketId: string,
      params: UpdateBucketParams,
    ): Promise<ApiResponse<{ bucket: Bucket }>> => {
      try {
        const response = await apiClient.patch<{ bucket: Bucket }>(
          `/api/buckets/${bucketId}`,
          params,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    delete: async (
      bucketId: string,
    ): Promise<ApiResponse<{ message: string }>> => {
      try {
        const response = await apiClient.delete<{ message: string }>(
          `/api/buckets/${bucketId}`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },
  },

  recipients: {
    list: async (
      bucketId: string,
    ): Promise<ApiResponse<{ recipients: Recipient[] }>> => {
      try {
        const response = await apiClient.get<{ recipients: Recipient[] }>(
          `/api/buckets/${bucketId}/recipients`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    add: async (
      bucketId: string,
      email: string,
    ): Promise<ApiResponse<{ recipient: Recipient }>> => {
      try {
        const response = await apiClient.post<{ recipient: Recipient }>(
          `/api/buckets/${bucketId}/recipients`,
          { email },
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    remove: async (
      bucketId: string,
      recipientId: string,
    ): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        const response = await apiClient.delete<{ success: boolean }>(
          `/api/buckets/${bucketId}/recipients/${recipientId}`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    update: async (
      bucketId: string,
      recipientId: string,
      enabled: boolean,
    ): Promise<ApiResponse<{ recipient: Recipient }>> => {
      try {
        const response = await apiClient.patch<{ recipient: Recipient }>(
          `/api/buckets/${bucketId}/recipients/${recipientId}`,
          { enabled },
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    resendVerification: async (
      bucketId: string,
      recipientId: string,
    ): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        const response = await apiClient.post<{ success: boolean }>(
          `/api/buckets/${bucketId}/recipients/${recipientId}/resend-verification`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    disconnectSlack: async (
      bucketId: string,
    ): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        const response = await apiClient.delete<{ success: boolean }>(
          `/api/buckets/${bucketId}/disconnect-slack`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    disconnectDiscord: async (
      bucketId: string,
    ): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        const response = await apiClient.delete<{ success: boolean }>(
          `/api/buckets/${bucketId}/disconnect-discord`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },
  },

  submissions: {
    list: async (
      bucketId: string,
    ): Promise<ApiResponse<{ submissions: Submission[] }>> => {
      try {
        const response = await apiClient.get<{ submissions: Submission[] }>(
          `/api/buckets/${bucketId}/submissions`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    get: async (
      bucketId: string,
      submissionId: string,
    ): Promise<ApiResponse<{ submission: Submission }>> => {
      try {
        const response = await apiClient.get<{ submission: Submission }>(
          `/api/buckets/${bucketId}/submissions/${submissionId}`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    delete: async (
      bucketId: string,
      submissionId: string,
    ): Promise<ApiResponse<{ message: string }>> => {
      try {
        const response = await apiClient.delete<{ message: string }>(
          `/api/buckets/${bucketId}/submissions/${submissionId}`,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    bulkDelete: async (
      bucketId: string,
      submissionIds: string[],
    ): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        const response = await apiClient.delete<{ success: boolean }>(
          `/api/buckets/${bucketId}/submissions`,
          { data: { submissionIds } },
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    analytics: async (
      bucketId: string,
    ): Promise<
      ApiResponse<{
        stats: { total: number; thisMonth: number; today: number };
        chartData: { date: string; submissions: number }[];
      }>
    > => {
      try {
        const response = await apiClient.get<{
          stats: { total: number; thisMonth: number; today: number };
          chartData: { date: string; submissions: number }[];
        }>(`/api/buckets/${bucketId}/analytics`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },
  },

  apiKeys: {
    list: async (): Promise<
      ApiResponse<{ keys: { public: ApiKey; private: ApiKey } }>
    > => {
      try {
        const response = await apiClient.get<{
          keys: { public: ApiKey; private: ApiKey };
        }>("/api/api-keys");
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    roll: async (
      params: RollApiKeyParams,
    ): Promise<ApiResponse<{ key: ApiKey }>> => {
      try {
        const response = await apiClient.post<{ key: ApiKey }>(
          "/api/api-keys",
          params,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },
  },

  analytics: {
    get: async (): Promise<
      ApiResponse<{
        stats: {
          totalBuckets: number;
          totalSubmissions: number;
          submissionsThisMonth: number;
        };
        chartData: { date: string; submissions: number }[];
        topForms: { id: string; name: string; submissionCount: number }[];
      }>
    > => {
      try {
        const response = await apiClient.get<{
          stats: {
            totalBuckets: number;
            totalSubmissions: number;
            submissionsThisMonth: number;
          };
          chartData: { date: string; submissions: number }[];
          topForms: { id: string; name: string; submissionCount: number }[];
        }>("/api/analytics");
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },
  },
};
