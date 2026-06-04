/** 会员等级定义和功能门控 */

export interface Tier {
  key: string;
  name: string;
  price: string;
  maxDays: number;
  maxDestinations: number;
  aiGenerationsPerDay: number;
  features: string[];
  color: string;
}

export const TIERS: Tier[] = [
  {
    key: 'free',
    name: '免费版',
    price: '¥0',
    maxDays: 3,
    maxDestinations: 1,
    aiGenerationsPerDay: 3,
    color: '#6b7280',
    features: [
      '3天内单目的地攻略',
      '基础AI行程生成（3次/天）',
      '景点浏览与收藏',
      '攻略保存与分享',
      '基础行程导出',
    ],
  },
  {
    key: 'premium',
    name: '高级版',
    price: '¥29/月',
    maxDays: 30,
    maxDestinations: 10,
    aiGenerationsPerDay: 50,
    color: '#2563eb',
    features: [
      '无限天数多目的地连线',
      '无限AI生成（50次/天）',
      'AI导游精细微调',
      '预算明细自动生成',
      '行李智能清单',
      '游记AI生成',
      'PDF精美导出',
      '离线攻略查看',
      '专属客服优先响应',
    ],
  },
  {
    key: 'b2b',
    name: '企业版',
    price: '定制',
    maxDays: 999,
    maxDestinations: 999,
    aiGenerationsPerDay: 999,
    color: '#7c3aed',
    features: [
      '全部高级版功能',
      '企业团建方案定制',
      '研学旅行专题方案',
      'API数据授权接入',
      '专属文旅数据面板',
      '多管理员账号',
      '优先技术支持',
    ],
  },
];

export function getTier(key?: string): Tier {
  return TIERS.find((t) => t.key === key) || TIERS[0];
}
