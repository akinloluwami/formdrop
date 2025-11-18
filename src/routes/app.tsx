import { AddToListIcon, AnalyticsUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();

  const links: {
    name: string;
    path: string;
    icon: any;
  }[] = [
    { name: "Forms", path: "/app/forms", icon: AddToListIcon },
    { name: "Analytics", path: "/app/analytics", icon: AnalyticsUpIcon },
  ];

  const usage = [
    {
      name: "Forms",
      used: 3,
      limit: 10,
    },
    {
      name: "Submissions",
      used: 150,
      limit: 1000,
    },
  ];

  return (
    <div className="p-1 bg-gray-100 h-screen gap-2 flex">
      <div className="bg-white w-72 p-2 border border-gray-200 rounded-2xl flex flex-col gap-4 justify-between">
        <div className="">
          <div className="">
            <h1 className="">FormDrop</h1>
          </div>
          <div className="flex flex-col gap-y-3 mt-7">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  to={link.path}
                  key={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-4xl ${
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <HugeiconsIcon
                    icon={link.icon}
                    size={20}
                    color={isActive ? "#6f63e4" : undefined}
                  />
                  <span className={`text-sm font-medium`}>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="">Usage</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 w-full py-2 px-20 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
