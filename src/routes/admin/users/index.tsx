import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/button";
import { UserBlock01Icon, Login03Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsers,
});

type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
  banned?: boolean;
  createdAt: Date;
};

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => (
      <div className="font-medium text-gray-900">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => <div className="text-gray-500">{info.getValue()}</div>,
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: (info) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          info.getValue() === "admin"
            ? "bg-purple-100 text-purple-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {info.getValue() || "user"}
      </span>
    ),
  }),
  columnHelper.accessor("banned", {
    header: "Status",
    cell: (info) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          info.getValue()
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {info.getValue() ? "Banned" : "Active"}
      </span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Joined",
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
        <Link to="/admin/users/$userId" params={{ userId: info.row.original.id }}>
          <Button
            variant="outline"
            size="sm"
            title="View User"
          >
            <HugeiconsIcon icon={ViewIcon} size={16} />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleImpersonate(info.row.original.id)}
          title="Impersonate User"
        >
          <HugeiconsIcon icon={Login03Icon} size={16} />
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleBanUser(info.row.original.id)}
          title="Ban User"
        >
          <HugeiconsIcon icon={UserBlock01Icon} size={16} />
        </Button>
      </div>
    ),
  }),
];

async function handleImpersonate(userId: string) {
  await authClient.admin.impersonateUser({
    userId,
  });
  window.location.href = "/app";
}

async function handleBanUser(userId: string) {
  if (!confirm("Are you sure you want to ban this user?")) return;

  await authClient.admin.banUser({
    userId,
    banReason: "Admin action",
  });
  window.location.reload();
}

function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await authClient.admin.listUsers({
        query: {
          limit: 100,
        },
      });
      return res.data?.users as User[];
    },
  });

  const table = useReactTable({
    data: users || [],
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
                <div className="h-12 w-12 bg-gray-100 rounded-full animate-pulse"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your users, view their details and perform administrative
            actions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          {/* Add user button could go here */}
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
