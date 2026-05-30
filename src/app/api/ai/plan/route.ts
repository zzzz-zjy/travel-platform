import { NextRequest } from "next/server";
import { generatePlan } from "@/lib/claude";

export async function POST(request: NextRequest) {
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
