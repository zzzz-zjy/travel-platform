import { NextRequest } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(ip, 30);
  if (!allowed) {
    return Response.json({ error: "今日请求次数已用完" }, { status: 429 });
  }

  const { guideTitle, city, days } = await request.json();

  const daysText = days
    .map((d: any) => {
      const itemsText = (d.items || [])
        .map((i: any) => `  ${i.time} - ${i.spot}`)
        .join("\n");
      return `第${d.day}天：${d.title}\n${itemsText}`;
    })
    .join("\n\n");

  const systemPrompt = `你是一个旅行文学作家。请根据提供的行程，用优美的第一人称视角写一篇旅行游记。
要求：
1. 以"我"的视角叙述，仿佛亲身经历
2. 语言优美但不浮夸，有真实的旅行感受
3. 包含对当地风景、美食、人文的细腻描写
4. 结构：开篇引入→按天叙述→结尾感悟
5. 800-1200字左右
6. 不用写标题（标题由用户自己起）
7. 不要用markdown格式，纯文本段落`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `请根据以下行程写一篇旅行游记：\n\n目的地：${city}\n行程标题：${guideTitle}\n\n${daysText}`,
      },
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
