import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `你是一个专业的旅游规划师，精通中国和日本的热门旅游目的地。
你需要根据用户的需求生成详细的旅游攻略。攻略必须包含每一天的具体时间安排、景点门票购买方式、交通建议和实用小贴士。

## 交通信息要求（非常重要）
每个景点的 transportTip 必须包含极其具体的交通方式：
- 地铁：写明几号线、哪个站上车、哪个站下车、哪个出口出
- 公交：写明几路公交车、哪个站上车、哪个站下车
- 骑行：如果距离近（<2公里），建议骑共享单车，写明骑行时间
- 步行：如果相邻（<1公里），建议步行，写明步行时间和路线
- 打车：写明预估费用和时间

## 门票信息
每个景点的 ticket 必须包含价格和购票方式，如"需提前在XX公众号预约"、"现场购票"等。

输出格式必须严格遵守 JSON 结构，不要输出任何其他内容，不要用 markdown 代码块包裹。`;

interface PlanParams {
  city: string;
  attractions: string[];
  days: number;
  people: number;
  transport: string;
  budget: number;
  style: string;
}

export async function generatePlan(params: PlanParams): Promise<ReadableStream> {
  const userMessage = `请为以下需求生成旅游攻略：

目的地城市：${params.city}
想去的景点：${params.attractions.join("、")}
游玩天数：${params.days}天
人数：${params.people}人
出行方式：${params.transport}
人均预算：${params.budget}元
旅行风格：${params.style}

请生成一份详细、实用的攻略。每个景点都要包含门票价格和购买方式。输出纯 JSON，不要用 markdown 代码块。`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      let buffer = "";
      for await (const event of response) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          buffer += event.delta.text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, full: buffer })}\n\n`));
      controller.close();
    },
  });
}
