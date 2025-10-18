import { RPCLink } from "@orpc/client/fetch";

/* Base URL getter */
export const getBaseURL = () => {
  // In production, use the NEXT_PUBLIC_API_URL environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Derive in browser: always target api.<base-domain> when not on localhost
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    if (isLocal) return "http://localhost:8000";

    const protocol = window.location.protocol;
    const parts = host.split(".");

    // Naively derive eTLD+1 (last two labels) to strip subdomains like www, crm, etc.
    let baseDomain = parts.length >= 2 ? parts.slice(-2).join(".") : host;
    if (baseDomain.startsWith("www.")) baseDomain = baseDomain.slice(4);
    return `${protocol}//api.${baseDomain}`;
  }

  // Server-side fallback: development stays localhost; production uses a safe default
  return process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://api.smartturnholidays.com";
};

// Build the auth headers for RPC (cookie-based session)
async function getAuthHeaders() {
  try {
    if (typeof window === "undefined") {
      // Server-side: pull cookies and user-agent from Next headers API
      const { cookies, headers } = await import("next/headers");
      const cookieStore = await cookies();
      const headersList = await headers();
      const sessionToken = cookieStore.get("st_auth.session_token");
      const userAgent = headersList.get("user-agent");
      const headersObj: Record<string, string> = {};
      if (sessionToken?.value)
        headersObj["Cookie"] = `st_auth.session_token=${sessionToken.value}`;
      if (userAgent) headersObj["User-Agent"] = userAgent;
      return headersObj;
    }
  } catch (e) {
    // Ignore header extraction failures; proceed without custom headers
  }
  return {};
}

// RPC Link Building
export const createRPCLink = () => {
  return new RPCLink({
    url: getBaseURL() + "/api/v1/rpc",
    headers: getAuthHeaders(),
    fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
    method: (options, _path, _input) => {
      const ctx = options.context;
      return ctx.method ?? "POST";
    },
  });
};
