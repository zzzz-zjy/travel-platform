import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CountryMapLoader from "@/components/map/CountryMapLoader";

async function getAttractions(country: string) {
  return prisma.attraction.findMany({
    where: { city: { province: { country: { slug: country } } } },
    include: { city: { include: { province: { include: { country: true } } } } },
    orderBy: { rating: "desc" },
    take: 50,
  });
}

export default async function ExploreCountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const attractions = await getAttractions(country);
  const serialized = JSON.parse(JSON.stringify(attractions));

  const countryName =
    attractions[0]?.city?.province?.country?.name || country.toUpperCase();

  return (
    <div>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 16,
          zIndex: 1000,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: 16,
          maxWidth: 280,
        }}
      >
        <Link
          href="/"
          style={{
            color: "#2563eb",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          ← 返回地球
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: "bold", marginTop: 8 }}>
          {countryName}
        </h1>
        <p style={{ color: "#666", fontSize: 14 }}>
          {attractions.length} 个景点
        </p>
      </div>
      <CountryMapLoader country={country} initialData={serialized} />
    </div>
  );
}
