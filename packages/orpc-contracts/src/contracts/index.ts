import { oc } from "@orpc/contract";

export const appContracts = oc.router({});

export type AppContracts = typeof appContracts;
