import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const journeys = await prisma.journey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, totalDays: true, budgetAmount: true,
      transportMode: true, travelStyle: true,
    },
    take: 20,
  });
  return Response.json({ journeys });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user ? (session.user as any).id as string : null;

  const { title, totalDays, budgetAmount, transportMode, travelStyle, rawJson } = await request.json();

  const journey = await prisma.journey.create({
    data: {
      title,
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
