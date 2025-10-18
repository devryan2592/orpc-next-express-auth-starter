import { auth } from "./auth";

export { auth };
export type Auth = typeof auth;
export type Session = Auth["$Infer"]["Session"];

export { toNodeHandler } from "better-auth/node";
