import { App, RouteGroup, Middleware, serve } from "react-serve-js";
import { CollectRoute } from "./routes/collect";
import { FormsRoutes } from "./routes/forms";
import { SubmissionsRoutes } from "./routes/submissions";
import { authMiddleware } from "./middleware/auth";

function Backend() {
  return (
    <App
      port={1400}
      parseBody={true}
      cors={{
        origin: "*",
      }}
    >
      <CollectRoute />

      <RouteGroup prefix="/api">
        <Middleware use={authMiddleware} />
        <FormsRoutes />
        <SubmissionsRoutes />
      </RouteGroup>
    </App>
  );
}

serve(<Backend />);
