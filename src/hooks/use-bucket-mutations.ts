import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";

export function useBucketUpdate(bucketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      emailNotificationsEnabled?: boolean;
      slackNotificationsEnabled?: boolean;
      discordNotificationsEnabled?: boolean;
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
