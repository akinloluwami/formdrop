import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import { useSession } from "@/lib/auth-client";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EmailNotificationsSection } from "@/components/notifications/email-notifications-section";
import { SlackNotificationsSection } from "@/components/notifications/slack-notifications-section";
import { DiscordNotificationsSection } from "@/components/notifications/discord-notifications-section";
import { EmailRecipientsList } from "@/components/notifications/email-recipients-list";

export const Route = createFileRoute("/app/forms/$id/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: session } = useSession();

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
        isConnected={!!bucket?.slackWebhookUrl}
        isEnabled={bucket?.slackNotificationsEnabled}
        channelName={bucket?.slackChannelName}
        teamName={bucket?.slackTeamName}
        bucketId={id}
      />

      <DiscordNotificationsSection
        isConnected={!!bucket?.discordWebhookUrl}
        isEnabled={bucket?.discordNotificationsEnabled}
        channelName={bucket?.discordChannelName}
        guildName={bucket?.discordGuildName}
        bucketId={id}
      />
    </div>
  );
}
