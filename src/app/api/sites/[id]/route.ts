import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id: parseInt(id) },
    include: {
      era: { select: { name: true, color: true, description: true } },
      city: {
        select: {
          name: true,
          province: { select: { name: true } },
          lat: true, lng: true,
        },
      },
      event: { select: { name: true, date: true, description: true } },
    },
  });

  if (!site) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ site });
}
