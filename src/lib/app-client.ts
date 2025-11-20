import axios from "axios";

const apiClient = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  headers: {
    "Content-Type": "application/json",
  },
});

type ApiKeyScopeType = "all" | "specific" | "restricted";

interface Bucket {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  allowedDomains: string[];
  createdAt: Date;
  updatedAt: Date;
  submissionCount: number;
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
  name: string;
  key: string;
  canRead: boolean;
  canWrite: boolean;
  scopeType: ApiKeyScopeType;
  scopeBucketIds: string[] | null;
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
  allowedDomains?: string[];
}

interface CreateApiKeyParams {
  name: string;
  canRead?: boolean;
  canWrite?: boolean;
  scopeType?: ApiKeyScopeType;
  bucketIds?: string[];
}

interface UpdateApiKeyParams {
  name?: string;
  canRead?: boolean;
  canWrite?: boolean;
  scopeType?: ApiKeyScopeType;
  bucketIds?: string[];
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
  },

  apiKeys: {
    list: async (): Promise<ApiResponse<{ apiKeys: ApiKey[] }>> => {
      try {
        const response = await apiClient.get<{ apiKeys: ApiKey[] }>(
          "/api/api-keys",
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
      params: CreateApiKeyParams,
    ): Promise<
      ApiResponse<{ apiKey: ApiKey; key: string; warning: string }>
    > => {
      try {
        const response = await apiClient.post<{
          apiKey: ApiKey;
          key: string;
          warning: string;
        }>("/api/api-keys", params);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    get: async (keyId: string): Promise<ApiResponse<{ apiKey: ApiKey }>> => {
      try {
        const response = await apiClient.get<{ apiKey: ApiKey }>(
          `/api/api-keys/${keyId}`,
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
      keyId: string,
      params: UpdateApiKeyParams,
    ): Promise<ApiResponse<{ apiKey: ApiKey }>> => {
      try {
        const response = await apiClient.patch<{ apiKey: ApiKey }>(
          `/api/api-keys/${keyId}`,
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
      keyId: string,
    ): Promise<ApiResponse<{ message: string }>> => {
      try {
        const response = await apiClient.delete<{ message: string }>(
          `/api/api-keys/${keyId}`,
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
};
