import {
  AddToListIcon,
  AnalyticsUpIcon,
  Key01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useSession, signOut } from "@/lib/auth-client";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/login" });
        },
      },
    });
  };

  const links: {
    name: string;
    path: string;
    icon: any;
  }[] = [
    { name: "Forms", path: "/app/forms", icon: AddToListIcon },
    { name: "Analytics", path: "/app/analytics", icon: AnalyticsUpIcon },
    { name: "API Keys", path: "/app/api-keys", icon: Key01Icon },
  ];

  return (
    <div className="p-2 bg-gray-100 h-screen gap-2 flex">
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
        <div className="p-4 border-t border-gray-100">
          {session?.user && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium shrink-0">
                  {session.user.name?.charAt(0).toUpperCase() ||
                    session.user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {session.user.name}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {session.user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title="Sign out"
              >
                <HugeiconsIcon icon={Logout01Icon} size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 w-full py-2 px-20 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
