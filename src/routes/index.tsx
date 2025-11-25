import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "../components/landing/navbar";
import { Hero } from "../components/landing/hero";
import { CodePreview } from "../components/landing/code-preview";
import { FeaturesGrid } from "../components/landing/features-grid";
import { FrontendFrameworks } from "../components/landing/frontend-frameworks";
import { Integrations } from "../components/landing/integrations";
import { CTA } from "../components/landing/cta";
import { Footer } from "../components/landing/footer";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <CodePreview />
      <FeaturesGrid />
      <FrontendFrameworks />
      <Integrations />
      <CTA />
      <Footer />
    </div>
  );
}
