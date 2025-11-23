import { createFileRoute, Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRightDoubleIcon,
  Html5Icon,
  JavaScriptIcon,
} from "@hugeicons/core-free-icons";
import {
  BarChart3,
  Bell,
  ShieldCheck,
  Workflow,
  Zap,
  Mail,
  MessageSquare,
  Table,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { CopyButton } from "../components/copy-button";
import { authClient } from "@/lib/auth-client";
import { motion } from "motion/react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
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

  const htmlCodeExample = `<form
  action="https://api.formdrop.co/collect" 
  method="POST" name="contact-form">
  <input type="hidden" name="x-api-key" value="your-public-key" />
  <input type="text" name="name" placeholder="Your Name" required />
  <input type="email" name="email" placeholder="Your Email" required />
  <button type="submit">Submit</button>
</form>`;

  const fetchCodeExample = `fetch('https://api.formdrop.co/collect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': "Bearer your-public-key"
  },
  body: JSON.stringify({
    bucket: "contact-form",
    data: {
      name: "John Doe",
      email: "john.doe@example.com"
    }
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
`;

  const [selectedTab, setSelectedTab] = useState<"html" | "fetch">("html");

  const features = [
    {
      title: "Real-time Analytics",
      description:
        "Track form views, submissions, and conversion rates in real-time with our beautiful dashboard.",
      icon: BarChart3,
    },
    {
      title: "Instant Notifications",
      description:
        "Get notified immediately via Email, Slack, or Discord whenever someone submits a form.",
      icon: Bell,
    },
    {
      title: "Seamless Integrations",
      description:
        "Connect your forms to Google Sheets, Webhooks, and more to automate your workflow.",
      icon: Workflow,
    },
    {
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with spam protection and rolling API keys to keep your data safe.",
      icon: ShieldCheck,
    },
  ];

  const integrations = [
    {
      name: "Google Sheets",
      icon: Table,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    { name: "Slack", icon: Hash, color: "text-purple-600", bg: "bg-purple-50" },
    {
      name: "Discord",
      icon: MessageSquare,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    { name: "Email", icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <div className="p-3 sticky top-0 z-50">
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-full flex items-center justify-between px-6 py-3 max-w-5xl mx-auto shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
              <Zap size={18} fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">FormDrop</h2>
          </div>
          <div className="hidden md:flex gap-x-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
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

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto mt-20 px-4 text-center">
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
            Collect form submissions, view them in a dashboard, and get notified
            — all without writing a single line of backend code.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link to={session ? "/app/forms" : "/signup"}>
              <span className="rounded-full bg-accent text-white px-8 py-4 hover:bg-accent/90 transition-all flex items-center gap-x-2 font-medium text-lg shadow-lg shadow-accent/20 hover:shadow-xl hover:-translate-y-0.5">
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

        {/* Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="border rounded-3xl border-gray-200 bg-white shadow-xl shadow-gray-200/50 max-w-4xl mx-auto mt-20 p-2"
        >
          <div className="bg-gray-50/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-x-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                <button
                  onClick={() => setSelectedTab("html")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTab === "html"
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <HugeiconsIcon icon={Html5Icon} size={20} />
                  HTML
                </button>
                <button
                  onClick={() => setSelectedTab("fetch")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTab === "fetch"
                      ? "bg-yellow-50 text-yellow-700 shadow-sm ring-1 ring-yellow-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <HugeiconsIcon icon={JavaScriptIcon} size={20} />
                  Fetch
                </button>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-400/50" />
                <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/50" />
              </div>
            </div>
            <div className="relative group text-left">
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton
                  text={
                    selectedTab === "html" ? htmlCodeExample : fetchCodeExample
                  }
                />
              </div>
              <pre className="font-mono text-sm overflow-x-auto p-4 rounded-xl bg-white border border-gray-200 text-gray-800 leading-relaxed">
                <code>
                  {selectedTab === "html" ? htmlCodeExample : fetchCodeExample}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="py-32 bg-gray-50/50 mt-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to handle forms
            </h2>
            <p className="text-gray-600 text-lg">
              Stop worrying about servers, spam, and database maintenance. We
              handle the messy part so you can focus on building.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Connect with your favorite tools
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Streamline your workflow by connecting FormDrop to the tools you
                already use. Automatically sync submissions to Google Sheets or
                get notified in Slack and Discord.
              </p>
              <div className="space-y-4">
                {[
                  "Real-time notifications in Slack & Discord",
                  "Auto-sync to Google Sheets",
                  "Email auto-responders",
                  "Webhooks for custom integrations",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2
                      className="text-green-500 shrink-0"
                      size={20}
                    />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {integrations.map((item, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-3xl border border-gray-100 ${item.bg} flex flex-col items-center justify-center text-center gap-4 aspect-square transition-transform hover:scale-105`}
                >
                  <item.icon size={40} className={item.color} />
                  <span className="font-semibold text-gray-900">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-accent/20 via-gray-900 to-gray-900 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of developers who are saving time with FormDrop.
              Start collecting submissions in minutes.
            </p>
            <Link
              to={session ? "/app/forms" : "/signup"}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition-colors"
            >
              {session ? "Go to Dashboard" : "Create Free Account"}
              <HugeiconsIcon icon={ArrowRightDoubleIcon} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center text-white">
              <Zap size={14} fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900">FormDrop</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="/pricing" className="hover:text-gray-900">
              Pricing
            </a>
            <a href="/docs" className="hover:text-gray-900">
              Documentation
            </a>
            <a href="/terms" className="hover:text-gray-900">
              Terms
            </a>
            <a href="/privacy" className="hover:text-gray-900">
              Privacy
            </a>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} FormDrop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
