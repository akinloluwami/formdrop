import { Link } from "@tanstack/react-router";
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
        <Link to="/" className="flex items-center gap-2">
          <img src="/purple_icon.svg" alt="FormDrop Logo" className="w-7" />
          <span className="font-bold text-gray-900">FormDrop</span>
        </Link>
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
          className="rounded-full bg-accent text-white px-5 py-3 font-medium hover:bg-accent/90 transition-colors"
        >
          {session ? "Dashboard" : "Get Started"}
        </Link>
      </div>
    </div>
  );
}
