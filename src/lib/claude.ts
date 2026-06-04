import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com/v1",
});

const SYSTEM_PROMPT = `你是一个专业的旅游规划师，精通中国和日本的热门旅游目的地。
你需要根据用户的需求生成详细的旅游攻略。攻略必须包含每一天的具体时间安排、景点门票购买方式、交通建议和实用小贴士。

## 地理智能排程（核心要求）

1. **就近串联**：同一天的景点必须在同一片区，按地理位置由近及远安排，避免折返绕路
2. **交通标注**：每个景点间标注具体的交通方式、路线和时间
3. **节奏控制**：
   - 紧凑模式：每天4-5个景点，紧密衔接
   - 适中模式：每天3-4个景点，安排合理
   - 松弛模式：每天2-3个景点，留出充足的自由探索时间

## 交通信息要求（非常重要）
每个景点的 transportTip 必须包含极其具体的交通方式：
- 地铁：写明几号线、哪个站上车、哪个站下车、哪个出口出
- 公交：写明几路公交车、哪个站上车、哪个站下车
- 骑行：如果距离近（<2公里），建议骑共享单车，写明骑行时间
- 步行：如果相邻（<1公里），建议步行，写明步行时间和路线
- 打车：写明预估费用和时间

## 门票信息
每个景点的 ticket 必须包含价格和购票方式，如"需提前在XX公众号预约"、"现场购票"等。

## 本地推荐
- 每个景点标注是「本地人推荐🏠」还是「热门景点📸」
- 如果附近有游客陷阱或宰客风险，标注「⚠️避坑提示」
- 推荐本地人常去的餐馆，区分网红店

## 预算明细
攻略必须包含按分类合计的预算明细：住宿/餐饮/交通/门票/其他

输出格式必须严格遵守 JSON 结构，不要输出任何其他内容，不要用 markdown 代码块包裹。`;

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
