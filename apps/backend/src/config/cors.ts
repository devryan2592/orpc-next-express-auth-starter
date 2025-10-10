/**
 * Shared CORS configuration for both RPC and OpenAPI handlers
 * This eliminates duplication and provides a single source of truth for CORS settings
 */
export const corsConfig = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4000",
  ],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
};
