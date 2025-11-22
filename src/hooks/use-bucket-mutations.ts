import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";

export function useBucketUpdate(bucketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      emailNotificationsEnabled?: boolean;
      slackNotificationsEnabled?: boolean;
      discordNotificationsEnabled?: boolean;
      googleSheetsEnabled?: boolean;
      airtableEnabled?: boolean;
    }) => {
      const response = await appClient.buckets.update(bucketId, data);
      if ("error" in response) throw new Error(response.error);
      return response.bucket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket", bucketId] });
    },
  });
}

export function useDisconnectSlack(bucketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await appClient.recipients.disconnectSlack(bucketId);
      if ("error" in response) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket", bucketId] });
    },
  });
}

export function useDisconnectDiscord(bucketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await appClient.recipients.disconnectDiscord(bucketId);
      if ("error" in response) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket", bucketId] });
    },
  });
}

export function useDisconnectGoogleSheets(bucketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "/api/integrations/google-sheets/disconnect",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bucketId }),
        },
      );
      if (!response.ok) throw new Error("Failed to disconnect");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket", bucketId] });
    },
  });
}

export function useDisconnectAirtable(bucketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/integrations/airtable/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucketId }),
      });
      if (!response.ok) throw new Error("Failed to disconnect");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket", bucketId] });
    },
  });
}
