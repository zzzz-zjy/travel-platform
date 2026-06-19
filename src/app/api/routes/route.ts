import { prisma } from "@/lib/prisma";

export async function GET() {
  const routes = await prisma.route.findMany({
    include: {
      era: { select: { name: true, color: true } },
      stops: {
        orderBy: [{ day: "asc" }, { order: "asc" }],
        include: {
          site: {
            select: { id: true, name: true, siteType: true, city: { select: { name: true } } },
          },
        },
      },
    },
  });

  return Response.json({ routes });
}
