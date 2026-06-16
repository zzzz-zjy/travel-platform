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

  const systemPrompt = `你是"红色记忆"平台的AI革命历史讲解员。以下是用户正在浏览的革命旧址信息：

${guideContext}

用户会向你提出关于这个旧址的问题，请基于史料提供准确、专业的回答。
如果用户问的问题超出你的知识范围，如实告知，不要编造。
回答风格：专业但不枯燥，适合大学生理解。`;

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
