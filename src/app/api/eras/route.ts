import { prisma } from "@/lib/prisma";

export async function GET() {
  const eras = await prisma.era.findMany({
    orderBy: { startYear: "asc" },
    include: { sites: { select: { id: true, name: true, siteType: true, city: { select: { name: true } } } } },
  });
  return Response.json({ eras });
}
