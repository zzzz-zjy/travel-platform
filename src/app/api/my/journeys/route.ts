import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const ip = getClientIp(request);

  const journeys = await prisma.journey.findMany({
    where: userId
      ? { userId }
      : { creatorIp: ip },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, totalDays: true, budgetAmount: true },
  });

  return NextResponse.json({ journeys });
}
