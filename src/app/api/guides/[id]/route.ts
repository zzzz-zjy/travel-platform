import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const guide = await prisma.guide.findUnique({
    where: { id: parseInt(id) },
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
      days: {
        orderBy: { dayNumber: "asc" },
        include: { items: { include: { attraction: true }, orderBy: { timeSlot: "asc" } } },
      },
    },
  });
  if (!guide) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(guide);
}
