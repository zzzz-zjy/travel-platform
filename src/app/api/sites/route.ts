import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province");
  if (!province) {
    return Response.json({ sites: [] });
  }

  const sites = await prisma.site.findMany({
    where: {
      city: { province: { name: province } },
    },
    select: { id: true, name: true, siteType: true },
    orderBy: { rating: "desc" },
  });

  return Response.json({ sites });
}
