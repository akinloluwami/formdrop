import { Response, Route } from "react-serve-js";

export const HealthCheckRoute = () => (
  <Route path="/" method="GET">
    {() => {
      return <Response json={{ message: "FormDrop API v1.0" }} />;
    }}
  </Route>
);
