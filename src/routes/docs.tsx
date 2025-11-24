import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { Zap, Menu } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/docs")({
  component: DocsLayout,
});

function DocsLayout() {
  const { data: session } = authClient.useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Docs Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="font-bold text-xl tracking-tight">FormDrop</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <span className="px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                Docs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to={session ? "/app/forms" : "/login"}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {session ? "Dashboard" : "Login"}
            </Link>
            <Link
              to={session ? "/app/forms" : "/signup"}
              className="hidden sm:block rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {session ? "Go to App" : "Get Started"}
            </Link>
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        <DocsSidebar />
        <main className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
