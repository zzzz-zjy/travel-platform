import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CountryMapLoader from "@/components/map/CountryMapLoader";

async function getAttractions(country: string) {
  try {
    // Simple direct query without nested relations
    const countryRecord = await prisma.country.findUnique({ where: { slug: country } });
    if (!countryRecord) return [];

    const allAttractions = await prisma.attraction.findMany({
      select: { id: true, name: true, lat: true, lng: true, category: true, rating: true, ticketInfo: true, description: true, images: true, cityId: true },
      orderBy: { rating: "desc" },
      take: 200,
    });

    // Get provinces in this country
    const provinces = await prisma.province.findMany({
      where: { countryId: countryRecord.id },
      select: { id: true },
    });
    const provinceIds = new Set(provinces.map((p) => p.id));

    // Get cities in these provinces
    const cityIds = [...new Set(allAttractions.map((a) => a.cityId))];
    const cities = await prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true, provinceId: true, province: { select: { name: true } } },
    });
    const validCityIds = new Set(cities.filter((c) => provinceIds.has(c.provinceId)).map((c) => c.id));

    const result = allAttractions.filter((a) => validCityIds.has(a.cityId));

    return result.map((r: any) => ({
      id: r.id,
      name: r.name,
      lat: r.lat,
      lng: r.lng,
      category: r.category,
      rating: r.rating,
      ticketInfo: r.ticket_info || "",
      description: r.description || "",
      images: r.images || "[]",
      city: { name: r.city_name || "", province: { name: r.province_name || "" } },
    }));
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
