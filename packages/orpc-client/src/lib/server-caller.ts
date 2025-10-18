import type {
  AppContracts,
  ContractRouterClient,
} from "@workspace/orpc-contracts";
import { createRPCLink } from "./link";
import { createORPCClient } from "@orpc/client";

export function createServerClient(): ContractRouterClient<AppContracts> {
  const link = createRPCLink();
  return createORPCClient<AppContracts>(link);
}

export const serverCaller = createServerClient();
