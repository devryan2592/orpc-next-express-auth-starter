/**
 * Shared CORS configuration for both RPC and OpenAPI handlers
 * This eliminates duplication and provides a single source of truth for CORS settings
 */
import dotenv from "dotenv";

dotenv.config();

const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const corsConfig = {
  origin: envOrigins,
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
};
