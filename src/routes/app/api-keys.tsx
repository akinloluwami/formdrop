import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  Tick02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import moment from "moment";
import { CopyButton } from "@/components/CopyButton";

export const Route = createFileRoute("/app/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [canRead, setCanRead] = useState(true);
  const [canWrite, setCanWrite] = useState(true);
  const [scopeType, setScopeType] = useState<"all" | "restricted">("all");
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const response = await appClient.apiKeys.list();
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response.apiKeys;
    },
  });

  const { data: buckets } = useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const response = await appClient.buckets.list();
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response.buckets;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await appClient.apiKeys.create({
        name: newKeyName,
        canRead,
        canWrite,
        scopeType,
        bucketIds: scopeType === "restricted" ? selectedBuckets : [],
      });
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setCreatedKey(data.key);
      setNewKeyName("");
      setCanRead(true);
      setCanWrite(true);
      setScopeType("all");
      setSelectedBuckets([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await appClient.apiKeys.delete(id);
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    createMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-500 mt-1">
            Manage API keys for accessing your forms programmatically.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <HugeiconsIcon icon={Add01Icon} size={20} />
          <span>Create New Key</span>
        </button>
      </div>

      {apiKeys?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              size={24}
              className="text-gray-400"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No API Keys</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">
            You haven't created any API keys yet. Create one to start
            integrating with the API.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Key Prefix
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {apiKeys?.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{key.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">
                    {key.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {moment(key.createdAt).format("MMM D, YYYY")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.lastUsedAt
                      ? moment(key.lastUsedAt).fromNow()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this API key? This action cannot be undone.",
                          )
                        ) {
                          deleteMutation.mutate(key.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Key Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            {!createdKey ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Create New API Key
                </h3>
                <form onSubmit={handleCreate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Production Server"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                      autoFocus
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permissions
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCanRead(!canRead)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                          canRead
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {canRead && (
                          <HugeiconsIcon icon={Tick02Icon} size={18} />
                        )}
                        <span className="font-medium text-sm">Read</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanWrite(!canWrite)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                          canWrite
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {canWrite && (
                          <HugeiconsIcon icon={Tick02Icon} size={18} />
                        )}
                        <span className="font-medium text-sm">Write</span>
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Scope
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setScopeType("all")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                          scopeType === "all"
                            ? "border-black ring-1 ring-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            scopeType === "all"
                              ? "border-black bg-black"
                              : "border-gray-300"
                          }`}
                        >
                          {scopeType === "all" && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <span className="block font-medium text-sm text-gray-900">
                            All Buckets
                          </span>
                          <span className="block text-xs text-gray-500">
                            Access to all current and future buckets
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setScopeType("restricted")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                          scopeType === "restricted"
                            ? "border-black ring-1 ring-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            scopeType === "restricted"
                              ? "border-black bg-black"
                              : "border-gray-300"
                          }`}
                        >
                          {scopeType === "restricted" && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <span className="block font-medium text-sm text-gray-900">
                            Restricted Buckets
                          </span>
                          <span className="block text-xs text-gray-500">
                            Limit access to selected buckets only
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {scopeType === "restricted" && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Buckets
                      </label>
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1 bg-gray-50">
                        {buckets?.map((bucket) => {
                          const isSelected = selectedBuckets.includes(
                            bucket.id,
                          );
                          return (
                            <label
                              key={bucket.id}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-white shadow-sm border border-gray-200"
                                  : "hover:bg-gray-100 border border-transparent"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-black border-black"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {isSelected && (
                                  <HugeiconsIcon
                                    icon={Tick02Icon}
                                    size={14}
                                    className="text-white"
                                  />
                                )}
                              </div>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBuckets([
                                      ...selectedBuckets,
                                      bucket.id,
                                    ]);
                                  } else {
                                    setSelectedBuckets(
                                      selectedBuckets.filter(
                                        (id) => id !== bucket.id,
                                      ),
                                    );
                                  }
                                }}
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {bucket.name}
                              </span>
                            </label>
                          );
                        })}
                        {buckets?.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No buckets found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || !newKeyName.trim()}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Key"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      size={24}
                      className="text-green-600"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    API Key Created
                  </h3>
                  <p className="text-gray-500 mt-2 text-sm">
                    Please copy your API key now. You won't be able to see it
                    again!
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-3">
                  <code className="font-mono text-sm text-gray-900 break-all">
                    {createdKey}
                  </code>
                  <CopyButton text={createdKey} />
                </div>

                <button
                  onClick={() => {
                    setCreatedKey(null);
                    setIsCreateModalOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
