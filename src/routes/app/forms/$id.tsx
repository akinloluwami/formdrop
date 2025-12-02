import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/lib/app-client";

export const Route = createFileRoute("/app/forms/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();
  const { id } = Route.useParams();

  const { data: form } = useQuery({
    queryKey: ["form", id],
    queryFn: async () => {
      const response = await appClient.forms.get(id);
      if ("error" in response) {
        throw new Error(response.error);
      }
      return response.form;
    },
  });

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
      name: "Integrations",
      to: "/app/forms/$id/integrations",
    },
    {
      name: "Settings",
      to: "/app/forms/$id/settings",
    },
  ];
  return (
    <div>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 mb-6 pt-8">
        <h1 className="text-2xl font-bold mb-4">{form?.name}</h1>
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
