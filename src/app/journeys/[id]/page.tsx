import { prisma } from "@/lib/prisma";
import JourneyDetail from "@/components/journeys/JourneyDetail";
import { notFound } from "next/navigation";

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const journey = await prisma.journey.findUnique({
    where: { id: parseInt(id) },
  });

  if (!journey) notFound();

  return <JourneyDetail journey={{
    id: journey.id,
    title: journey.title,
    totalDays: journey.totalDays,
    budgetAmount: journey.budgetAmount,
    transportMode: journey.transportMode,
    travelStyle: journey.travelStyle,
    rawJson: journey.rawJson,
    createdAt: journey.createdAt.toISOString(),
  }} />;
}
