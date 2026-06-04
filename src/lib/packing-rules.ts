/** 行李清单规则引擎：目的地气候+季节+天数+活动类型→物品清单 */

export interface PackingCategory {
  category: string;
  icon: string;
  items: string[];
}

const BASE_ITEMS: Record<string, string[]> = {
  '证件': ['身份证/护照', '银行卡/现金', '机票/车票确认单', '酒店预订确认'],
  '电子': ['手机及充电器', '充电宝', '数据线', '耳机'],
  '日用品': ['洗漱用品', '毛巾', '纸巾/湿巾', '防晒霜', '唇膏'],
  '药品': ['创可贴', '感冒药', '肠胃药', '晕车药', '个人常用药'],
};

const CLIMATE_EXTRAS: Record<string, string[]> = {
  tropical: ['遮阳帽', '太阳镜', '防蚊液', '泳衣', '凉鞋', '速干衣'],
  subtropical: ['折叠伞', '薄外套', '防晒衣', '透气衣物'],
  temperate: ['外套', '围巾', '保暖内衣（秋冬）', '手套（冬季）'],
  continental: ['厚外套（冬季）', '保暖内衣', '帽子', '手套', '润肤霜'],
  plateau: ['防晒霜SPF50+', '墨镜', '高原反应药', '保暖外套（昼夜温差大）', '润唇膏'],
};

const ACTIVITY_EXTRAS: Record<string, string[]> = {
  nature: ['登山鞋/运动鞋', '背包', '水壶', '驱蚊液'],
  culture: ['相机', '便携笔记本', '舒适的步行鞋'],
  food: ['健胃消食片', '便携餐具'],
  adventure: ['速干衣', '防水袋', '头灯', '多功能工具'],
  beach: ['泳衣', '沙滩巾', '防水手机袋', '浮潜装备'],
};

export function generatePackingList(
  city: string,
  days: number,
  style?: string,
  climate?: string,
): PackingCategory[] {
  const categories: PackingCategory[] = [];

  // 基础物品
  for (const [cat, items] of Object.entries(BASE_ITEMS)) {
    const adjusted = items.map((i) =>
      i === '防晒霜' && days > 5 ? `${i}（建议带大瓶）` : i
    );
    categories.push({ category: cat, icon: getIcon(cat), items: adjusted });
  }

  // 衣物类
  const clothesItems = ['内衣裤 x' + Math.min(days, 7), '袜子 x' + Math.min(days, 7)];
  if (climate && CLIMATE_EXTRAS[climate]) {
    clothesItems.push(...CLIMATE_EXTRAS[climate]);
  } else {
    clothesItems.push('应季衣物 x' + Math.ceil(days / 2), '舒适步行鞋');
  }
  if (days >= 5) clothesItems.push('睡衣');
  categories.push({ category: '衣物', icon: '👕', items: clothesItems });

  // 活动特定物品
  if (style) {
    const activityItems: string[] = [];
    const styles = style.split(/[,，]/);
    for (const s of styles) {
      const key = s.trim().toLowerCase();
      const mapping: Record<string, string> = {
        '户外': 'nature', '自然': 'nature', '登山': 'adventure',
        '文化': 'culture', '美食': 'food', '探险': 'adventure',
        '休闲': 'beach', '海滩': 'beach', '海岛': 'beach',
      };
      const mapped = mapping[key] || key;
      if (ACTIVITY_EXTRAS[mapped]) {
        activityItems.push(...ACTIVITY_EXTRAS[mapped]);
      }
    }
    if (activityItems.length) {
      categories.push({
        category: '活动装备',
        icon: '🎒',
        items: [...new Set(activityItems)],
      });
    }
  }

  // 境外旅行额外物品
  if (city.includes('东京') || city.includes('大阪') || city.includes('京都') ||
      city.includes('曼谷') || city.includes('首尔') || climate === 'overseas') {
    categories.push({
      category: '境外旅行',
      icon: '🌏',
      items: ['护照+签证', '境外旅行保险单', '转换插头', '当地货币', '离线地图下载', '翻译App预装'],
    });
  }

  return categories;
}

function getIcon(cat: string): string {
  const icons: Record<string, string> = {
    '证件': '📄', '电子': '📱', '日用品': '🧴', '药品': '💊',
  };
  return icons[cat] || '📦';
}
