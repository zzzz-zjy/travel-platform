import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";

  const attractions = await prisma.attraction.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { city: { name: { contains: q } } },
        { city: { province: { name: { contains: q } } } },
      ],
    },
    include: { city: { include: { province: { include: { country: true } } } } },
    take: 10,
  });

  const guides = await prisma.guide.findMany({
    where: {
      isSystem: true,
      OR: [
        { title: { contains: q } },
        { destinationCity: { name: { contains: q } } },
      ],
    },
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
    },
    take: 5,
  });

  return NextResponse.json({
    attractions: JSON.parse(JSON.stringify(attractions)),
    guides: JSON.parse(JSON.stringify(guides)),
  });
}
