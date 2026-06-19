import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import JourneyDetail from "@/components/journeys/JourneyDetail";
import { notFound } from "next/navigation";

export default async function JourneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const journey = await prisma.journey.findUnique({
    where: { id: parseInt(id) },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          stops: {
            include: { site: true },
            orderBy: { timeSlot: "asc" },
          },
        },
      },
      route: { include: { era: true } },
    },
  });

  if (!journey) notFound();

  const serialized = JSON.parse(JSON.stringify(journey));
  const isOwner = !journey.isSystem && (session?.user as any)?.id === journey.userId;
  return <JourneyDetail journey={serialized} isOwner={isOwner} />;
}
