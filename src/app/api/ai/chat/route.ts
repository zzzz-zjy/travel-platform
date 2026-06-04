import { NextRequest } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const AI_DAILY_LIMIT = 30;

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, remaining } = await checkRateLimit(ip, AI_DAILY_LIMIT);
  if (!allowed) {
    return Response.json({ error: "今日AI请求次数已用完，请明天再试" }, { status: 429 });
  }
  const { messages, guideContext } = await request.json();

  const systemPrompt = `你是一个旅游攻略调整助手。以下是用户当前的攻略：

${guideContext}

用户会提出修改要求（如"太贵了""想多去几个景点""换便宜的住宿"等），请根据要求调整攻略并输出完整的新攻略 JSON。
输出纯 JSON，不要用 markdown 代码块。格式与原始攻略一致。`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 4096,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ],
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
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
