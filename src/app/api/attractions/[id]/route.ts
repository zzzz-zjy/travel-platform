import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const attraction = await prisma.attraction.findUnique({
    where: { id: parseInt(id) },
    include: {
      city: { include: { province: { include: { country: true } } } },
    },
  });

  if (!attraction)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(attraction);
}
