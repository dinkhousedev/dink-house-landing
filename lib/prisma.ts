import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set on the web container. In Coolify → Environment Variables, add DATABASE_URL as a Runtime variable for service web, then Restart.",
    );
  }

  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

/**
 * Lazy proxy so `next build` can import API routes without DATABASE_URL.
 * Coolify keeps that secret as a runtime env var, so it is absent during
 * Docker image build / "Collecting page data".
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then" || prop === "$$typeof") {
      return undefined;
    }

    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);

    return typeof value === "function" ? value.bind(client) : value;
  },
});
