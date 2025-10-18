import { createAuthClient } from "better-auth/client";
import { getBaseURL } from "@workspace/orpc-client/lib/link";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: getBaseURL(),
    basePath: "api/v1/auth",
    plugins: [],
    fetchOptions: {
      credentials: "include",
    },
  }
);
