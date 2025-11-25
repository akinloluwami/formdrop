import { createFileRoute, Link } from "@tanstack/react-router";

import { Zap, Check, X } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { motion } from "motion/react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

function PricingPage() {
  const { data: session } = authClient.useSession();
  const [isAnnual, setIsAnnual] = useState(true);

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

  const freeFeatures = [
    { label: "Unlimited Submissions", included: true },
    { label: "Unlimited Forms", included: true },
    { label: "Email Notifications", included: true },
    { label: "Custom Redirects", included: true },
    { label: "Integrations", included: false },
    { label: "Basic Analytics", included: true },
    { label: "Slack & Discord Notifications", included: false },
    { label: "1,000 Row Exports", included: true },
  ];

  const proFeatures = [
    "Unlimited submissions",
    "Unlimited Forms",
    "Email, Slack & Discord Notifications",
    "Integrations",
    "Custom Redirects",
    "Advanced Analytics",
    "Unlimited Row Exports",
    "Monthly & Weekly Reports",
    "Priority Support",
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navbar */}
      <div className="p-3 sticky top-0 z-50">
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-full flex items-center justify-between px-6 py-3 max-w-5xl mx-auto shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
              <Zap size={18} fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">FormDrop</h2>
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
            className="rounded-full bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {session ? "Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Start for free, upgrade when you need more power. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span
              className={`text-sm font-medium ${!isAnnual ? "text-gray-900" : "text-gray-500"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 bg-gray-200 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent/20"
              aria-label="Toggle billing cycle"
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-sm"
                animate={{ x: isAnnual ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span
              className={`text-sm font-medium ${isAnnual ? "text-gray-900" : "text-gray-500"}`}
            >
              Annual <span className="text-accent font-bold">(Save 17%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-3xl border border-gray-200 p-8 bg-white hover:border-gray-300 transition-colors relative">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-gray-500 mb-6">Perfect for side projects</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-500">/month</span>
            </div>

            <Link
              to={session ? "/app/forms" : "/signup"}
              className="block w-full py-3 px-6 text-center rounded-xl bg-gray-50 text-gray-900 font-medium hover:bg-gray-100 transition-colors mb-8"
            >
              Get Started
            </Link>

            <ul className="space-y-4">
              {freeFeatures.map((feature) => (
                <li key={feature.label} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`text-gray-600 ${!feature.included && "line-through"}`}
                  >
                    {feature.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl border-2 border-accent p-8 bg-gray-900 text-white relative shadow-xl shadow-accent/10">
            <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-gray-400 mb-6">For serious businesses</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">
                ${isAnnual ? "24" : "29"}
              </span>
              <span className="text-gray-400">/month</span>
              {isAnnual && (
                <div className="text-sm text-accent mt-1">
                  Billed $288 yearly
                </div>
              )}
            </div>

            <Link
              to={session ? "/app/forms" : "/signup"}
              className="block w-full py-3 px-6 text-center rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors mb-8 shadow-lg shadow-accent/25"
            >
              Upgrade to Pro
            </Link>

            <ul className="space-y-4">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-gray-200">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-12 bg-white mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center text-white">
              <Zap size={14} fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900">FormDrop</span>
          </div>

          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} FormDrop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
