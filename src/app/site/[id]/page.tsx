import { prisma } from "@/lib/prisma";
import SiteDetail from "@/components/sites/SiteDetail";
import { notFound } from "next/navigation";

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id: parseInt(id) },
    include: {
      era: { select: { name: true, color: true, description: true } },
      city: {
        select: {
          name: true,
          province: { select: { name: true } },
          lat: true, lng: true,
        },
      },
      event: { select: { name: true, date: true, description: true } },
    },
  });

  if (!site) notFound();

  return <SiteDetail site={site as any} />;
}
