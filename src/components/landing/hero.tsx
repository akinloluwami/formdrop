import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightDoubleIcon } from "@hugeicons/core-free-icons";
import { authClient } from "@/lib/auth-client";

export function Hero() {
  const { data: session } = authClient.useSession();

  return (
    <div className="max-w-5xl mx-auto mt-20 px-4 text-center relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          v1.0 is now live
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
          The backend for your <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-gray-900 via-accent to-gray-900">
            headless forms
          </span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Collect form submissions, view them in a dashboard, and get notified —
          all without writing a single line of backend code.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          <Link to={session ? "/app/forms" : "/signup"}>
            <span className="rounded-full bg-accent text-white px-8 py-4 hover:bg-accent/90 transition-all flex items-center gap-x-2 font-medium text-lg border border-accent hover:-translate-y-0.5">
              {session ? "Go to Dashboard" : "Start for Free"}
              <HugeiconsIcon icon={ArrowRightDoubleIcon} />
            </span>
          </Link>
          <a
            href="/docs"
            className="px-8 py-4 rounded-full text-gray-600 hover:bg-gray-50 font-medium transition-colors"
          >
            Read Documentation
          </a>
        </div>
      </motion.div>
    </div>
  );
}
