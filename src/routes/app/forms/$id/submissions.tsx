import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import moment from "moment";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const Route = createFileRoute("/app/forms/$id/submissions")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["submissions", id],
    queryFn: async () => {
      const response = await appClient.submissions.list(id);
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response.submissions;
    },
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-x-3 py-2">
          <Link
            to="/app/forms"
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
          </Link>
          <h2 className="text-lg font-semibold">Submissions</h2>
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
        <div className="flex items-center gap-x-3 py-2">
          <Link
            to="/app/forms"
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
          </Link>
          <h2 className="text-lg font-semibold">Submissions</h2>
        </div>
        <div className="mt-4 p-5 border border-red-200 rounded-3xl bg-red-50">
          <p className="text-red-600 text-sm">
            Failed to load submissions: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const submissions = data || [];

  return (
    <div>
      <div className="flex items-center gap-x-3 py-2">
        <Link
          to="/app/forms"
          className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
        </Link>
        <h2 className="text-lg font-semibold">Submissions</h2>
      </div>

      {submissions.length === 0 ? (
        <div className="mt-4 p-8 border border-gray-200 rounded-3xl text-center">
          <p className="text-gray-500 text-sm">
            No submissions yet for this form.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="p-5 border border-gray-200 rounded-3xl hover:border-accent/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">{submission.id}</p>
                  <p className="text-xs text-gray-500">
                    {moment(submission.createdAt).format(
                      "MMM DD, YYYY [at] h:mm A",
                    )}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl overflow-hidden">
                <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap wrap-break-word">
                  {JSON.stringify(submission.payload, null, 2)}
                </pre>
              </div>
              {(submission.ip || submission.userAgent) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {submission.ip && (
                    <p className="text-xs text-gray-500">IP: {submission.ip}</p>
                  )}
                  {submission.userAgent && (
                    <p className="text-xs text-gray-500 mt-1">
                      User Agent: {submission.userAgent}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
