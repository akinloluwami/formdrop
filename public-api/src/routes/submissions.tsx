import {
  Response,
  useContext,
  useRoute,
  Route,
  RouteGroup,
} from "react-serve-js";
import { db } from "../db";
import { forms, submissions } from "../db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";

export const SubmissionsRoutes = () => (
  <RouteGroup prefix="/:formId/submissions">
    {/* Get submissions for a form */}
    <Route path="/" method="GET">
      {async () => {
        const { params } = useRoute();
        const apiKey = useContext("apiKey");
        const { formId } = params;

        if (apiKey.type !== "private") {
          return (
            <Response
              status={403}
              json={{ error: "Private API key required" }}
            />
          );
        }

        const [form] = await db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, formId),
              eq(forms.userId, apiKey.userId),
              isNull(forms.deletedAt),
            ),
          )
          .limit(1);

        if (!form) {
          return <Response status={404} json={{ error: "Form not found" }} />;
        }

        const formSubmissions = await db
          .select()
          .from(submissions)
          .where(eq(submissions.formId, formId))
          .orderBy(desc(submissions.createdAt));

        return <Response json={{ submissions: formSubmissions }} />;
      }}
    </Route>

    {/* Delete a submission */}
    <Route path="/:submissionId" method="DELETE">
      {async () => {
        const { params } = useRoute();
        const apiKey = useContext("apiKey");
        const { formId, submissionId } = params;

        if (apiKey.type !== "private") {
          return (
            <Response
              status={403}
              json={{
                error: "Private API key required",
              }}
            />
          );
        }

        const [form] = await db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, formId),
              eq(forms.userId, apiKey.userId),
              isNull(forms.deletedAt),
            ),
          )
          .limit(1);

        if (!form) {
          return <Response status={404} json={{ error: "Form not found" }} />;
        }

        await db
          .delete(submissions)
          .where(
            and(
              eq(submissions.id, submissionId),
              eq(submissions.formId, formId),
            ),
          );

        return (
          <Response json={{ success: true, message: "Submission deleted" }} />
        );
      }}
    </Route>
  </RouteGroup>
);
