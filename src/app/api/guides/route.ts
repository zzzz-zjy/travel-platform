import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export async function GET() {
  const guides = await prisma.guide.findMany({
    where: { isSystem: true },
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
      days: { include: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(guides);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ip = getClientIp(request);
  const session = await auth();
  const guide = await prisma.guide.create({
    data: {
      creatorIp: ip,
      userId: (session?.user as any)?.id || null,
      title: body.title,
      destinationCityId: body.destinationCityId,
      totalDays: body.totalDays,
      budgetAmount: body.budgetAmount,
      transportMode: body.transportMode,
      travelStyle: body.travelStyle,
      rawJson: body.rawJson ? JSON.stringify(body.rawJson) : null,
      days: {
        create: body.days.map((day: any) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          notes: day.notes || "",
          items: {
            create: day.items.map((item: any) => ({
              timeSlot: item.timeSlot,
              attractionId: item.attractionId || null,
              customSpot: item.customSpot || null,
              durationMin: item.durationMin,
              ticketReminder: item.ticketReminder || null,
              tips: item.tips || null,
            })),
          },
        })),
      },
    },
    include: { days: { include: { items: true } } },
  });
  return NextResponse.json(guide, { status: 201 });
}
