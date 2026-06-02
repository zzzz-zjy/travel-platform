import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrisma = () => {
  const url = process.env.DATABASE_URL!;
  // Local SQLite (file:) or Turso (libsql://)
  if (url.startsWith("file:") || url.startsWith("libsql://") || url.startsWith("https://")) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const options: Record<string, string> = { url };
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (authToken) options.authToken = authToken;
    return new PrismaClient({ adapter: new PrismaLibSql(options) } as any);
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaPg } = require("@prisma/adapter-pg");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) } as any);
};

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
