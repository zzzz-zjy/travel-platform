import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedData } from "../src/lib/seed-data";

const adapter = new PrismaLibSql({ url: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create continents
  const continentNames = ["亚洲", "欧洲", "北美洲", "南美洲", "非洲", "大洋洲", "南极洲"];
  for (const name of continentNames) {
    await prisma.continent.create({
      data: { name, boundsGeojson: JSON.stringify({ type: "FeatureCollection", features: [] }) },
    });
  }

  // Find Asia continent for our countries
  const asia = await prisma.continent.findFirst({ where: { name: "亚洲" } });
  if (!asia) throw new Error("Asia continent not found");

  // Create countries
  const china = await prisma.country.create({
    data: { name: "中国", slug: "cn", continentId: asia.id },
  });
  const japan = await prisma.country.create({
    data: { name: "日本", slug: "jp", continentId: asia.id },
  });

  const countryMap: Record<string, number> = { CN: china.id, JP: japan.id };

  // Create provinces, cities, attractions
  for (const [code, provinces] of Object.entries(seedData)) {
    const countryId = countryMap[code];
    if (!countryId) continue;

    for (const [provinceName, cities] of Object.entries(provinces)) {
      const province = await prisma.province.create({
        data: { name: provinceName, countryId },
      });

      for (const cityData of cities) {
        const city = await prisma.city.create({
          data: {
            name: cityData.name,
            provinceId: province.id,
            lat: cityData.lat,
            lng: cityData.lng,
          },
        });

        for (const attr of cityData.attractions) {
          await prisma.attraction.create({
            data: {
              name: attr.name,
              cityId: city.id,
              category: attr.category,
              lat: attr.lat,
              lng: attr.lng,
              rating: attr.rating,
              ticketInfo: attr.ticketInfo,
              transportTips: attr.transportTips,
              description: attr.description,
            },
          });
        }
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
