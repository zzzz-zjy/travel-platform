import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com/v1",
});

const SYSTEM_PROMPT = `你是"红色记忆"平台的AI革命历史讲解员。你的职责是：

1. 为革命旧址和博物馆提供专业、准确的历史讲解
2. 生成红色研学路线
3. 回答革命历史相关问题

## 讲解要求
- 内容以权威党史资料为准，确保历史准确性
- 语言庄重但不枯燥，适合大学生群体
- 每个旧址讲解包含：历史背景 → 重要事件 → 历史意义 → 参观建议
- 引用具体人物、时间、地点，增强可信度

## 路线规划
- 按地理位置合理安排，避免折返
- 每天安排2-3个核心旧址，留出参观和思考时间
- 包含交通建议和门票信息
- 适合研学旅行节奏

输出格式为纯 JSON，不要用 markdown 代码块。`;

interface PlanParams {
  city: string;
  attractions: string[];
  days: number;
  people: number;
  transport: string;
  budget: number;
  style: string;
  mode?: string;
  scenario?: string;
}

export async function generatePlan(params: PlanParams): Promise<ReadableStream> {
  let scenarioInstruction = "";
  if (params.scenario === "study") {
    scenarioInstruction = "\n这是研学旅行，优先安排博物馆、科技馆、历史遗址等具有教育意义的景点。每天不超过3个核心参观点。";
  } else if (params.scenario === "senior") {
    scenarioInstruction = "\n这是银发长者出行。行程节奏放慢，每天不超过3个景点，避免大量步行和爬山，安排午休时间。住宿选择安静舒适型。";
  } else if (params.scenario === "budget") {
    scenarioInstruction = "\n这是穷游行程。优先免费景点和经济住宿，餐饮推荐街头小吃，人均每天控制在200元以内。";
  }

  let modeInstruction = "";
  if (params.mode === "compact") {
    modeInstruction = "\n使用紧凑模式：每天安排4-5个景点，紧密衔接，充分利用时间。";
  } else if (params.mode === "relaxed") {
    modeInstruction = "\n使用松弛模式：每天只安排2-3个核心景点，留出充足的休息和自由探索时间。";
  }

  const userMessage = `请为以下需求生成旅游攻略：

目的地城市：${params.city}
想去的景点：${params.attractions.join("、")}
游玩天数：${params.days}天
人数：${params.people}人
出行方式：${params.transport}
人均预算：${params.budget}元
旅行风格：${params.style}

请生成一份详细、实用的攻略。每个景点都要包含门票价格和购买方式、具体交通路线、以及本地美食推荐。按地理位置就近安排景点顺序。输出纯 JSON，不要用 markdown 代码块。`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT + scenarioInstruction + modeInstruction },
      { role: "user", content: userMessage },
    ],
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      let buffer = "";
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          buffer += text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, full: buffer })}\n\n`));
      controller.close();
    },
  });
}
