import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const { data: session } = authClient.useSession();

  const links = [
    {
      href: "/pricing",
      label: "Pricing",
    },
    {
      href: "/docs",
      label: "Docs",
    },
    // Only show Login if not logged in
    ...(!session
      ? [
          {
            href: "/login",
            label: "Login",
          },
        ]
      : []),
  ];

  return (
    <div className="p-3 sticky top-0 z-50">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-full flex items-center justify-between px-6 py-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
            <Zap size={18} fill="currentColor" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">FormDrop</h2>
        </div>
        <div className="hidden md:flex gap-x-8">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          to={session ? "/app/forms" : "/signup"}
          className="rounded-full bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          {session ? "Dashboard" : "Get Started"}
        </Link>
      </div>
    </div>
  );
}
