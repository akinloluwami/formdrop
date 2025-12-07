import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export const Route = createFileRoute("/admin/submissions")({
  component: AdminSubmissions,
});

type Submission = {
  id: string;
  formId: string;
  formName: string;
  createdAt: Date;
  payload: any;
};

const columnHelper = createColumnHelper<Submission>();

const columns = [
  columnHelper.accessor("formName", {
    header: "Form",
    cell: (info) => (
      <div className="font-medium text-gray-900">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor("id", {
    header: "Submission ID",
    cell: (info) => (
      <div className="text-gray-500 font-mono text-xs">
        {info.getValue().substring(0, 8)}...
      </div>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Submitted",
    cell: (info) => (
      <div className="text-gray-500">
        {new Date(info.getValue()).toLocaleString()}
      </div>
    ),
  }),
  columnHelper.display({
    id: "preview",
    header: "Data Preview",
    cell: (info) => {
      const payload = info.row.original.payload;
      const preview = Object.keys(payload)
        .slice(0, 2)
        .map((key) => `${key}: ${payload[key]}`)
        .join(", ");
      return (
        <div className="text-gray-500 text-sm truncate max-w-xs">{preview}</div>
      );
    },
  }),
];

function AdminSubmissions() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin", "submissions"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/submissions");
      return res.data.submissions as Submission[];
    },
  });

  const table = useReactTable({
    data: submissions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h2 className="text-2xl font-bold text-gray-900">Submissions</h2>
          <p className="mt-1 text-sm text-gray-500">
            View all form submissions across the platform.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
