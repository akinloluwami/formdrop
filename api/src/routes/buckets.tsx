import { Response, useContext, Route, RouteGroup } from "react-serve-js";
import { db } from "../db";
import { buckets } from "../db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";

export const BucketsRoutes = () => (
  <RouteGroup prefix="/buckets">
    {/* Get all buckets */}
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

        const userBuckets = await db
          .select()
          .from(buckets)
          .where(
            and(eq(buckets.userId, apiKey.userId), isNull(buckets.deletedAt)),
          )
          .orderBy(desc(buckets.createdAt));

        return <Response json={{ buckets: userBuckets }} />;
      }}
    </Route>
  </RouteGroup>
);
