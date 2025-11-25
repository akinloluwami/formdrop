import { Button } from "@/components/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon } from "@hugeicons/core-free-icons";

interface BillingSettingsProps {
  settings: any;
}

export function BillingSettings({ settings }: BillingSettingsProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Billing & Plans
      </h2>

      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Current Plan</p>
            <h3 className="text-xl font-bold text-gray-900">
              {settings?.subscription?.status === "active"
                ? "Pro Plan"
                : "Free Plan"}
            </h3>
          </div>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              settings?.subscription?.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {settings?.subscription?.status === "active" ? "Active" : "Free"}
          </span>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Usage</span>
            <span>
              {settings?.usage?.used} / {settings?.usage?.limit} submissions
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((settings?.usage?.used / settings?.usage?.limit) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Resets on{" "}
          {new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            1,
          ).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full border-dashed border-gray-300 hover:border-gray-400 text-gray-600"
          icon={<HugeiconsIcon icon={CreditCardIcon} size={18} />}
          onClick={() => window.open("https://billing.formdrop.co", "_blank")}
        >
          Manage Subscription & Billing
        </Button>
      </div>
    </div>
  );
}
