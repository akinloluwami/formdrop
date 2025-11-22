import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import { useNotificationsStore } from "@/stores/notifications-store";

export function useAddRecipient(bucketId: string) {
  const queryClient = useQueryClient();
  const resetNewRecipientEmail = useNotificationsStore(
    (state) => state.resetNewRecipientEmail,
  );

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await appClient.recipients.add(bucketId, email);
      if ("error" in response) throw new Error(response.error);
      return response.recipient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients", bucketId] });
      resetNewRecipientEmail();
    },
  });
}

export function useRemoveRecipient(bucketId: string) {
  const queryClient = useQueryClient();
  const setDeletingRecipientId = useNotificationsStore(
    (state) => state.setDeletingRecipientId,
  );

  return useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await appClient.recipients.remove(bucketId, recipientId);
      if ("error" in response) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients", bucketId] });
      setDeletingRecipientId(null);
    },
  });
}

export function useUpdateRecipient(bucketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipientId,
      enabled,
    }: {
      recipientId: string;
      enabled: boolean;
    }) => {
      const response = await appClient.recipients.update(
        bucketId,
        recipientId,
        enabled,
      );
      if ("error" in response) throw new Error(response.error);
      return response.recipient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients", bucketId] });
    },
  });
}

export function useResendVerification(bucketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await appClient.recipients.resendVerification(
        bucketId,
        recipientId,
      );
      if ("error" in response) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients", bucketId] });
    },
  });
}
