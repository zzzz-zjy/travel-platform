import { PrismaClient } from "@prisma/client";
import { ERAS, REVOLUTION_SEED } from "../src/lib/revolution-seed";

const url = process.env["DATABASE_URL"]!;
const getPrisma = () => {
  if (url.startsWith("file:") || url.startsWith("libsql://") || url.startsWith("https://")) {
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const options: Record<string, string> = { url };
    const authToken = process.env["TURSO_AUTH_TOKEN"];
    if (authToken) options.authToken = authToken;
    return new PrismaClient({ adapter: new PrismaLibSql(options) } as any);
  }
  const { PrismaPg } = require("@prisma/adapter-pg");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) } as any);
};

const prisma = getPrisma();

async function main() {
  console.log("Seeding revolutionary education platform data...");

  // Clear existing data in correct order (respecting FK constraints)
  await prisma.favorite.deleteMany();
  await prisma.journeyStop.deleteMany();
  await prisma.journeyDay.deleteMany();
  await prisma.journey.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.eventPerson.deleteMany();
  await prisma.event.deleteMany();
  await prisma.person.deleteMany();
  await prisma.site.deleteMany();
  await prisma.city.deleteMany();
  await prisma.province.deleteMany();
  await prisma.era.deleteMany();

  // Seed Eras
  const eraMap: Record<string, number> = {};
  for (const era of ERAS) {
    const e = await prisma.era.create({ data: era });
    eraMap[e.name] = e.id;
  }
  console.log(`Seeded ${ERAS.length} eras`);

  // Map province to era
  const provinceEraMap: Record<string, string> = {
    "北京": "抗日战争", "上海": "建党初期", "江西": "土地革命",
    "陕西": "抗日战争", "贵州": "土地革命", "河北": "解放战争",
    "湖南": "建党初期", "浙江": "建党初期", "重庆": "抗日战争",
    "甘肃": "土地革命", "辽宁": "抗日战争",
  };

  let siteCount = 0;

  // Seed Provinces -> Cities -> Sites
  for (const [provinceName, provinceData] of Object.entries(REVOLUTION_SEED)) {
    let province = await prisma.province.findUnique({ where: { name: provinceName } });
    if (!province) {
      province = await prisma.province.create({ data: { name: provinceName } });
    }

    for (const cityData of provinceData.cities) {
      const city = await prisma.city.create({
        data: {
          name: cityData.name,
          lat: cityData.lat,
          lng: cityData.lng,
          provinceId: province.id,
        },
      });

      const defaultEraName = provinceEraMap[provinceName] || "抗日战争";

      for (const siteData of cityData.sites) {
        const eraName = siteData.era || defaultEraName;
        const eraId = eraMap[eraName];
        await prisma.site.create({
          data: {
            cityId: city.id,
            eraId: eraId,
            name: siteData.name,
            siteType: siteData.siteType,
            lat: siteData.lat,
            lng: siteData.lng,
            rating: siteData.rating,
            ticketInfo: siteData.ticketInfo,
            transportTips: siteData.transportTips,
            description: siteData.description,
            historicalBg: siteData.historicalBg,
            images: JSON.stringify(siteData.images),
          },
        });
        siteCount++;
      }
    }
  }

  console.log(`Seeded ${Object.keys(REVOLUTION_SEED).length} provinces, ${siteCount} sites`);
  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
