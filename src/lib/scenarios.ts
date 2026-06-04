/**
 * 细分场景预设配置
 * 每个场景包含：名称、描述、图标、默认偏好覆盖、专属AI指令
 */

export interface Scenario {
  key: string;
  name: string;
  icon: string;
  desc: string;
  tips: string[];
  /** 注入到 AI prompt 的额外指令 */
  promptAddition: string;
  /** 默认偏好覆盖 */
  defaults: {
    people?: number;
    transport?: string;
    style?: string;
    budget?: number;
  };
}

export const SCENARIOS: Scenario[] = [
  {
    key: 'study',
    name: '研学旅行',
    icon: '📚',
    desc: '博物馆、历史遗迹、科技馆为主线，兼顾教育性与趣味性',
    tips: [
      '优先安排博物馆/科技馆/历史遗址',
      '穿插互动体验类项目增强趣味性',
      '预留充足的研学笔记时间',
      '每个博物馆预留至少2-3小时',
    ],
    promptAddition: '这是一个研学旅行。优先安排博物馆、科技馆、历史遗址等具有教育意义的景点。每天安排3个以内的核心参观点，预留充足的学习和体验时间。',
    defaults: { people: 2, transport: '公共交通', style: '文化', budget: 2000 },
  },
  {
    key: 'pet',
    name: '宠物出游',
    icon: '🐕',
    desc: '带毛孩子一起看世界，宠物友好酒店、公园草坪',
    tips: [
      '选择宠物友好酒店和餐厅',
      '优先安排公园、绿地等开放空间',
      '随身携带宠物水碗、零食和清洁袋',
      '提前确认景点是否允许宠物进入',
      '避免高温时段户外活动',
    ],
    promptAddition: '这是一个宠物出游行程。优先安排允许宠物进入的户外景点（公园、步道、宠物友好海滩等）。需要标注哪些场所可能不允许宠物入内，并提供附近宠物寄养点建议。住宿推荐宠物友好酒店。',
    defaults: { people: 1, transport: '自驾', style: '户外', budget: 1500 },
  },
  {
    key: 'senior',
    name: '银发慢游',
    icon: '🌅',
    desc: '慢节奏、低强度、无障碍，适合长者悠闲出行',
    tips: [
      '避开高海拔和极端气温目的地',
      '每天不超过3个景点，留有充足休息时间',
      '优先选择无障碍设施完善的景区',
      '准备常用药品和紧急联系人信息',
      '午休时间建议安排在12:00-14:00',
    ],
    promptAddition: '这是银发长者出行。行程节奏慢，每天不超过3个景点，景点间有充足休息时间。避免大量步行和爬坡路线，优先安排有缆车/电瓶车的景区。住宿选择安静舒适型，餐饮选择清淡易消化的餐厅。',
    defaults: { people: 2, transport: '打车+网约车', style: '休闲' },
  },
  {
    key: 'budget',
    name: '穷游达人',
    icon: '🎒',
    desc: '花最少的钱看最多的风景，性价比拉满',
    tips: [
      '优先免费景点和自然风光',
      '推荐青年旅舍/民宿/青旅',
      '当地小吃街代替网红餐厅',
      '购买公共交通周卡/通票',
      '提前关注景点免费开放日',
    ],
    promptAddition: '这是穷游/背包客行程。预算紧张，优先免费景点和低价体验。住宿推荐青旅或经济型酒店（人均100元/晚以内）。餐饮推荐街头小吃和本地小馆（人均30元以内）。交通推荐公共交通。每天控制在人均200元以内。',
    defaults: { people: 1, transport: '公共交通', budget: 800 },
  },
  {
    key: 'overseas',
    name: '境外自由行',
    icon: '🌏',
    desc: '走出国门体验异国文化，签证到落地全攻略',
    tips: [
      '提前3个月办理签证',
      '购买境外旅行保险',
      '准备翻译App和离线地图',
      '了解当地风俗禁忌和紧急电话',
      '携带国际通用的充电转换插头',
      '提前兑换适量当地货币',
    ],
    promptAddition: '这是境外自由行。需要包含签证提醒、货币兑换建议、当地SIM卡/上网方案、出入境注意事项。标注当地紧急电话和领事馆信息。推荐国际连锁酒店或当地特色民宿。',
    defaults: { people: 2, transport: '公共交通+步行', budget: 8000 },
  },
  {
    key: 'weekend',
    name: '周末微旅行',
    icon: '🚗',
    desc: '48小时说走就走，周边短途放松身心',
    tips: [
      '选择车程3小时内的目的地',
      '精简行程，主打放松和美食',
      '周五晚出发、周日午餐后返回',
      '提前预订周末房源（涨价快）',
      '轻装出行，一个背包搞定',
    ],
    promptAddition: '这是一个2天周末短途旅行。行程紧凑但不紧张，主打休闲放松和美食体验。每天安排2-3个精选点，不需要面面俱到。推荐当地特色美食作为重点。',
    defaults: { people: 2, transport: '自驾', style: '休闲', budget: 1000 },
  },
];

export function getScenario(key: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.key === key);
}
