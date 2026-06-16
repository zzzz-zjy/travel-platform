import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const journeys = await prisma.journey.findMany({
    where: { isSystem: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, totalDays: true, budgetAmount: true,
      transportMode: true, travelStyle: true,
      route: { select: { name: true, era: { select: { name: true, color: true } } } },
    },
    take: 20,
  });
  return Response.json({ journeys });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user ? (session.user as any).id as string : null;

  const { title, totalDays, budgetAmount, transportMode, travelStyle, rawJson } = await request.json();

  // Ensure at least one route exists for the FK constraint
  let routeId: number;
  const existingRoute = await prisma.route.findFirst();
  if (!existingRoute) {
    // Get the first era to satisfy FK constraint
    const firstEra = await prisma.era.findFirst({ orderBy: { id: "asc" } });
    const newRoute = await prisma.route.create({
      data: {
        name: "自定义路线",
        description: "用户自定义研学路线",
        totalDays: totalDays || 3,
        eraId: firstEra!.id,
      },
    });
    routeId = newRoute.id;
  } else {
    routeId = existingRoute.id;
  }

  const journey = await prisma.journey.create({
    data: {
      title,
      routeId,
      totalDays: totalDays || 3,
      budgetAmount: budgetAmount || 2000,
      transportMode: transportMode || "大巴+步行",
      travelStyle: travelStyle || "研学",
      rawJson: rawJson || null,
      userId: userId,
      isSystem: !userId,
    },
  });

  return Response.json({ id: journey.id });
}
