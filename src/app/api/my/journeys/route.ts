import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ journeys: [] });

  const userId = (session.user as any).id as string;
  const journeys = await prisma.journey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, totalDays: true, budgetAmount: true },
  });

  return NextResponse.json({ journeys });
}
