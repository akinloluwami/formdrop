import {
  MouseLeftClick01Icon,
  Html5Icon,
  JavaScriptIcon,
} from "@hugeicons/core-free-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import moment from "moment";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CopyButton } from "@/components/copy-button";

export const Route = createFileRoute("/app/forms/")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"html" | "fetch">("html");

  const { data: keys } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const response = await appClient.apiKeys.list();
      if ("error" in response) {
        return null;
      }
      return response.keys;
    },
  });

  const publicKey = keys?.public?.key || "your-public-key";

  const htmlCodeExample = `<form
  action="https://api.formdrop.co/collect?key=${publicKey}" 
  method="POST" name="Contact Form">
  <input type="text" name="name" placeholder="Your Name" required />
  <input type="email" name="email" placeholder="Your Email" required />
  <button type="submit">Submit</button>
</form>`;

  const fetchCodeExample = `fetch('https://api.formdrop.co/collect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': "Bearer ${publicKey}"
  },
  body: JSON.stringify({
    bucket: "Contact Form",
    data: {
      name: "John Doe",
      email: "john.doe@example.com"
    }
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
`;

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await appClient.buckets.create({ name });
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response.bucket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
      setIsCreateModalOpen(false);
      setNewFormName("");
      setCreateError(null);
    },
    onError: (error) => {
      setCreateError(error.message);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormName.trim()) return;
    createMutation.mutate(newFormName);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const response = await appClient.buckets.list();
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response.buckets;
    },
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between py-2">
          <h2 className="text-lg font-semibold">Forms</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-accent hover:bg-accent/90 transition-colors text-white px-5 py-3 rounded-3xl font-semibold text-sm"
          >
            Create Form
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 border border-gray-200 rounded-3xl animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between py-2">
          <h2 className="text-lg font-semibold">Forms</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-accent hover:bg-accent/90 transition-colors text-white px-5 py-3 rounded-3xl font-semibold text-sm"
          >
            Create Form
          </button>
        </div>
        <div className="mt-4 p-5 border border-red-200 rounded-3xl bg-red-50">
          <p className="text-red-600 text-sm">
            Failed to load forms: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const buckets = data || [];

  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <h2 className="text-lg font-semibold">Forms</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-accent hover:bg-accent/90 transition-colors text-white px-5 py-3 rounded-3xl font-semibold text-sm"
        >
          Create Form
        </button>
      </div>

      {buckets.length === 0 ? (
        <div className="mt-4 p-8 border border-gray-200 rounded-3xl">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-900">
              No forms yet
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Create your first form to get started, or try out the API with the
              example below.
            </p>
          </div>

          <div className="border rounded-3xl border-gray-200 max-w-3xl mx-auto p-4">
            <div className="flex items-center gap-x-4 relative">
              {/* Animated indicator background */}
              <div
                className={`absolute h-10 w-10 rounded-lg transition-all duration-300 ease-out ${
                  selectedTab === "html"
                    ? "bg-orange-100 ring-2 ring-orange-600 translate-x-0"
                    : "bg-yellow-100 ring-2 ring-yellow-500 translate-x-14"
                }`}
              />

              <button
                onClick={() => setSelectedTab("html")}
                className="p-2 rounded-lg transition-colors relative z-10 hover:bg-black/5"
              >
                <HugeiconsIcon
                  icon={Html5Icon}
                  className="text-orange-600"
                  size={24}
                />
              </button>
              <button
                onClick={() => setSelectedTab("fetch")}
                className="p-2 rounded-lg transition-colors relative z-10 hover:bg-black/5"
              >
                <HugeiconsIcon
                  icon={JavaScriptIcon}
                  className="text-yellow-500"
                  size={24}
                />
              </button>
            </div>
            <div className="border rounded-3xl border-gray-200 p-4 mt-5 relative bg-gray-50/50">
              <CopyButton
                text={
                  selectedTab === "html" ? htmlCodeExample : fetchCodeExample
                }
              />
              {selectedTab === "html" ? (
                <pre className="overflow-x-auto text-sm">
                  <code>{htmlCodeExample}</code>
                </pre>
              ) : (
                <pre className="overflow-x-auto text-sm">
                  <code>{fetchCodeExample}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {buckets.map((bucket) => (
            <Link
              to="/app/forms/$id/submissions"
              params={{
                id: bucket.id,
              }}
              key={bucket.id}
              className="p-5 border border-gray-200 rounded-3xl flex justify-between items-center hover:border-accent/50 transition-colors"
            >
              <div className="">
                <h3 className="font-medium">{bucket.name}</h3>
                <div className="flex gap-x-2 items-center mt-1">
                  <p className="text-xs text-gray-600">{bucket.id}</p>
                  <p className="text-xs text-gray-600 bg-gray-200/70 px-2 py-1 rounded-lg">
                    {moment(bucket.createdAt).format("MMM DD, YYYY")}
                  </p>
                </div>
              </div>
              <div className="flex gap-x-2">
                <div className="flex items-center text-gray-500 bg-gray-200/70 px-3 py-1 rounded-lg font-medium gap-x-2">
                  <HugeiconsIcon
                    icon={MouseLeftClick01Icon}
                    size={14}
                    className="text-accent"
                  />
                  <span className="text-xs">{bucket.submissionCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Create New Form
                </h3>
                <form onSubmit={handleCreate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Form Name
                    </label>
                    <input
                      type="text"
                      value={newFormName}
                      onChange={(e) => setNewFormName(e.target.value)}
                      placeholder="e.g. Contact Us"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      autoFocus
                    />
                  </div>

                  {createError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                      {createError}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        setCreateError(null);
                        setNewFormName("");
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || !newFormName.trim()}
                      className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Form"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
