import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  // Try Auth.js session first
  const session = await auth();
  if (session?.user) {
    const userId = (session.user as any).id;
    const guides = await prisma.guide.findMany({
      where: { userId },
      include: {
        destinationCity: { include: { province: { include: { country: true } } } },
        days: { include: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(guides);
  }

  // Try token auth
  const user = await getUserFromRequest(request);
  if (user) {
    const guides = await prisma.guide.findMany({
      where: { userId: user.id },
      include: {
        destinationCity: { include: { province: { include: { country: true } } } },
        days: { include: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(guides);
  }

  // Fallback to IP-based
  const ip = getClientIp(request);
  const guides = await prisma.guide.findMany({
    where: { creatorIp: ip },
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
      days: { include: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(guides);
}
