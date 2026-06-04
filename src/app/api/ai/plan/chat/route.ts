import { NextRequest } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const AI_DAILY_LIMIT = 30;

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com/v1",
});

const SYSTEM_PROMPT = `你是一位专业的AI旅游规划师。你的任务是通过对话收集用户需求，然后生成完整的旅游攻略。

## 对话流程

1. 如果用户已经说了目的地、天数、预算，直接生成攻略
2. 如果信息不完整，友好地询问缺失的信息：
   - 目的地（必须）：想去哪个城市/地区？
   - 天数（必须）：计划玩几天？
   - 预算（必须）：人均预算大概多少？
   - 偏好（可选）：喜欢什么风格？美食、文化、户外、休闲？
3. 每次只问一个问题，不要一次问太多
4. 如果用户指定了场景模式（研学/宠物/银发/穷游/境外/周末），按场景规则调整行程

## 场景模式规则

- **研学旅行**：优先博物馆/科技馆/历史遗址，每天不超过3个参观点，预留学习时间
- **宠物出游**：优先宠物友好场所和户外景点，标注宠物政策
- **银发慢游**：每天不超过3个景点，节奏慢，安排午休，避免大量步行爬山
- **穷游达人**：优先免费/低价景点，推荐经济住宿和街头小吃，控制预算
- **境外自由行**：包含签证、货币、SIM卡、紧急电话等实用信息
- **周末微旅行**：2天紧凑行程，主打放松和美食

## 地理智能排程（非常重要）

在安排每天的景点顺序时，必须遵守以下规则：
1. 景点必须按地理位置从近到远串联安排，避免折返绕路
2. 同一天内的景点应在同一片区，尽量不要跨区跳跃
3. 标注景点间的交通方式和大致时间
4. 如果用户切换为"紧凑"模式，每天安排4-5个景点，紧密衔接
5. 如果用户切换为"松弛"模式，每天安排2-3个景点，留出充足自由时间
6. 默认为"适中"模式，每天3-4个景点

## 生成攻略格式

当信息足够时，输出完整的 JSON 攻略（不要用 markdown 代码块包裹）：

{
  "city": "城市名",
  "title": "城市+天数+风格标题",
  "totalBudget": 人均预算数字,
  "transport": "推荐出行方式",
  "dailySchedulePace": "紧凑|适中|松弛",
  "days": [
    {
      "day": 1,
      "title": "当天主题",
      "geoNote": "本日景点集中在XX片区，全程约X公里",
      "items": [
        {
          "time": "09:00",
          "spot": "景点名",
          "duration": 停留分钟数,
          "ticket": {"price": 0, "purchase": "购票方式"},
          "transportTip": "从前一景点到此景点的交通建议（必须具体到线路/站名/时间）",
          "tip": "实用小贴士",
          "localEats": "附近本地人推荐美食（不是网红店）"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": 住宿费用,
    "food": 餐饮费用,
    "transport": 交通费用,
    "tickets": 门票费用,
    "other": 其他费用
  },
  "localTips": ["本地避坑建议1", "避坑建议2"],
  "weatherNote": "当前季节天气提示"
}

## 交通信息要求（非常重要）
每个景点的 transportTip 必须包含极其具体的交通方式：
- 地铁：写明几号线、哪个站上车、哪个站下车、哪个出口出
- 公交：写明几路公交车、哪个站上车、哪个站下车
- 骑行：如果距离近（<2公里），建议骑共享单车，写明骑行时间
- 步行：如果相邻景点（<1公里），建议步行，写明步行时间和路线
- 打车/网约车：写明预估费用和时间

示例：
"地铁2号线 XX站B口进 → XX站C口出，约15分钟，3元"
"骑共享单车约10分钟，沿XX路一路向南"
"步行5分钟即可到达，穿过XX步行街"
"打车约20元，15分钟"

## 注意事项
- 攻略要详细实用，包含门票价格和购买方式
- 每天景点之间距离不要超过10公里（松弛模式不超过5公里）
- 标注本地人常去的餐馆，区分网红店
- 每个景点给出「本地人推荐」或「热门景点」标签
- 只输出最终JSON，不要额外文字`;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(ip, AI_DAILY_LIMIT);
  if (!allowed) {
    return Response.json({ error: "今日AI请求次数已用完，请明天再试" }, { status: 429 });
  }

  const { messages, persona, mode } = await request.json();

  let personaInstruction = "";
  if (persona === "humorous") {
    personaInstruction = "\n回复风格：轻松幽默，可以使用适当的表情符号，让对话充满乐趣。";
  } else if (persona === "minimal") {
    personaInstruction = "\n回复风格：极简干练，直接给出答案，不要多余的解释和铺垫。";
  }

  let modeInstruction = "";
  if (mode === "compact") {
    modeInstruction = "\n当前模式：紧凑打卡。每天安排4-5个景点，紧密衔接。";
  } else if (mode === "relaxed") {
    modeInstruction = "\n当前模式：休闲松弛。每天安排2-3个景点，留充足的休息和自由时间。";
  }

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT + personaInstruction + modeInstruction },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let full = "";
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          full += text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, full })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
