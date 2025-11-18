import { Response, useContext, Route, RouteGroup } from "react-serve-js";
import { db } from "../db";
import { buckets } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const BucketsRoutes = () => (
  <RouteGroup prefix="/buckets">
    {/* Get all buckets */}
    <Route path="/" method="GET">
      {async () => {
        const apiKey = useContext("apiKey");

        if (!apiKey.canRead) {
          return (
            <Response
              status={403}
              json={{ error: "API key does not have read permissions" }}
            />
          );
        }

        const userBuckets = await db
          .select()
          .from(buckets)
          .where(eq(buckets.userId, apiKey.userId))
          .orderBy(desc(buckets.createdAt));

        return <Response json={{ buckets: userBuckets }} />;
      }}
    </Route>
  </RouteGroup>
);
