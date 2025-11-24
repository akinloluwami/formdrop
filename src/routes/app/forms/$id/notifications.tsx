import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import { useSession } from "@/lib/auth-client";
import { ArrowLeft01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EmailNotificationsSection } from "@/components/notifications/email-notifications-section";
import { SlackNotificationsSection } from "@/components/notifications/slack-notifications-section";
import { DiscordNotificationsSection } from "@/components/notifications/discord-notifications-section";
import { EmailRecipientsList } from "@/components/notifications/email-recipients-list";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Slack, Discord } from "@ridemountainpig/svgl-react";

export const Route = createFileRoute("/app/forms/$id/notifications")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      success: (search.success as string) || undefined,
    };
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { success } = Route.useSearch();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (success === "slack_connected" || success === "discord_connected") {
      setShowSuccessModal(true);
    }
  }, [success]);

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

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Remove the success param from URL
    navigate({
      to: "/app/forms/$id/notifications",
      params: { id },
      search: { success: undefined },
      replace: true,
    });
  };

  const getModalContent = () => {
    if (success === "slack_connected") {
      return {
        title: "Slack Connected!",
        description:
          "Your Slack workspace has been successfully connected. You'll now receive notifications in your selected channel.",
        icon: <Slack width={64} height={64} />,
        bgColor: "bg-purple-50",
        accentColor: "bg-purple-600",
        hoverColor: "hover:bg-purple-700",
        checkBgColor: "bg-purple-100",
        checkIconColor: "text-purple-600",
      };
    }
    if (success === "discord_connected") {
      return {
        title: "Discord Connected!",
        description:
          "Your Discord server has been successfully connected. You'll now receive notifications in your selected channel.",
        icon: <Discord width={64} height={64} />,
        bgColor: "bg-indigo-50",
        accentColor: "bg-indigo-600",
        hoverColor: "hover:bg-indigo-700",
        checkBgColor: "bg-indigo-100",
        checkIconColor: "text-indigo-600",
      };
    }
    return null;
  };

  const modalContent = getModalContent();

  return (
    <>
      <AnimatePresence>
        {showSuccessModal && modalContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon with gradient background */}
                <div
                  className={`w-24 h-24 ${modalContent.bgColor} rounded-3xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  {modalContent.icon}
                </div>

                {/* Success checkmark badge */}
                <div
                  className={`w-12 h-12 ${modalContent.checkBgColor} rounded-full flex items-center justify-center mb-5 shadow-sm`}
                >
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={24}
                    className={modalContent.checkIconColor}
                  />
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold mb-3 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {modalContent.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-8 text-base leading-relaxed">
                  {modalContent.description}
                </p>

                {/* Button */}
                <button
                  onClick={handleCloseModal}
                  className={`${modalContent.accentColor} ${modalContent.hoverColor} text-white px-8 py-3 rounded-full transition-all font-semibold w-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

        <EmailNotificationsSection
          bucketId={id}
          isEnabled={bucket?.emailNotificationsEnabled}
        />

        {bucket?.emailNotificationsEnabled && (
          <EmailRecipientsList
            bucketId={id}
            ownerEmail={session?.user?.email}
            recipients={recipients || []}
          />
        )}

        <SlackNotificationsSection
          isConnected={bucket?.slackConnected ?? false}
          isEnabled={bucket?.slackNotificationsEnabled}
          channelName={bucket?.slackChannelName}
          teamName={bucket?.slackTeamName}
          bucketId={id}
        />

        <DiscordNotificationsSection
          isConnected={bucket?.discordConnected ?? false}
          isEnabled={bucket?.discordNotificationsEnabled}
          channelName={bucket?.discordChannelName}
          guildName={bucket?.discordGuildName}
          bucketId={id}
        />
      </div>
    </>
  );
}
