import {
  Response,
  useContext,
  useRoute,
  Route,
  RouteGroup,
} from "react-serve-js";
import { db } from "../db";
import { buckets, submissions } from "../db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";

export const SubmissionsRoutes = () => (
  <RouteGroup prefix="/:bucketId/submissions">
    {/* Get submissions for a bucket */}
    <Route path="/" method="GET">
      {async () => {
        const { params } = useRoute();
        const apiKey = useContext("apiKey");
        const { bucketId } = params;

        if (!apiKey.canRead) {
          return (
            <Response
              status={403}
              json={{ error: "API key does not have read permissions" }}
            />
          );
        }

        const [bucket] = await db
          .select()
          .from(buckets)
          .where(
            and(
              eq(buckets.id, bucketId),
              eq(buckets.userId, apiKey.userId),
              isNull(buckets.deletedAt),
            ),
          )
          .limit(1);

        if (!bucket) {
          return <Response status={404} json={{ error: "Bucket not found" }} />;
        }

        const bucketSubmissions = await db
          .select()
          .from(submissions)
          .where(eq(submissions.bucketId, bucketId))
          .orderBy(desc(submissions.createdAt));

        return <Response json={{ submissions: bucketSubmissions }} />;
      }}
    </Route>

    {/* Delete a submission */}
    <Route path="/:submissionId" method="DELETE">
      {async () => {
        const { params } = useRoute();
        const apiKey = useContext("apiKey");
        const { bucketId, submissionId } = params;

        if (!apiKey.canWrite) {
          return (
            <Response
              status={403}
              json={{
                error: "API key does not have write permissions",
              }}
            />
          );
        }

        const [bucket] = await db
          .select()
          .from(buckets)
          .where(
            and(
              eq(buckets.id, bucketId),
              eq(buckets.userId, apiKey.userId),
              isNull(buckets.deletedAt),
            ),
          )
          .limit(1);

        if (!bucket) {
          return <Response status={404} json={{ error: "Bucket not found" }} />;
        }

        await db
          .delete(submissions)
          .where(
            and(
              eq(submissions.id, submissionId),
              eq(submissions.bucketId, bucketId),
            ),
          );

        return (
          <Response json={{ success: true, message: "Submission deleted" }} />
        );
      }}
    </Route>
  </RouteGroup>
);
