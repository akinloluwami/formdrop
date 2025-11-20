import { MouseLeftClick01Icon } from "@hugeicons/core-free-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import moment from "moment";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";

export const Route = createFileRoute("/app/forms/")({
  component: RouteComponent,
});

function RouteComponent() {
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
          <button className="bg-accent hover:bg-accent/90 transition-colors text-white px-5 py-3 rounded-3xl font-semibold text-sm">
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
          <button className="bg-accent hover:bg-accent/90 transition-colors text-white px-5 py-3 rounded-3xl font-semibold text-sm">
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
        <button className="bg-accent hover:bg-accent/90 transition-colors text-white px-5 py-3 rounded-3xl font-semibold text-sm">
          Create Form
        </button>
      </div>

      {buckets.length === 0 ? (
        <div className="mt-4 p-8 border border-gray-200 rounded-3xl text-center">
          <p className="text-gray-500 text-sm">
            No forms yet. Create your first form to get started!
          </p>
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
    </div>
  );
}
