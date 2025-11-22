import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import { useBucketUpdate } from "@/hooks/use-bucket-mutations";

interface EmailNotificationsSectionProps {
  bucketId: string;
  isEnabled?: boolean;
}

export function EmailNotificationsSection({
  bucketId,
  isEnabled,
}: EmailNotificationsSectionProps) {
  const updateBucketMutation = useBucketUpdate(bucketId);

  const handleToggle = () => {
    updateBucketMutation.mutate({
      emailNotificationsEnabled: !isEnabled,
    });
  };

  return (
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
          onClick={handleToggle}
          disabled={updateBucketMutation.isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
            isEnabled ? "bg-accent" : "bg-gray-200"
          } ${updateBucketMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
