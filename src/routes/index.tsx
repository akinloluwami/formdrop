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
                to={link.href}
                href={link.href}
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
            Collect form submissions, view them in a dashboard, and get notified
            — all without writing a single line of backend code.
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

        {/* Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="border rounded-3xl border-gray-200 bg-white max-w-4xl mx-auto mt-20 p-2 relative"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-accent/30 to-purple-600/30 rounded-4xl blur-xl opacity-20 -z-10"></div>
          <div className="bg-gray-50/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-x-2 bg-white p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setSelectedTab("html")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTab === "html"
                      ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
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
                      ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
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

          <div className="grid md:grid-cols-3 gap-6">
            {/* Analytics - Spans 2 cols */}
            <div className="md:col-span-2 bg-white rounded-4xl border border-gray-200 p-8 overflow-hidden relative group hover:border-accent/20 transition-colors">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Real-time Analytics
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-md">
                  Track form views, submissions, and conversion rates in
                  real-time. Get insights into how your forms are performing.
                </p>
              </div>

              {/* Visual */}
              <div className="absolute right-0 bottom-0 w-1/2 h-48 bg-gray-50 rounded-tl-3xl border-t border-l border-gray-100 p-4 flex items-end gap-2 group-hover:scale-105 transition-transform origin-bottom-right">
                {/* Fake bars */}
                <div className="w-full bg-accent/10 rounded-t-lg h-[40%] relative group-hover:h-[50%] transition-all duration-500"></div>
                <div className="w-full bg-accent/20 rounded-t-lg h-[70%] relative group-hover:h-[80%] transition-all duration-500 delay-75"></div>
                <div className="w-full bg-accent/30 rounded-t-lg h-[50%] relative group-hover:h-[60%] transition-all duration-500 delay-100"></div>
                <div className="w-full bg-accent/40 rounded-t-lg h-[85%] relative group-hover:h-[95%] transition-all duration-500 delay-150"></div>
                <div className="w-full bg-accent rounded-t-lg h-[65%] relative group-hover:h-[75%] transition-all duration-500 delay-200"></div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-4xl border border-gray-200 p-8 relative overflow-hidden group hover:border-accent/20 transition-colors">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                  <Bell size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Instant Alerts
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get notified immediately via Email, Slack, or Discord.
                </p>
              </div>

              {/* Visual */}
              <div className="absolute -right-4 top-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bell size={120} />
              </div>
            </div>

            {/* Integrations */}
            <div className="bg-white rounded-4xl border border-gray-200 p-8 relative overflow-hidden group hover:border-accent/20 transition-colors">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <Workflow size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Integrations
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect to Google Sheets, Webhooks, and more.
                </p>
              </div>
              {/* Visual */}
              <div className="absolute bottom-4 right-4 flex -space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-600">
                  <Table size={14} />
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-purple-600">
                  <Hash size={14} />
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600">
                  <MessageSquare size={14} />
                </div>
              </div>
            </div>

            {/* Security - Spans 2 cols */}
            <div className="md:col-span-2 bg-white rounded-4xl border border-gray-200 p-8 overflow-hidden relative group hover:border-accent/20 transition-colors">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Spam Protection & Security
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-md">
                  Built-in spam filtering keeps your inbox clean. Secure your
                  forms with rolling API keys and allowed domains.
                </p>
              </div>

              {/* Visual */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3 shadow-sm rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-green-800 font-medium">
                      Spam Check Passed
                    </div>
                    <div className="text-[10px] text-green-600">
                      Score: 98/100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BYO Frontend Section */}
      <div className="py-32 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-7xl md:text-4xl font-bold text-gray-900 mb-6">
              Bring Your Own Frontend
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              FormDrop is framework agnostic. Whether you're building a static
              site, a single page app, or a server-rendered application, we've
              got you covered.
            </p>
          </motion.div>
        </div>

        <div className="relative flex flex-col gap-8">
          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-gray-50 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-gray-50 to-transparent z-10"></div>

          {/* Row 1 - Left to Right */}
          <div className="flex overflow-hidden">
            <motion.div
              className="flex gap-6 px-3"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 30,
              }}
            >
              {[
                ...[
                  { name: "React", color: "text-blue-500 bg-blue-50" },
                  { name: "Vue.js", color: "text-green-500 bg-green-50" },
                  { name: "Next.js", color: "text-gray-800 bg-gray-100" },
                  { name: "Svelte", color: "text-orange-500 bg-orange-50" },
                  { name: "Remix", color: "text-indigo-500 bg-indigo-50" },
                  { name: "Astro", color: "text-purple-500 bg-purple-50" },
                  { name: "Solid", color: "text-blue-600 bg-blue-50" },
                ],
                ...[
                  { name: "React", color: "text-blue-500 bg-blue-50" },
                  { name: "Vue.js", color: "text-green-500 bg-green-50" },
                  { name: "Next.js", color: "text-gray-800 bg-gray-100" },
                  { name: "Svelte", color: "text-orange-500 bg-orange-50" },
                  { name: "Remix", color: "text-indigo-500 bg-indigo-50" },
                  { name: "Astro", color: "text-purple-500 bg-purple-50" },
                  { name: "Solid", color: "text-blue-600 bg-blue-50" },
                ],
              ].map((tech, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl border border-gray-200/50 shadow-sm whitespace-nowrap ${tech.color}`}
                >
                  <span className="font-bold text-lg">{tech.name}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 2 - Right to Left */}
          <div className="flex overflow-hidden">
            <motion.div
              className="flex gap-6 px-3"
              animate={{ x: ["-50%", "0%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 30,
              }}
            >
              {[
                ...[
                  { name: "HTML5", color: "text-orange-600 bg-orange-50" },
                  { name: "Angular", color: "text-red-600 bg-red-50" },
                  { name: "Nuxt", color: "text-green-600 bg-green-50" },
                  { name: "Gatsby", color: "text-purple-600 bg-purple-50" },
                  { name: "Qwik", color: "text-blue-500 bg-blue-50" },
                  { name: "Eleventy", color: "text-gray-700 bg-gray-100" },
                  { name: "Jekyll", color: "text-red-500 bg-red-50" },
                ],
                ...[
                  { name: "HTML5", color: "text-orange-600 bg-orange-50" },
                  { name: "Angular", color: "text-red-600 bg-red-50" },
                  { name: "Nuxt", color: "text-green-600 bg-green-50" },
                  { name: "Gatsby", color: "text-purple-600 bg-purple-50" },
                  { name: "Qwik", color: "text-blue-500 bg-blue-50" },
                  { name: "Eleventy", color: "text-gray-700 bg-gray-100" },
                  { name: "Jekyll", color: "text-red-500 bg-red-50" },
                ],
              ].map((tech, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl border border-gray-200/50 shadow-sm whitespace-nowrap ${tech.color}`}
                >
                  <span className="font-bold text-lg">{tech.name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
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
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-green-600" size={14} />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="relative">
              {/* Central Hub Visualization */}
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Center Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-gray-100 relative">
                    <div className="absolute inset-0 bg-accent/5 rounded-3xl animate-pulse"></div>
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white relative z-10">
                      <Zap size={24} fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Orbiting Nodes */}
                {integrations.map((item, i) => {
                  const angle = (i * 360) / integrations.length;
                  const radius = 140; // Distance from center
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;

                  return (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2"
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      whileInView={{ x, y, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: i * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }}
                    >
                      {/* Connecting Line */}
                      <div
                        className="absolute top-1/2 left-1/2 h-0.5 bg-linear-to-r from-accent/20 to-transparent origin-left -z-10"
                        style={{
                          width: radius,
                          transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius / 2}px, 0)`,
                        }}
                      />

                      <div
                        className={`-translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center ${item.color} hover:scale-110 transition-transform cursor-pointer`}
                      >
                        <item.icon size={24} />
                      </div>
                    </motion.div>
                  );
                })}

                {/* Orbit Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-dashed border-gray-200 rounded-full -z-10 animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-gray-100 rounded-full -z-20"></div>
              </div>
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
              Join developers who are saving time with FormDrop. Start
              collecting submissions in minutes.
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
