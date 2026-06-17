import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export async function GET() {
  const journeys = await prisma.journey.findMany({
    include: {
      days: { include: { stops: true } },
      route: { include: { era: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ journeys });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ip = getClientIp(request);
  const session = await auth();

  try {
    const journey = await prisma.journey.create({
      data: {
        creatorIp: ip,
        userId: (session?.user as any)?.id || null,
        title: body.title,
        totalDays: body.totalDays,
        budgetAmount: body.budgetAmount,
        transportMode: body.transportMode,
        travelStyle: body.travelStyle,
        departureCity: body.departureCity || null,
        departureDate: body.departureDate || null,
        rawJson: body.rawJson || null,
        days: {
          create: body.days.map((day: any) => ({
            dayNumber: day.dayNumber,
            title: day.title,
            notes: day.notes || "",
            stops: {
              create: (day.stops || day.items || []).map((stop: any) => ({
                timeSlot: stop.timeSlot,
                siteId: stop.siteId || null,
                customSpot: stop.customSpot || null,
                durationMin: stop.durationMin,
                tips: stop.tips || null,
                transportTip: stop.transportTip || null,
              })),
            },
          })),
        },
      },
      include: { days: { include: { stops: true } } },
    });
    return NextResponse.json(journey, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/journeys error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
