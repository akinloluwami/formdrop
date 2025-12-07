import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [polarClient(), emailOTPClient(), adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
