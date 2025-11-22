import {
  AddToListIcon,
  AnalyticsUpIcon,
  Key01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useSession, signOut } from "@/lib/auth-client";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/login" });
        },
      },
    });
  };

  const links = [
    { name: "Forms", path: "/app/forms", icon: AddToListIcon },
    { name: "Analytics", path: "/app/analytics", icon: AnalyticsUpIcon },
    { name: "API Keys", path: "/app/api-keys", icon: Key01Icon },
  ];

  return (
    <div className="bg-white w-72 min-w-72 max-w-72 p-2 border border-gray-200 rounded-2xl flex flex-col gap-4 justify-between h-full">
      <div className="flex-1 min-w-0">
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
      <div className="px-2">
        <div className="bg-linear-to-br from-accent/5 to-accent/10 p-4 rounded-xl border border-accent/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
          <h3 className="font-semibold text-sm text-gray-900 relative z-10">
            Upgrade to Pro
          </h3>
          <p className="text-xs text-gray-500 mt-1 mb-3 relative z-10">
            Unlock powerful integrations and advanced analytics.
          </p>
          <button className="w-full bg-accent text-white text-xs font-medium py-2 rounded-lg hover:bg-accent/90 transition-colors cursor-pointer shadow-sm shadow-accent/20 relative z-10">
            Upgrade Plan
          </button>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 w-full">
        {isPending ? (
          <div className="flex items-center gap-3 w-full">
            <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ) : session?.user ? (
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
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
        ) : null}
      </div>
    </div>
  );
}
