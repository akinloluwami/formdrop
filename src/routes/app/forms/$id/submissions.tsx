import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";
import moment from "moment";
import {
  ArrowLeft01Icon,
  GridIcon,
  TableIcon,
  Cancel01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/app/forms/$id/submissions")({
  component: RouteComponent,
});

type ViewMode = "card" | "table";

interface Submission {
  id: string;
  bucketId: string;
  payload: Record<string, any>;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

function RouteComponent() {
  const { id } = Route.useParams();
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

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

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const PayloadField = ({
    fieldKey,
    value,
  }: {
    fieldKey: string;
    value: any;
  }) => {
    const [expanded, setExpanded] = useState(false);

    if (Array.isArray(value)) {
      const displayItems = expanded ? value : value.slice(0, 3);
      return (
        <div className="py-3 border-b border-gray-200 last:border-0">
          <label className="text-sm font-medium text-gray-700">
            {fieldKey}
          </label>
          <div className="mt-2 space-y-2">
            {displayItems.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-900"
              >
                {typeof item === "object" ? JSON.stringify(item) : String(item)}
              </div>
            ))}
            {value.length > 3 && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1"
              >
                <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                Show {value.length - 3} more
              </button>
            )}
            {expanded && value.length > 3 && (
              <button
                onClick={() => setExpanded(false)}
                className="text-sm text-accent hover:text-accent/80 font-medium"
              >
                Show less
              </button>
            )}
          </div>
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div className="py-3 border-b border-gray-200 last:border-0">
          <label className="text-sm font-medium text-gray-700">
            {fieldKey}
          </label>
          <div className="mt-2 bg-gray-50 px-3 py-2 rounded-lg">
            <pre className="text-sm text-gray-900 whitespace-pre-wrap wrap-break-word">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="py-3 border-b border-gray-200 last:border-0">
        <label className="text-sm font-medium text-gray-700">{fieldKey}</label>
        <p className="text-sm text-gray-900 mt-1">{String(value)}</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-x-3">
            <Link
              to="/app/forms"
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            </Link>
            <h2 className="text-lg font-semibold">Submissions</h2>
          </div>
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
          <div className="flex items-center gap-x-3">
            <Link
              to="/app/forms"
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            </Link>
            <h2 className="text-lg font-semibold">Submissions</h2>
          </div>
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

  const allKeys =
    submissions.length > 0
      ? Array.from(
          new Set(submissions.flatMap((sub) => Object.keys(sub.payload))),
        )
      : [];

  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-x-3">
          <Link
            to="/app/forms"
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
          </Link>
          <h2 className="text-lg font-semibold">Submissions</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "card"
                ? "bg-accent text-white"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <HugeiconsIcon icon={GridIcon} size={18} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "table"
                ? "bg-accent text-white"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <HugeiconsIcon icon={TableIcon} size={18} />
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="mt-4 p-8 border border-gray-200 rounded-3xl text-center">
          <p className="text-gray-500 text-sm">
            No submissions yet for this form.
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="mt-4 space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="p-5 border border-gray-200 rounded-3xl hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedSubmission(submission)}
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
      ) : (
        <div className="mt-4 border border-gray-200 rounded-3xl overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                  Timestamp
                </th>
                {allKeys.map((key) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap"
                  >
                    {key}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {moment(submission.createdAt).format("MMM DD, h:mm A")}
                  </td>
                  {allKeys.map((key) => {
                    const value = submission.payload[key];
                    const displayValue =
                      value !== undefined
                        ? typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)
                        : "-";
                    return (
                      <td
                        key={key}
                        className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap max-w-xs truncate"
                      >
                        {truncateText(displayValue)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {submission.ip || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Submission Details</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Submission ID
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedSubmission.id}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-3">
                    Payload
                  </label>
                  <div className="space-y-0 border border-gray-200 rounded-2xl overflow-hidden">
                    {Object.entries(selectedSubmission.payload).map(
                      ([key, value]) => (
                        <div key={key} className="px-4 bg-white">
                          <PayloadField fieldKey={key} value={value} />
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Timestamp
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {moment(selectedSubmission.createdAt).format(
                      "MMMM DD, YYYY [at] h:mm:ss A",
                    )}
                  </p>
                </div>

                {selectedSubmission.ip && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      IP Address
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedSubmission.ip}
                    </p>
                  </div>
                )}

                {selectedSubmission.userAgent && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      User Agent
                    </label>
                    <p className="text-sm text-gray-900 mt-1 break-all">
                      {selectedSubmission.userAgent}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
