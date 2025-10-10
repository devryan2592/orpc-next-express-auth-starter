import { implement } from "@orpc/server";
import {
  appContracts,
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@workspace/orpc-contracts";
import { ORPCError } from "@orpc/server";
import { ZodError } from "zod";
import { Context } from "@/context";

const implementor = implement(appContracts);

const os = implementor.$context<Context>();

const errorFormattingMiddleware = os.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Validation error",
        cause: error.errors,
      });
    }
    throw error;
  }
});

const timingMiddleware = os.middleware(async ({ next, path }) => {
  const start = Date.now();

  try {
    return await next();
  } finally {
    console.log(
      `[oRPC] ${path.join(".")} took ${Date.now() - start}ms to execute`
    );
  }
});

// Auth middleware: ensures a session exists
const isAuthed = os.middleware(({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
  }
  // Forward the existing context; session is known to be non-null here
  return next({
    context: {
      ...context,
      session: context.session,
    },
  });
});

// Public procedure: no auth required
export const publicProcedure = os
  .use(timingMiddleware)
  .use(errorFormattingMiddleware);

// Private procedure: requires auth
export const privateProcedure = publicProcedure.use(isAuthed);

export { os };

// Input and Output types
export type Inputs = InferContractRouterInputs<typeof appContracts>;
export type Outputs = InferContractRouterOutputs<typeof appContracts>;
