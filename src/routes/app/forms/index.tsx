import { MouseLeftClick01Icon } from "@hugeicons/core-free-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import moment from "moment";
import { HugeiconsIcon } from "@hugeicons/react";

export const Route = createFileRoute("/app/forms/")({
  component: RouteComponent,
});

function RouteComponent() {
  const mockforms = [
    {
      id: "d6a16be0-7d83-4378-b864-8a4933e1dd28",
      name: "Contact Us",
      submissions: 45,
      createdAt: "2025-10-01T12:34:56Z",
    },
    {
      id: "153cf678-c586-4d8c-bc47-4a8190394a5b",
      name: "Feedback",
      submissions: 30,
      createdAt: "2025-10-02T12:34:56Z",
    },
    {
      id: "cd79118a-342f-48b2-8a15-fbc7ec7ce7d3",
      name: "Survey",
      submissions: 25,
      createdAt: "2025-11-03T12:34:56Z",
    },
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      name: "New Form",
      submissions: 0,
      createdAt: "2025-11-15T12:34:56Z",
    },
  ];
  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <h2 className="text-lg font-semibold">Forms</h2>
        <button className="bg-accent hover:bg-accent/90 transition-colors text-white px-5 py-3 rounded-3xl font-semibold text-sm">
          Create Form
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {mockforms.map((form) => (
          <Link
            to="/app/forms/$id/submissions"
            params={{
              id: form.id,
            }}
            key={form.id}
            className="p-5 border border-gray-200 rounded-3xl flex justify-between items-center hover:border-accent/50 transition-colors"
          >
            <div className="">
              <h3 className="text-sm font-medium">{form.name}</h3>
              <div className="flex gap-x-2 items-center mt-1">
                <p className="text-xs text-gray-600">{form.id}</p>
                <p className="text-xs text-gray-600 bg-gray-200/70 px-2 py-1 rounded-lg">
                  {moment(form.createdAt).format("MMM DD")}
                </p>
              </div>
            </div>
            <div className="flex gap-x-2">
              <div className="flex items-center text-gray-500 bg-gray-200/70 px-3 py-1 rounded-lg font-medium gap-x-2">
                <HugeiconsIcon
                  icon={MouseLeftClick01Icon}
                  size={14}
                  className="text-accent"
                />
                <span className="text-xs">{form.submissions}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
