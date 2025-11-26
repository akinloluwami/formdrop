import { Response, useContext, Route, RouteGroup } from "react-serve-js";
import { db } from "../db";
import { forms } from "../db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";

export const FormsRoutes = () => (
  <RouteGroup prefix="/forms">
    <Route path="/" method="GET">
      {async () => {
        const apiKey = useContext("apiKey");

        if (apiKey.type !== "private") {
          return (
            <Response
              status={403}
              json={{ error: "Private API key required" }}
            />
          );
        }

        const userForms = await db
          .select()
          .from(forms)
          .where(and(eq(forms.userId, apiKey.userId), isNull(forms.deletedAt)))
          .orderBy(desc(forms.createdAt));
        return <Response json={{ forms: userForms }} />;
      }}
    </Route>
  </RouteGroup>
);
