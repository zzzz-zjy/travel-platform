import { prisma } from "@/lib/prisma";
import GuideDetail from "@/components/guides/GuideDetail";
import { notFound } from "next/navigation";

async function getGuide(id: number) {
  return prisma.guide.findUnique({
    where: { id },
    include: {
      destinationCity: { include: { province: { include: { country: true } } } },
      days: {
        orderBy: { dayNumber: "asc" },
        include: { items: { include: { attraction: true }, orderBy: { timeSlot: "asc" } } },
      },
    },
  });
}

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = await getGuide(parseInt(id));
  if (!guide) notFound();
  const serialized = JSON.parse(JSON.stringify(guide));
  return <GuideDetail guide={serialized} />;
}
