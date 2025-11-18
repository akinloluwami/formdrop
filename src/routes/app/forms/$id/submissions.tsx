import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/forms/$id/submissions")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app/forms/$id"!</div>;
}
