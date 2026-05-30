import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GuideDetail from "@/components/guides/GuideDetail";
import { notFound } from "next/navigation";

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
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
  if (!guide) notFound();
  const serialized = JSON.parse(JSON.stringify(guide));
  const isOwner = !guide.isSystem && (session?.user as any)?.id === guide.userId;
  return <GuideDetail guide={serialized} isOwner={isOwner} />;
}
