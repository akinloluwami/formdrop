import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { motion } from "motion/react";

export const Route = createFileRoute("/app/forms/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();

  const links = [
    {
      name: "Submissions",
      to: "/app/forms/$id/submissions",
    },
    {
      name: "Analytics",
      to: "/app/forms/$id/analytics",
    },
    {
      name: "Notifications",
      to: "/app/forms/$id/notifications",
    },
    {
      name: "Settings",
      to: "/app/forms/$id/settings",
    },
  ];
  return (
    <div>
      <div className="border-b border-gray-200 mb-6 mt-8">
        <nav className="flex gap-8">
          {links.map((link) => {
            const isActive =
              location.pathname ===
              link.to.replace("$id", Route.useParams().id);
            return (
              <Link
                to={link.to}
                params={{ id: Route.useParams().id }}
                key={link.name}
                className="relative py-2 px-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className={isActive ? "text-accent" : ""}>
                  {link.name}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                    layoutId="underline"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
