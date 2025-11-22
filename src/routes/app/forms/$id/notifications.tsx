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
  ReloadIcon,
  Tick02Icon,
  Cancel01Icon,
  LinkSquare02Icon,
  GameIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Tooltip } from "@/components/tooltip";
import { motion, AnimatePresence } from "motion/react";
import { Discord, Slack } from "@ridemountainpig/svgl-react";

export const Route = createFileRoute("/app/forms/$id/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [deletingRecipientId, setDeletingRecipientId] = useState<string | null>(
    null,
  );

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
    mutationFn: async (data: {
      emailNotificationsEnabled?: boolean;
      slackNotificationsEnabled?: boolean;
      discordNotificationsEnabled?: boolean;
    }) => {
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
      setDeletingRecipientId(null);
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

  const resendVerificationMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await appClient.recipients.resendVerification(
        id,
        recipientId,
      );
      if ("error" in response) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients", id] });
    },
  });

  const disconnectSlackMutation = useMutation({
    mutationFn: async () => {
      const response = await appClient.recipients.disconnectSlack(id);
      if ("error" in response) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket", id] });
    },
  });

  const disconnectDiscordMutation = useMutation({
    mutationFn: async () => {
      const response = await appClient.recipients.disconnectDiscord(id);
      if ("error" in response) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket", id] });
    },
  });

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecipientEmail) {
      addRecipientMutation.mutate(newRecipientEmail);
    }
  };

  const getRecipientStatus = (recipient: {
    verifiedAt: Date | null;
    verificationTokenExpiresAt: Date | null;
  }) => {
    if (recipient.verifiedAt) {
      return "verified";
    }
    if (
      recipient.verificationTokenExpiresAt &&
      new Date(recipient.verificationTokenExpiresAt) < new Date()
    ) {
      return "expired";
    }
    return "pending";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isBucketLoading || isRecipientsLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="flex items-center gap-x-3 py-2 mb-6">
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-8">
          <div className="h-32 w-full bg-gray-200 rounded-3xl"></div>
          <div className="h-64 w-full bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    );
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

      {/* Slack Notifications */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Slack className="size-7" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Slack Notifications
              </h3>
              <p className="text-sm text-gray-500">
                {bucket?.slackWebhookUrl
                  ? `Connected to #${bucket.slackChannelName} (${bucket.slackTeamName})`
                  : "Send notifications to a Slack channel"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {bucket?.slackWebhookUrl ? (
              <>
                <button
                  onClick={() =>
                    updateBucketMutation.mutate({
                      slackNotificationsEnabled:
                        !bucket?.slackNotificationsEnabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                    bucket?.slackNotificationsEnabled
                      ? "bg-accent"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      bucket?.slackNotificationsEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <button
                  onClick={() => disconnectSlackMutation.mutate()}
                  disabled={disconnectSlackMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <a
                href={`/api/integrations/slack/authorize?bucketId=${id}`}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                <HugeiconsIcon icon={LinkSquare02Icon} size={16} />
                Connect Slack
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Discord Notifications */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Discord className="size-7" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Discord Notifications
              </h3>
              <p className="text-sm text-gray-500">
                {bucket?.discordWebhookUrl
                  ? `Connected to #${bucket.discordChannelName} (${bucket.discordGuildName})`
                  : "Send notifications to a Discord channel"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {bucket?.discordWebhookUrl ? (
              <>
                <button
                  onClick={() =>
                    updateBucketMutation.mutate({
                      discordNotificationsEnabled:
                        !bucket?.discordNotificationsEnabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                    bucket?.discordNotificationsEnabled
                      ? "bg-accent"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      bucket?.discordNotificationsEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <button
                  onClick={() => disconnectDiscordMutation.mutate()}
                  disabled={disconnectDiscordMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <a
                href={`/api/integrations/discord/authorize?bucketId=${id}`}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <HugeiconsIcon icon={GameIcon} size={16} />
                Connect Discord
              </a>
            )}
          </div>
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
            {recipients?.map((recipient) => {
              const status = getRecipientStatus(recipient);

              return (
                <div
                  key={recipient.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <HugeiconsIcon icon={Mail01Icon} size={16} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {recipient.email}
                      </span>

                      {status === "pending" && (
                        <Tooltip
                          content={
                            <div className="text-center">
                              <div className="font-medium">
                                Pending Verification
                              </div>
                              <div className="text-gray-300 text-xs mt-1">
                                Expires:{" "}
                                {recipient.verificationTokenExpiresAt &&
                                  formatDate(
                                    recipient.verificationTokenExpiresAt,
                                  )}
                              </div>
                            </div>
                          }
                        >
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-xs font-medium text-amber-700">
                            Pending Verification
                          </span>
                        </Tooltip>
                      )}

                      {status === "expired" && (
                        <Tooltip
                          content={
                            <div className="text-center">
                              <div className="font-medium">
                                Invitation Expired
                              </div>
                              <div className="text-gray-300 text-xs mt-1">
                                Click the resend button to send a new invitation
                              </div>
                            </div>
                          }
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-xs font-medium text-red-700">
                              Invitation Expired
                            </span>
                            <button
                              onClick={() =>
                                resendVerificationMutation.mutate(recipient.id)
                              }
                              disabled={resendVerificationMutation.isPending}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Resend invitation"
                            >
                              <HugeiconsIcon icon={ReloadIcon} size={14} />
                            </button>
                          </div>
                        </Tooltip>
                      )}

                      {status === "verified" && (
                        <Tooltip
                          content={
                            <div className="text-center">
                              <div className="font-medium">Verified</div>
                              <div className="text-gray-300 text-xs mt-1">
                                Verified on:{" "}
                                {recipient.verifiedAt &&
                                  formatDate(recipient.verifiedAt)}
                              </div>
                            </div>
                          }
                        >
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-xs font-medium text-green-700">
                            Verified
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                      {deletingRecipientId === recipient.id ? (
                        <motion.div
                          key="confirm"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                            Confirm Deletion?
                          </span>
                          <button
                            onClick={() =>
                              removeRecipientMutation.mutate(recipient.id)
                            }
                            disabled={removeRecipientMutation.isPending}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Confirm delete"
                          >
                            <HugeiconsIcon icon={Tick02Icon} size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingRecipientId(null)}
                            disabled={removeRecipientMutation.isPending}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} size={16} />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="actions"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-3"
                        >
                          <button
                            onClick={() =>
                              updateRecipientMutation.mutate({
                                recipientId: recipient.id,
                                enabled: !recipient.enabled,
                              })
                            }
                            disabled={!recipient.verifiedAt}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                              recipient.enabled && recipient.verifiedAt
                                ? "bg-accent"
                                : "bg-gray-200"
                            } ${!recipient.verifiedAt ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                recipient.enabled && recipient.verifiedAt
                                  ? "translate-x-5"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => setDeletingRecipientId(recipient.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={16} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
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
