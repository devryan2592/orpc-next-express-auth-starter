// ORPC Client Package - Main Exports

// ===== React Components & Providers =====
export { ORPCReactProvider, getBrowserQueryClient } from './lib/provider';
export { HydrateClient, getQueryClient } from './lib/hydration';

// ===== Query Client Utilities =====
export { createQueryClient } from './lib/query-client';

// ===== RPC Link & Connection =====
export { createRPCLink, getBaseURL } from './lib/link';

// ===== Server-Side Utilities =====
export { createServerClient, serverCaller } from './lib/server-caller';

// ===== Serialization =====
export { serializer } from './lib/serializer';

// ===== Type Exports =====
export type {
  AppContracts,
  ContractRouterClient,
} from '@workspace/orpc-contracts';