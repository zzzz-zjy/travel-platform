import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user) return (session.user as any).id as string;
  return null;
}

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const siteId = request.nextUrl.searchParams.get("siteId");
  if (siteId) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_siteId: { userId, siteId: parseInt(siteId) } },
    });
    return NextResponse.json({ favorited: !!fav });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      site: {
        include: {
          city: { select: { name: true, province: { select: { name: true } } } },
          era: { select: { name: true, color: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ favorites: favorites.map(f => ({ ...f.site, favoritedAt: f.createdAt })) });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { siteId } = await request.json();

  const existing = await prisma.favorite.findUnique({
    where: { userId_siteId: { userId, siteId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, siteId } });
  return NextResponse.json({ favorited: true });
}
