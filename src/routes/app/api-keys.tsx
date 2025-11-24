import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  RefreshIcon,
  AlertCircleIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import moment from "moment";
import { CopyButton } from "@/components/copy-button";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/button";

export const Route = createFileRoute("/app/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [rollingKeyType, setRollingKeyType] = useState<
    "public" | "private" | null
  >(null);
  const [confirmRollType, setConfirmRollType] = useState<
    "public" | "private" | null
  >(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const response = await appClient.apiKeys.list();
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response.keys;
    },
  });

  const rollMutation = useMutation({
    mutationFn: async (type: "public" | "private") => {
      const response = await appClient.apiKeys.roll({ type });
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setRollingKeyType(null);
    },
  });

  const handleRoll = (type: "public" | "private") => {
    setConfirmRollType(type);
  };

  const confirmRoll = () => {
    if (confirmRollType) {
      setRollingKeyType(confirmRollType);
      rollMutation.mutate(confirmRollType);
      setConfirmRollType(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-20 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-gray-100 rounded-xl animate-pulse" />
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 h-14 animate-pulse" />

              <div className="mt-4 flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <p className="text-gray-500 mt-1">
          Manage your public and private API keys.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Public Key Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Public Key
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg">
                  Publishable
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Use this key in your frontend code to submit forms. It is safe
                to expose this key.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRoll("public")}
              disabled={rollMutation.isPending}
              icon={
                <HugeiconsIcon
                  icon={RefreshIcon}
                  size={16}
                  className={rollingKeyType === "public" ? "animate-spin" : ""}
                />
              }
            >
              Roll Key
            </Button>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <code className="flex-1 font-mono text-sm text-gray-700 break-all">
              {keys?.public?.key}
            </code>
            <CopyButton text={keys?.public?.key || ""} className="" />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <HugeiconsIcon icon={InformationCircleIcon} size={14} />
            <span>Created {moment(keys?.public?.createdAt).fromNow()}</span>
            {keys?.public?.lastUsedAt && (
              <>
                <span>•</span>
                <span>
                  Last used {moment(keys?.public?.lastUsedAt).fromNow()}
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Private Key Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Private Key
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg">
                  Secret
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Use this key for backend administrative tasks.{" "}
                <strong className="text-red-600">
                  Never expose this key in your frontend.
                </strong>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRoll("private")}
              disabled={rollMutation.isPending}
              icon={
                <HugeiconsIcon
                  icon={RefreshIcon}
                  size={16}
                  className={rollingKeyType === "private" ? "animate-spin" : ""}
                />
              }
            >
              Roll Key
            </Button>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <code className="flex-1 font-mono text-sm text-gray-700 break-all blur-sm hover:blur-none transition-all duration-300">
              {keys?.private?.key}
            </code>
            <CopyButton text={keys?.private?.key || ""} className="" />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <HugeiconsIcon icon={InformationCircleIcon} size={14} />
            <span>Created {moment(keys?.private?.createdAt).fromNow()}</span>
            {keys?.private?.lastUsedAt && (
              <>
                <span>•</span>
                <span>
                  Last used {moment(keys?.private?.lastUsedAt).fromNow()}
                </span>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 flex gap-3">
        <HugeiconsIcon
          icon={AlertCircleIcon}
          size={20}
          className="text-blue-600 shrink-0 mt-0.5"
        />
        <div className="text-sm text-blue-900">
          <p className="font-medium">Security Note</p>
          <p className="mt-1 text-blue-700">
            If you suspect a key has been compromised, roll it immediately. This
            will invalidate the old key and generate a new one. Make sure to
            update your applications with the new key.
          </p>
        </div>
      </div>

      {/* Roll Key Confirmation Modal */}
      <AnimatePresence>
        {confirmRollType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmRollType(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <HugeiconsIcon
                      icon={AlertCircleIcon}
                      className="text-red-600"
                      size={24}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Roll {confirmRollType === "public" ? "Public" : "Private"}{" "}
                    Key?
                  </h3>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to roll this key? The old key will stop
                  working immediately. You will need to update any applications
                  using this key.
                </p>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    className="rounded-xl"
                    onClick={() => setConfirmRollType(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    className="rounded-xl"
                    onClick={confirmRoll}
                  >
                    Yes, Roll Key
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
