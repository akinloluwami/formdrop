import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  LockKeyIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/button";

type Tab = "profile" | "password" | "billing";

export const Route = createFileRoute("/app/settings")({
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => {
    const tab = (search.tab as string) || "profile";
    if (["profile", "password", "billing"].includes(tab)) {
      return { tab: tab as Tab };
    }
    return { tab: "profile" };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { tab: activeTab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: session } = useSession();

  const setActiveTab = (tab: Tab) => {
    navigate({ search: { tab } });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "password", label: "Password", icon: LockKeyIcon },
    { id: "billing", label: "Billing", icon: CreditCardIcon },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl border border-gray-200 p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-settings-tab"
                    className="absolute inset-0 bg-accent rounded-2xl shadow-md shadow-accent/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <HugeiconsIcon icon={tab.icon} size={20} />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Profile Information
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-medium">
                        {session?.user?.name?.charAt(0).toUpperCase() ||
                          session?.user?.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Button variant="outline" size="md">
                          Change Avatar
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={session?.user?.name || ""}
                          className="w-full px-4 py-3 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue={session?.user?.email || ""}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-3xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-lg shadow-accent/20"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "password" && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Change Password
                  </h2>
                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="primary"
                        size="lg"
                        className="shadow-lg shadow-accent/20"
                      >
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Billing & Plans
                  </h2>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Current Plan
                        </p>
                        <h3 className="text-xl font-bold text-gray-900">
                          Free Plan
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-accent h-2 rounded-full w-[45%]"></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      450 / 1,000 submissions used this month
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Payment Methods
                    </h3>
                    <div className="p-4 border border-gray-200 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                          VISA
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            •••• •••• •••• 4242
                          </p>
                          <p className="text-xs text-gray-500">Expires 12/24</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-900"
                      >
                        Edit
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-dashed border-gray-300 hover:border-gray-400 text-gray-600"
                      icon={<HugeiconsIcon icon={CreditCardIcon} size={18} />}
                    >
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
