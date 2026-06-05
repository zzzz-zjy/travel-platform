import { NextRequest } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(ip, 20);
  if (!allowed) {
    return Response.json({ error: "今日请求次数已用完" }, { status: 429 });
  }

  const { interests, visitedCities, region } = await request.json();

  const visitedStr = visitedCities?.length
    ? `用户已去过：${visitedCities.join("、")}，请避开这些城市`
    : "";

  const systemPrompt = `你是一个旅行灵感推荐师。请根据用户的偏好推荐3个冷门但值得去的旅行目的地。
每个推荐包含：
1. 城市名称
2. 推荐理由（50字以内，突出独特性）
3. 最佳季节
4. 适合人群
5. 一个小众景点推荐

输出纯JSON数组格式，不要markdown包裹：
[{"city": "", "reason": "", "bestSeason": "", "forWho": "", "hiddenGem": "", "matchScore": 95}]`;

  const interestLabels: Record<string, string> = {
    food: "美食", culture: "人文历史", nature: "自然风光",
    hidden_gem: "小众冷门", adventure: "户外探险", shopping: "购物",
    photography: "摄影打卡", nightlife: "夜生活",
  };

  const userInterests = interests?.map((i: string) => interestLabels[i] || i).join("、") || "综合";

  const regionHint = region === "international" ? "只推荐境外（国外）目的地。" : "只推荐中国境内目的地。";

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `用户偏好：${userInterests}。${visitedStr}${regionHint}请推荐3个冷门旅行目的地。输出JSON数组。`,
      },
    ],
    stream: false,
  });

  const text = response.choices[0]?.message?.content || "[]";
  try {
    const data = JSON.parse(text);
    return Response.json({ recommendations: data });
  } catch {
    return Response.json({
      recommendations: [
        { city: "泉州", reason: "海上丝绸之路起点，世界遗产之城，游客少但文化底蕴深厚", bestSeason: "10-12月", forWho: "人文历史爱好者", hiddenGem: "开元寺双塔", matchScore: 92 },
        { city: "霞浦", reason: "中国最美滩涂，摄影天堂，日出日落时分光影绝美", bestSeason: "4-6月", forWho: "摄影爱好者、自然探索者", hiddenGem: "北岐滩涂", matchScore: 88 },
        { city: "腾冲", reason: "火山温泉、银杏古村，四季如春，慢生活理想地", bestSeason: "11-12月", forWho: "休闲度假、养生旅居", hiddenGem: "和顺古镇", matchScore: 85 },
      ],
    });
  }
}
