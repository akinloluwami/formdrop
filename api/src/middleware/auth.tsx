import { Response, useSetContext } from "react-serve-js";
import { db } from "../db";
import { apiKeys } from "../db/schema";
import { eq } from "drizzle-orm";

export const authMiddleware = async (req: any, next: any) => {
  const apiKey = req.headers.authorization?.replace("Bearer ", "");

  if (!apiKey) {
    return (
      <Response
        status={401}
        json={{ error: "API key required in Authorization header" }}
      />
    );
  }

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.key, apiKey))
    .limit(1);

  if (!key) {
    return <Response status={401} json={{ error: "Invalid API key" }} />;
  }

  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id));

  useSetContext("apiKey", key);

  return next();
};
