import { NextRequest } from "next/server";
import OpenAI from "openai";

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

## 生成攻略格式

当信息足够时，输出完整的 JSON 攻略（不要用 markdown 代码块包裹）：

{
  "city": "城市名",
  "title": "城市+天数+风格标题",
  "totalBudget": 人均预算数字,
  "transport": "推荐出行方式",
  "days": [
    {
      "day": 1,
      "title": "当天主题",
      "items": [
        {
          "time": "09:00",
          "spot": "景点名",
          "duration": 停留分钟数,
          "ticket": {"price": 0, "purchase": "购票方式"},
          "transportTip": "交通建议",
          "tip": "实用小贴士"
        }
      ]
    }
  ]
}

## 交通信息要求（非常重要）
每个景点的 transportTip 必须包含具体的交通方式，越详细越好：
- 地铁：写明几号线、哪个站上车、哪个站下车、哪个出口
- 公交：写明几路公交车、哪个站上车、哪个站下车
- 骑行：如果距离近（<2公里），建议骑共享单车（如美团单车/哈啰单车），写明大概骑行时间
- 步行：如果两个景点相邻（<1公里），建议步行，写明步行时间
- 打车/网约车：如果距离较远或不方便公共交通，写明大概费用和时间

示例：
"地铁2号线宽窄巷子站B口进 → 春熙路站C口出，约15分钟"
"骑共享单车约10分钟，沿人民南路一路向南"
"步行5分钟即可到达，穿过春熙路步行街"
"打车约20元，15分钟"

## 注意事项
- 攻略要详细实用，包含门票价格和购买方式
- 每天安排3-4个景点，合理分配时间，景点之间距离不要太远
- 根据用户偏好调整景点类型
- 只输出最终JSON，不要额外文字`;

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
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
