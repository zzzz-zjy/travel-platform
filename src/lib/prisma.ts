import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrisma = () => {
  const url = process.env.DATABASE_URL!;
  if (url.startsWith("file:")) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    return new PrismaClient({ adapter: new PrismaLibSql({ url }) } as any);
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaPg } = require("@prisma/adapter-pg");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) } as any);
};

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
