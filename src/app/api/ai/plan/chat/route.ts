import { NextRequest } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const AI_DAILY_LIMIT = 30;

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com/v1",
});

const SYSTEM_PROMPT = `你是一位专业的红色研学规划师，专门为大学生和青年群体设计革命旧址和红色博物馆的研学路线。

## 对话流程

1. 如果用户已经说了目的地、天数，直接生成研学路线
2. 如果信息不完整，友好地询问缺失的信息：
   - 目的地（必须）：想去哪个革命旧址所在的城市/地区？
   - 天数（必须）：计划研学几天？
3. 每次只问一个问题，不要一次问太多

## 研学路线要求

1. 优先安排革命旧址、纪念馆、博物馆等具有红色教育意义的参观点
2. 每天安排2-3个核心参观点，预留充足的参观和学习时间
3. 每个参观点提供：历史背景简介、参观重点、建议停留时间
4. 按地理位置就近安排，避免折返绕路
5. 同一天内的参观点应在同一片区

## 生成路线格式

输出完整的 JSON（不要用 markdown 代码块包裹）：

{
  "city": "城市名",
  "title": "XX红色研学X日之旅",
  "totalBudget": 人均预算数字,
  "transport": "推荐出行方式",
  "days": [
    {
      "day": 1,
      "title": "当天主题",
      "items": [
        {
          "time": "09:00",
          "spot": "旧址/博物馆名称",
          "duration": 停留分钟数,
          "ticket": {"price": 0, "purchase": "购票方式"},
          "transportTip": "从前一地点到此的交通方式（具体到线路/站名）",
          "tip": "参观建议和历史学习要点",
          "historyNote": "此处旧址的历史背景简介（2-3句话）"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": 住宿,
    "food": 餐饮,
    "transport": 交通,
    "tickets": 门票,
    "other": 其他
  },
  "studyTips": ["研学建议1", "学习要点2"],
  "weatherNote": "当前季节提示"
}

## 交通信息要求
每个参观点之间的 transportTip 必须具体：
- 公交：写明几路车、哪个站上下
- 步行：写明时间和路线
- 打车：写明预估费用

## 注意事项
- 内容以权威史料为准，确保历史准确性
- 语言庄重但不枯燥，适合大学生群体
- 包含门票价格和预约方式
- 只输出最终JSON，不要额外文字`;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(ip, AI_DAILY_LIMIT);
  if (!allowed) {
    return Response.json({ error: "今日AI请求次数已用完，请明天再试" }, { status: 429 });
  }

  const { messages, departureCity, departureDate } = await request.json();

  let departureInstruction = "";
  if (departureCity && departureDate) {
    departureInstruction = `\n## 出发信息\n- 用户出发地：${departureCity}\n- 出发日期：${departureDate}\n\n请在路线开头添加到达交通建议，推荐高铁方案（含大致时间、二等座价格），根据出发日期考虑季节性因素安排行程。`;
  }

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT + departureInstruction },
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
