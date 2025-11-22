import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft01Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const Route = createFileRoute("/app/forms/$id/integrations")({
  component: RouteComponent,
});

function RouteComponent() {
  const integrations = [
    {
      name: "Google Sheets",
      description: "Automatically sync form submissions to Google Sheets",
      icon: (
        <img
          src="/google-sheet.svg"
          alt="Google Sheets"
          className="w-10 h-10"
        />
      ),
      bgColor: "bg-green-50",
      isConnected: false,
    },
    {
      name: "Airtable",
      description: "Send form submissions to your Airtable base",
      icon: <img src="/airtable.svg" alt="Airtable" className="w-10 h-10" />,
      bgColor: "bg-yellow-50",
      isConnected: false,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-x-3 py-2 mb-6">
        <Link
          to="/app/forms"
          className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
        </Link>
        <h2 className="text-lg font-semibold">Integrations</h2>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`h-16 w-16 ${integration.bgColor} rounded-2xl flex items-center justify-center`}
                >
                  {integration.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{integration.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {integration.description}
                  </p>
                </div>
              </div>

              <button className="px-4 py-3 bg-accent text-white text-sm font-medium rounded-3xl hover:bg-accent/90 transition-colors inline-flex items-center gap-2">
                <HugeiconsIcon icon={LinkSquare02Icon} size={16} />
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-3xl p-6">
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold mb-1">Need another integration?</h4>
            <p className="text-gray-700 text-sm">
              Let us know which services you'd like to connect and we'll
              prioritize them in our roadmap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
