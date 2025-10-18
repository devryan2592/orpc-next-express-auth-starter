import { PrismaClient } from "./generated/prisma";

export * from "./generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Use globalThis to access process safely
const nodeProcess = (globalThis as any).process;
if (nodeProcess && nodeProcess.env?.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
