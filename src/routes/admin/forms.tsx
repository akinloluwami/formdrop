import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/button";
import { ViewIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const Route = createFileRoute("/admin/forms")({
  component: AdminForms,
});

type Form = {
  id: string;
  name: string;
  userId: string;
  userName: string;
  createdAt: Date;
  submissionCount: number;
};

const columnHelper = createColumnHelper<Form>();

const columns = [
  columnHelper.accessor("name", {
    header: "Form Name",
    cell: (info) => (
      <div className="font-medium text-gray-900">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor("userName", {
    header: "Owner",
    cell: (info) => (
      <Link
        to="/admin/users/$userId"
        params={{ userId: info.row.original.userId }}
      >
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer">
          {info.getValue()}
        </span>
      </Link>
    ),
  }),
  columnHelper.accessor("submissionCount", {
    header: "Submissions",
    cell: (info) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {info.getValue()?.toLocaleString() || 0}
      </span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: (info) => (
      <div className="text-gray-500">
        {new Date(info.getValue()).toLocaleDateString()}
      </div>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <div className="flex space-x-2">
        <Link to="/app/forms/$id" params={{ id: info.row.original.id }}>
          <Button variant="outline" size="sm" title="View Form">
            <HugeiconsIcon icon={ViewIcon} size={16} />
          </Button>
        </Link>
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDeleteForm(info.row.original.id)}
          title="Delete Form"
        >
          <HugeiconsIcon icon={Delete02Icon} size={16} />
        </Button>
      </div>
    ),
  }),
];

async function handleDeleteForm(formId: string) {
  if (
    !confirm(
      "Are you sure you want to delete this form? This action cannot be undone.",
    )
  ) {
    return;
  }

  try {
    await axios.delete(`/api/admin/forms/${formId}`);
    window.location.reload();
  } catch (error) {
    alert("Failed to delete form");
  }
}

function AdminForms() {
  const { data: forms, isLoading } = useQuery({
    queryKey: ["admin", "forms"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/forms");
      return res.data.forms as Form[];
    },
  });

  const table = useReactTable({
    data: forms || [],
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
                <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Forms</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all forms created by users.
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
