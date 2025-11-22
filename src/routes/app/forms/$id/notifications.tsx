import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import { useSession } from "@/lib/auth-client";
import {
  Delete02Icon,
  Add01Icon,
  Mail01Icon,
  Notification01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

export const Route = createFileRoute("/app/forms/$id/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [newRecipientEmail, setNewRecipientEmail] = useState("");

  const { data: bucket, isLoading: isBucketLoading } = useQuery({
    queryKey: ["bucket", id],
    queryFn: async () => {
      const response = await appClient.buckets.get(id);
      if ("error" in response) throw new Error(response.error);
      return response.bucket;
    },
  });

  const { data: recipients, isLoading: isRecipientsLoading } = useQuery({
    queryKey: ["recipients", id],
    queryFn: async () => {
      const response = await appClient.recipients.list(id);
      if ("error" in response) throw new Error(response.error);
      return response.recipients;
    },
  });

  const updateBucketMutation = useMutation({
    mutationFn: async (data: { emailNotificationsEnabled: boolean }) => {
      const response = await appClient.buckets.update(id, data);
      if ("error" in response) throw new Error(response.error);
      return response.bucket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket", id] });
    },
  });

  const addRecipientMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await appClient.recipients.add(id, email);
      if ("error" in response) throw new Error(response.error);
      return response.recipient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients", id] });
      setNewRecipientEmail("");
    },
  });

  const removeRecipientMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await appClient.recipients.remove(id, recipientId);
      if ("error" in response) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients", id] });
    },
  });

  const updateRecipientMutation = useMutation({
    mutationFn: async ({
      recipientId,
      enabled,
    }: {
      recipientId: string;
      enabled: boolean;
    }) => {
      const response = await appClient.recipients.update(
        id,
        recipientId,
        enabled,
      );
      if ("error" in response) throw new Error(response.error);
      return response.recipient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients", id] });
    },
  });

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecipientEmail) {
      addRecipientMutation.mutate(newRecipientEmail);
    }
  };

  if (isBucketLoading || isRecipientsLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-x-3 py-2 mb-6">
        <Link
          to="/app/forms"
          className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
        </Link>
        <h2 className="text-lg font-semibold">Notifications</h2>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <HugeiconsIcon icon={Notification01Icon} size={20} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-500">
                Receive an email whenever a new submission is received.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              updateBucketMutation.mutate({
                emailNotificationsEnabled: !bucket?.emailNotificationsEnabled,
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
              bucket?.emailNotificationsEnabled ? "bg-accent" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                bucket?.emailNotificationsEnabled
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {bucket?.emailNotificationsEnabled && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Recipients</h3>
            <p className="text-sm text-gray-500 mt-1">
              Who should receive email notifications?
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Owner - Always first */}
            <div className="p-4 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <HugeiconsIcon icon={Mail01Icon} size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {session?.user?.email}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      Owner
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 italic px-3">
                Always enabled
              </div>
            </div>

            {/* Other Recipients */}
            {recipients?.map((recipient) => (
              <div
                key={recipient.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <HugeiconsIcon icon={Mail01Icon} size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {recipient.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateRecipientMutation.mutate({
                        recipientId: recipient.id,
                        enabled: !recipient.enabled,
                      })
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      recipient.enabled ? "bg-accent" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        recipient.enabled ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => removeRecipientMutation.mutate(recipient.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <form onSubmit={handleAddRecipient} className="flex gap-3">
              <input
                type="email"
                placeholder="Enter email address"
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                required
              />
              <button
                type="submit"
                disabled={addRecipientMutation.isPending}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} />
                Add Recipient
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
