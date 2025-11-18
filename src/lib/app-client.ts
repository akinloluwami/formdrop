import axios from "axios";

const apiClient = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  headers: {
    "Content-Type": "application/json",
  },
});

interface CreateFormParams {
  name: string;
  description?: string;
}

interface FormData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  submissions: number;
}

interface SubmissionData {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

interface UpdateFormParams {
  name?: string;
  description?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const appClient = {
  forms: {
    create: async (
      params: CreateFormParams,
    ): Promise<ApiResponse<FormData>> => {
      try {
        const response = await apiClient.post<ApiResponse<FormData>>(
          "/api/forms",
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

    list: async (): Promise<ApiResponse<FormData[]>> => {
      try {
        const response =
          await apiClient.get<ApiResponse<FormData[]>>("/api/forms");
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: "An unexpected error occurred" };
      }
    },

    get: async (id: string): Promise<ApiResponse<FormData>> => {
      try {
        const response = await apiClient.get<ApiResponse<FormData>>(
          `/api/forms/${id}`,
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
      id: string,
      params: UpdateFormParams,
    ): Promise<ApiResponse<FormData>> => {
      try {
        const response = await apiClient.patch<ApiResponse<FormData>>(
          `/api/forms/${id}`,
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

    delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        const response = await apiClient.delete<
          ApiResponse<{ success: boolean }>
        >(`/api/forms/${id}`);
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
    list: async (formId: string): Promise<ApiResponse<SubmissionData[]>> => {
      try {
        const response = await apiClient.get<ApiResponse<SubmissionData[]>>(
          `/api/forms/${formId}/submissions`,
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
      formId: string,
      submissionId: string,
    ): Promise<ApiResponse<SubmissionData>> => {
      try {
        const response = await apiClient.get<ApiResponse<SubmissionData>>(
          `/api/forms/${formId}/submissions/${submissionId}`,
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
      formId: string,
      submissionId: string,
    ): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        const response = await apiClient.delete<
          ApiResponse<{ success: boolean }>
        >(`/api/forms/${formId}/submissions/${submissionId}`);
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
