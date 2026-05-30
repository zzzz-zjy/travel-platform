import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/auth-utils";

async function getUserId(request: Request): Promise<string | null> {
  const session = await auth();
  if (session?.user) return (session.user as any).id as string;
  const user = await getUserFromRequest(request);
  return user?.id || null;
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      guide: {
        include: {
          destinationCity: { include: { province: { include: { country: true } } } },
          days: { include: { items: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(favorites.map((f) => f.guide));
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { guideId } = await request.json();

  const existing = await prisma.favorite.findUnique({
    where: { userId_guideId: { userId, guideId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, guideId } });
  return NextResponse.json({ favorited: true });
}
