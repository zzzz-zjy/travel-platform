import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CountryMapLoader from "@/components/map/CountryMapLoader";

async function getAttractions(country: string) {
  try {
    const countryRecord = await prisma.country.findUnique({ where: { slug: country } });
    if (!countryRecord) return [];

    // Query provinces by country ID directly
    const provinces = await prisma.province.findMany({
      where: { countryId: countryRecord.id },
      select: { id: true },
    });
    const provinceIds = provinces.map((p) => p.id);
    if (provinceIds.length === 0) return [];

    // Query cities by province IDs
    const cities = await prisma.city.findMany({
      where: { provinceId: { in: provinceIds } },
      select: { id: true, name: true, province: { select: { name: true } } },
    });
    const cityIds = cities.map((c) => c.id);
    if (cityIds.length === 0) return [];

    // Query attractions by city IDs
    const attractions = await prisma.attraction.findMany({
      where: { cityId: { in: cityIds } },
      orderBy: { rating: "desc" },
    });

    return attractions.map((a) => {
      const city = cities.find((c) => c.id === a.cityId);
      return {
        ...a,
        city: { name: city?.name || "", province: { name: city?.province?.name || "" } },
      } as any;
    });
  } catch (err) {
    console.error("Failed to load attractions:", err);
    return [];
  }
}

export default async function ExploreCountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const attractions = await getAttractions(country);
  const serialized = attractions.map((a: any) => ({
    id: a.id,
    name: a.name,
    lat: a.lat,
    lng: a.lng,
    category: a.category,
    rating: a.rating,
    ticketInfo: a.ticketInfo || "",
    city: { name: a.city?.name || "", province: { name: a.city?.province?.name || "" } },
  }));

  const countryName = attractions[0]?.city?.name ? country.toUpperCase() : country.toUpperCase();

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
