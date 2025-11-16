import { createFileRoute, Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRightDoubleIcon,
  Html5Icon,
  JavaScriptIcon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { CopyButton } from "../components/CopyButton";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const links = [
    {
      href: "/pricing",
      label: "Pricing",
    },
    {
      href: "/docs",
      label: "Docs",
    },
    {
      href: "/login",
      label: "Login",
    },
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

  return (
    <div className="p-3">
      <div className="bg-white border border-gray-100 rounded-full flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold">FormDrop</h2>
        <div className="flex gap-x-7 mt-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-gray-600 hover:underline text-lg"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button className="rounded-full bg-gray-950 text-white px-4 py-3 hover:bg-gray-800">
          Get Started
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-20">
        <h1 className="text-7xl font-semibold">
          {" "}
          Effortless <span className="">No-Backend</span> <br />
          Form API.
        </h1>
        <p className="mt-4 text-lg text-[#212121]">
          Collect form submissions, view them in a dashboard, and get notified —
          all without the hassle.
        </p>
        <button>
          <span className="rounded-full bg-gray-950 text-white px-6 py-4 hover:bg-gray-800 mt-6 flex gap-x-2">
            Get Started for Free <HugeiconsIcon icon={ArrowRightDoubleIcon} />
          </span>
        </button>
      </div>
      <div className="border rounded-3xl border-gray-200 max-w-4xl mx-auto mt-15 p-4">
        <div className="flex items-center gap-x-4 relative">
          {/* Animated indicator background */}
          <div
            className={`absolute h-10 w-10 rounded-lg transition-all duration-300 ease-out ${
              selectedTab === "html"
                ? "bg-orange-100 ring-2 ring-orange-600 translate-x-0"
                : "bg-yellow-100 ring-2 ring-yellow-500 translate-x-14"
            }`}
          />

          <button
            onClick={() => setSelectedTab("html")}
            className="p-2 rounded-lg transition-colors relative z-10 hover:bg-black/5"
          >
            <HugeiconsIcon
              icon={Html5Icon}
              className="text-orange-600"
              size={24}
            />
          </button>
          <button
            onClick={() => setSelectedTab("fetch")}
            className="p-2 rounded-lg transition-colors relative z-10 hover:bg-black/5"
          >
            <HugeiconsIcon
              icon={JavaScriptIcon}
              className="text-yellow-500"
              size={24}
            />
          </button>
        </div>
        <div className="border rounded-3xl border-gray-200 p-4 mt-5 relative">
          <CopyButton
            text={selectedTab === "html" ? htmlCodeExample : fetchCodeExample}
          />
          {selectedTab === "html" ? (
            <pre>
              <code>{htmlCodeExample}</code>
            </pre>
          ) : (
            <pre>
              <code>{fetchCodeExample}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
