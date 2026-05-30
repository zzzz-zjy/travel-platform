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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  const guide = await prisma.guide.update({
    where: { id: parseInt(id) },
    data: { title: body.title },
  });
  return NextResponse.json(guide);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.guideItem.deleteMany({ where: { guideDay: { guideId: parseInt(id) } } });
  await prisma.guideDay.deleteMany({ where: { guideId: parseInt(id) } });
  await prisma.guide.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
