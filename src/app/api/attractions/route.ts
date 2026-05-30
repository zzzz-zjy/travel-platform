import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country");
  if (!country)
    return NextResponse.json({ error: "country required" }, { status: 400 });

  const attractions = await prisma.attraction.findMany({
    where: { city: { province: { country: { slug: country } } } },
    include: { city: { include: { province: true } } },
  });

  return NextResponse.json(attractions);
}
