import express, { Express } from "express";
import cors from "cors";

import { auth, toNodeHandler } from "@workspace/auth";

import { RPCHandler } from "@orpc/server/node";
import { createORPCContext } from "@/context";
import router from "@/routers";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { CORSPlugin } from "@orpc/server/plugins";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { corsConfig } from "@/config/cors";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

const app: Express = express();

app.use(cors(corsConfig));

// Better Auth Routes
app.use("/api/v1/auth", toNodeHandler(auth));

// Create ORPC handler
const rpcHandler = new RPCHandler(router, {
  plugins: [new CORSPlugin(corsConfig)],
});

const handler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin(corsConfig),
    new OpenAPIReferencePlugin({
      docsProvider: "swagger", // Can be "swagger" or "scalar"
      docsPath: "/", // API documentation will be served at root
      specPath: "/spec.json", // OpenAPI spec will be available at /spec.json
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "ST Holidays API",
          version: "1.0.0",
          description: "API for ST Holidays tourism management platform",
        },
        servers: [
          {
            url: "/api/v1/rpc",
            description: "Development server",
          },
        ],
        security: [
          {
            bearerAuth: [],
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              description: "Bearer token authentication",
            },
          },
        },
      },
    }),
  ],
});

// OpenAPI documentation and spec routes
app.use(async (req, res, next) => {
  // Handle OpenAPI documentation at root and spec.json
  if (req.path === "/" || req.path === "/spec.json") {
    const context = await createORPCContext({ req, res });
    const { matched } = await handler.handle(req, res, {
      context,
    });

    if (matched) {
      return;
    }
  }
  next();
});

// oRPC API routes
app.use("/api/v1/rpc", async (req, res, next) => {
  const context = await createORPCContext({ req, res });
  const { matched } = await rpcHandler.handle(req, res, {
    prefix: "/api/v1/rpc",
    context,
  });

  if (matched) {
    return;
  }

  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
