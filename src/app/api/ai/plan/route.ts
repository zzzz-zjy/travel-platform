import { NextRequest } from "next/server";
import { generatePlan } from "@/lib/claude";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const AI_DAILY_LIMIT = 30;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(ip, AI_DAILY_LIMIT);
  if (!allowed) {
    return Response.json({ error: "今日AI请求次数已用完，请明天再试" }, { status: 429 });
  }
  const body = await request.json();
  const stream = await generatePlan({
    city: body.city,
    attractions: body.attractions,
    days: body.days,
    people: body.people,
    transport: body.transport,
    budget: body.budget,
    style: body.style,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
