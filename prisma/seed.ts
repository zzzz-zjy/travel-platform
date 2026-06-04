import dotenv from "dotenv";
if (!process.env.VERCEL) {
  dotenv.config({ path: ".env.local", override: false });
  dotenv.config({ path: ".env", override: false });
}

import { PrismaClient } from "@prisma/client";
import { seedData } from "../src/lib/seed-data";

const url = process.env["DATABASE_URL"]!;
const getPrisma = () => {
  if (url.startsWith("file:") || url.startsWith("libsql://") || url.startsWith("https://")) {
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const options: Record<string, string> = { url };
    const authToken = process.env["TURSO_AUTH_TOKEN"];
    if (authToken) options.authToken = authToken;
    return new PrismaClient({ adapter: new PrismaLibSql(options) });
  }
  const { PrismaPg } = require("@prisma/adapter-pg");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
};

const prisma = getPrisma();

async function main() {
  console.log("Seeding database...");

  // Clear existing data (in reverse dependency order)
  await prisma.guideItem.deleteMany();
  await prisma.guideDay.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.rateLimit.deleteMany();
  await prisma.attraction.deleteMany();
  await prisma.city.deleteMany();
  await prisma.province.deleteMany();
  await prisma.country.deleteMany();
  await prisma.continent.deleteMany();

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

  // Create system-recommended guides
  const chengdu = await prisma.city.findFirst({ where: { name: "成都" } });
  const beijing = await prisma.city.findFirst({ where: { name: "北京" } });
  const tokyo = await prisma.city.findFirst({ where: { name: "东京" } });

  // === System guides ===
  if (chengdu) {
    const guide = await prisma.guide.create({
      data: {
        title: "成都3日美食休闲之旅", destinationCityId: chengdu.id,
        totalDays: 3, budgetAmount: 2500, transportMode: "地铁+共享单车",
        travelStyle: "美食", isSystem: true,
        rawJson: JSON.stringify({ title: "成都3日美食休闲之旅", totalBudget: 2500, transport: "地铁+共享单车" }),
      },
    });
    await prisma.guideDay.createMany({
      data: [
        { guideId: guide.id, dayNumber: 1, title: "市区文化探索" },
        { guideId: guide.id, dayNumber: 2, title: "熊猫与自然" },
        { guideId: guide.id, dayNumber: 3, title: "慢生活体验" },
      ],
    });
    // Day 1 items
    const d1 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 1 } });
    if (d1) await prisma.guideItem.createMany({ data: [
      { guideDayId: d1.id, timeSlot: "09:00", customSpot: "宽窄巷子", durationMin: 120, ticketReminder: "免费进入",
        tips: "地铁4号线宽窄巷子站B口出，建议早上9点前到避开人流" },
      { guideDayId: d1.id, timeSlot: "12:00", customSpot: "奎星楼街午餐", durationMin: 60, ticketReminder: "",
        tips: "步行5分钟到奎星楼街，推荐冒椒火辣串串、二嬢鸡爪，人均50元" },
      { guideDayId: d1.id, timeSlot: "14:00", customSpot: "锦里古街", durationMin: 120, ticketReminder: "免费进入",
        tips: "打车约10元/骑行共享单车15分钟，三国文化主题街，傍晚灯笼亮起最美" },
      { guideDayId: d1.id, timeSlot: "18:00", customSpot: "蜀九香火锅（玉林店）", durationMin: 90, ticketReminder: "人均100元",
        tips: "打车约15元，成都必吃火锅，建议提前电话取号" },
    ]});
    // Day 2 items
    const d2 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 2 } });
    if (d2) await prisma.guideItem.createMany({ data: [
      { guideDayId: d2.id, timeSlot: "08:00", customSpot: "大熊猫繁育研究基地", durationMin: 180,
        ticketReminder: "55元，公众号「成都大熊猫繁育研究基地」提前预约",
        tips: "地铁3号线熊猫大道站A口出换景区直通车，建议8点前到看熊猫吃早餐" },
      { guideDayId: d2.id, timeSlot: "12:30", customSpot: "都江堰景区", durationMin: 240,
        ticketReminder: "80元，现场购票或携程预订",
        tips: "犀浦站乘城际列车至都江堰站约30分钟，下车步行15分钟到景区" },
    ]});
    // Day 3 items
    const d3 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 3 } });
    if (d3) await prisma.guideItem.createMany({ data: [
      { guideDayId: d3.id, timeSlot: "09:00", customSpot: "人民公园鹤鸣茶社", durationMin: 90,
        ticketReminder: "茶位费15-30元/人", tips: "地铁2号线人民公园站B口出，体验成都慢生活，掏耳朵30元" },
      { guideDayId: d3.id, timeSlot: "11:00", customSpot: "春熙路/IFS/太古里", durationMin: 120,
        ticketReminder: "免费", tips: "步行15分钟到春熙路，IFS熊猫屁股是网红打卡点，太古里逛街拍照" },
      { guideDayId: d3.id, timeSlot: "13:30", customSpot: "饕林餐厅（太古里店）", durationMin: 60,
        ticketReminder: "人均80元", tips: "川菜经典，推荐水煮鱼、宫保鸡丁、担担面" },
    ]});
  }

  if (beijing) {
    const guide = await prisma.guide.create({
      data: {
        title: "北京经典4日文化之旅", destinationCityId: beijing.id,
        totalDays: 4, budgetAmount: 3500, transportMode: "地铁+公交",
        travelStyle: "文化", isSystem: true,
        rawJson: JSON.stringify({ title: "北京经典4日文化之旅", totalBudget: 3500, transport: "地铁+公交" }),
      },
    });
    await prisma.guideDay.createMany({
      data: [
        { guideId: guide.id, dayNumber: 1, title: "皇城中轴线" },
        { guideId: guide.id, dayNumber: 2, title: "万里长城" },
        { guideId: guide.id, dayNumber: 3, title: "皇家园林" },
        { guideId: guide.id, dayNumber: 4, title: "老北京风情" },
      ],
    });
    const bd1 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 1 } });
    if (bd1) await prisma.guideItem.createMany({ data: [
      { guideDayId: bd1.id, timeSlot: "08:00", customSpot: "天安门广场", durationMin: 60,
        ticketReminder: "免费，需安检", tips: "地铁1号线天安门东站C口出，看升旗需查日出时间提前1小时到" },
      { guideDayId: bd1.id, timeSlot: "09:30", customSpot: "故宫博物院", durationMin: 240,
        ticketReminder: "60元（旺季），「故宫博物院」小程序提前7天预约",
        tips: "从午门进神武门出，租讲解器20元，珍宝馆和钟表馆另付10元值得看" },
      { guideDayId: bd1.id, timeSlot: "14:00", customSpot: "景山公园", durationMin: 60,
        ticketReminder: "2元", tips: "故宫神武门对面步行2分钟，登万春亭俯瞰故宫全景" },
      { guideDayId: bd1.id, timeSlot: "16:00", customSpot: "南锣鼓巷+鼓楼", durationMin: 120,
        ticketReminder: "免费", tips: "地铁6号线南锣鼓巷站E口出，逛胡同吃小吃，推荐文宇奶酪" },
    ]});
    const bd2 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 2 } });
    if (bd2) await prisma.guideItem.createMany({ data: [
      { guideDayId: bd2.id, timeSlot: "07:00", customSpot: "八达岭长城", durationMin: 300,
        ticketReminder: "40元（旺季），「八达岭长城」公众号预约",
        tips: "北京北站乘S2线市郊铁路至八达岭站约1小时，建议坐缆车上徒步下" },
    ]});
    const bd3 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 3 } });
    if (bd3) await prisma.guideItem.createMany({ data: [
      { guideDayId: bd3.id, timeSlot: "08:30", customSpot: "颐和园", durationMin: 180,
        ticketReminder: "30元（旺季），现场购票", tips: "地铁4号线北宫门站D口出，必看十七孔桥和万寿山" },
      { guideDayId: bd3.id, timeSlot: "13:00", customSpot: "圆明园遗址公园", durationMin: 150,
        ticketReminder: "25元", tips: "地铁4号线圆明园站B口出，西洋楼遗址最震撼" },
      { guideDayId: bd3.id, timeSlot: "16:30", customSpot: "清华大学/北京大学", durationMin: 90,
        ticketReminder: "免费，需在公众号提前预约", tips: "步行可达，感受百年学府氛围" },
    ]});
    const bd4 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 4 } });
    if (bd4) await prisma.guideItem.createMany({ data: [
      { guideDayId: bd4.id, timeSlot: "08:30", customSpot: "天坛公园", durationMin: 120,
        ticketReminder: "15元", tips: "地铁5号线天坛东门站A2口出，祈年殿雄伟壮观" },
      { guideDayId: bd4.id, timeSlot: "11:30", customSpot: "前门大街/大栅栏", durationMin: 120,
        ticketReminder: "免费", tips: "公交2站或步行20分钟，全聚德烤鸭、都一处烧麦等老字号" },
      { guideDayId: bd4.id, timeSlot: "14:30", customSpot: "国家博物馆", durationMin: 150,
        ticketReminder: "免费，公众号提前3天预约", tips: "地铁1号线天安门东站，古代中国展必看" },
    ]});
  }

  if (tokyo) {
    const guide = await prisma.guide.create({
      data: {
        title: "东京3日潮流文化体验", destinationCityId: tokyo.id,
        totalDays: 3, budgetAmount: 5000, transportMode: "地铁JR",
        travelStyle: "文化", isSystem: true,
        rawJson: JSON.stringify({ title: "东京3日潮流文化体验", totalBudget: 5000, transport: "地铁JR" }),
      },
    });
    await prisma.guideDay.createMany({
      data: [
        { guideId: guide.id, dayNumber: 1, title: "浅草-晴空塔经典游" },
        { guideId: guide.id, dayNumber: 2, title: "潮流圣地巡礼" },
        { guideId: guide.id, dayNumber: 3, title: "美食购物一日" },
      ],
    });
    const td1 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 1 } });
    if (td1) await prisma.guideItem.createMany({ data: [
      { guideDayId: td1.id, timeSlot: "09:00", customSpot: "浅草寺", durationMin: 90,
        ticketReminder: "免费进入", tips: "地铁银座线浅草站1号口出，雷门大红灯笼必打卡" },
      { guideDayId: td1.id, timeSlot: "11:00", customSpot: "仲见世商店街", durationMin: 60,
        ticketReminder: "", tips: "浅草寺出来即是，人形烧、仙贝、抹茶冰淇淋值得一试" },
      { guideDayId: td1.id, timeSlot: "13:00", customSpot: "东京晴空塔", durationMin: 120,
        ticketReminder: "天望甲板2100日元，网上预订便宜200日元",
        tips: "步行15分钟或地铁1站到押上站，350m和450m两层展望台" },
    ]});
    const td2 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 2 } });
    if (td2) await prisma.guideItem.createMany({ data: [
      { guideDayId: td2.id, timeSlot: "09:30", customSpot: "明治神宫", durationMin: 90,
        ticketReminder: "免费，宝物殿500日元", tips: "JR山手线原宿站表参道口出，闹市中的森林神社" },
      { guideDayId: td2.id, timeSlot: "11:30", customSpot: "原宿竹下通", durationMin: 90,
        ticketReminder: "", tips: "明治神宫步行5分钟，可丽饼、古着店、潮流服饰" },
      { guideDayId: td2.id, timeSlot: "14:00", customSpot: "涉谷十字路口+SHIBUYA SKY", durationMin: 120,
        ticketReminder: "SHIBUYA SKY 2000日元，需提前网上预约",
        tips: "JR山手线原宿→涉谷1站，世界最繁忙十字路口，展望台看东京全景" },
    ]});
    const td3 = await prisma.guideDay.findFirst({ where: { guideId: guide.id, dayNumber: 3 } });
    if (td3) await prisma.guideItem.createMany({ data: [
      { guideDayId: td3.id, timeSlot: "08:00", customSpot: "筑地场外市场", durationMin: 90,
        ticketReminder: "免费", tips: "地铁日比谷线筑地站1号口或大江户线筑地市场站A1口，新鲜刺身寿司早餐" },
      { guideDayId: td3.id, timeSlot: "10:30", customSpot: "银座购物", durationMin: 180,
        ticketReminder: "", tips: "步行15分钟到银座，三越百货、优衣库旗舰店、资生堂Parlour下午茶" },
      { guideDayId: td3.id, timeSlot: "15:00", customSpot: "秋叶原电器街", durationMin: 120,
        ticketReminder: "", tips: "地铁日比谷线银座→秋叶原约10分钟，动漫手办、电器、女仆咖啡厅" },
    ]});
  }

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
