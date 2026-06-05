// scripts/crawl/index.ts
import { PrismaClient } from "@prisma/client";
import { CtripCrawler } from "./sources/ctrip";
import { MafengwoCrawler } from "./sources/mafengwo";
import { QunarCrawler } from "./sources/qunar";
import { normalizeAttraction, normalizeHotel } from "./pipeline/normalizer";
import { mergeAttractions, mergeHotels } from "./pipeline/merger";
import { resetRequestCount } from "./utils/fetcher";

const CITIES = [
  "北京", "上海", "成都", "杭州", "西安", "重庆", "广州", "深圳",
  "南京", "武汉", "长沙", "厦门", "三亚", "丽江", "苏州", "青岛",
  "大连", "昆明", "桂林", "哈尔滨",
];

const prisma = new PrismaClient();

const crawlers = [
  new CtripCrawler(),
  new MafengwoCrawler(),
  new QunarCrawler(),
];

async function crawlCity(city: string) {
  console.log(`\n=== Crawling: ${city} ===`);

  const cityRecord = await prisma.city.findFirst({
    where: { name: { contains: city } },
  });

  if (!cityRecord) {
    console.warn(`City "${city}" not found in DB, skipping`);
    return;
  }

  // Crawl attractions from all sources
  const allAttractions: ReturnType<typeof normalizeAttraction>[] = [];
  for (const crawler of crawlers) {
    resetRequestCount();
    console.log(`  [${crawler.sourceName}] crawling attractions...`);
    try {
      const raw = await crawler.searchAttractions(city);
      allAttractions.push(...raw.map(normalizeAttraction));
      console.log(`  [${crawler.sourceName}] got ${raw.length} attractions`);
    } catch (err) {
      console.warn(`  [${crawler.sourceName}] failed:`, (err as Error).message);
    }
  }

  // Merge and save attractions
  const mergedAttractions = mergeAttractions(allAttractions);
  console.log(`  Merged: ${allAttractions.length} raw → ${mergedAttractions.length} unique`);

  let savedAttractions = 0;
  for (const attr of mergedAttractions) {
    if (!attr.name) continue;
    try {
      const existing = await prisma.attraction.findFirst({
        where: { cityId: cityRecord.id, name: attr.name },
      });
      if (existing) {
        await prisma.attraction.update({
          where: { id: existing.id },
          data: {
            rating: attr.rating,
            ratingCount: attr.ratingCount,
            ticketInfo: attr.ticketInfo || undefined,
            description: attr.description || undefined,
            images: JSON.stringify(attr.images),
            openHours: attr.openHours || undefined,
            source: attr.source,
          },
        });
      } else {
        await prisma.attraction.create({
          data: {
            cityId: cityRecord.id,
            name: attr.name,
            lat: attr.lat || cityRecord.lat,
            lng: attr.lng || cityRecord.lng,
            category: attr.category,
            rating: attr.rating,
            ratingCount: attr.ratingCount,
            ticketInfo: attr.ticketInfo || "",
            transportTips: attr.transportTips || "",
            description: attr.description || "",
            images: JSON.stringify(attr.images),
            openHours: attr.openHours || "",
            source: attr.source,
          },
        });
      }
      savedAttractions++;
    } catch (err) {
      console.warn(`  Failed to save attraction "${attr.name}":`, (err as Error).message);
    }
  }
  console.log(`  Saved ${savedAttractions} attractions`);

  // Crawl hotels from all sources
  const allHotels: ReturnType<typeof normalizeHotel>[] = [];
  for (const crawler of crawlers) {
    resetRequestCount();
    console.log(`  [${crawler.sourceName}] crawling hotels...`);
    try {
      const raw = await crawler.searchHotels(city);
      allHotels.push(...raw.map(normalizeHotel));
      console.log(`  [${crawler.sourceName}] got ${raw.length} hotels`);
    } catch (err) {
      console.warn(`  [${crawler.sourceName}] hotel failed:`, (err as Error).message);
    }
  }

  // Merge and save hotels
  const mergedHotels = mergeHotels(allHotels);
  console.log(`  Merged hotels: ${allHotels.length} raw → ${mergedHotels.length} unique`);

  let savedHotels = 0;
  for (const hotel of mergedHotels) {
    if (!hotel.name) continue;
    try {
      const existing = await prisma.hotel.findFirst({
        where: { cityId: cityRecord.id, name: hotel.name },
      });
      if (existing) {
        await prisma.hotel.update({
          where: { id: existing.id },
          data: {
            price: hotel.price || undefined,
            rating: hotel.rating || undefined,
            starLevel: hotel.starLevel,
            images: JSON.stringify(hotel.images),
            amenities: JSON.stringify(hotel.amenities),
            source: hotel.source,
          },
        });
      } else {
        await prisma.hotel.create({
          data: {
            cityId: cityRecord.id,
            name: hotel.name,
            lat: hotel.lat || cityRecord.lat,
            lng: hotel.lng || cityRecord.lng,
            price: hotel.price || null,
            rating: hotel.rating || null,
            starLevel: hotel.starLevel,
            images: JSON.stringify(hotel.images),
            amenities: JSON.stringify(hotel.amenities),
            address: hotel.address || "",
            phone: hotel.phone || "",
            source: hotel.source,
          },
        });
      }
      savedHotels++;
    } catch (err) {
      console.warn(`  Failed to save hotel "${hotel.name}":`, (err as Error).message);
    }
  }
  console.log(`  Saved ${savedHotels} hotels`);
}

async function main() {
  const args = process.argv.slice(2);
  const cityArg = args.find((a) => a.startsWith("--city="));
  const cities = cityArg
    ? [cityArg.replace("--city=", "")]
    : CITIES;

  console.log(`Starting crawl for ${cities.length} cities...`);
  console.log(`Sources: ctrip, mafengwo, qunar\n`);

  for (const city of cities) {
    await crawlCity(city);
  }

  console.log(`\n=== Crawl complete! ===`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Crawl failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
