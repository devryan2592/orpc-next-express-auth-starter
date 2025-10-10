import { auth, type Session } from "@workspace/auth";
import type { Request, Response } from "express";

/**
 * Context for oRPC procedures
 * Contains database client, authentication session, and request/response objects
 */
export interface Context {
  session: Session | null;
  req: Request;
  res: Response;
}

/**
 * Create oRPC context from Express request and response
 */
export async function createORPCContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Context> {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: req.headers as any,
  });

  return {
    session,
    req,
    res,
  };
}
