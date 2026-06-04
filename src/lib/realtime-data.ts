/**
 * 实时数据模拟引擎
 * 根据时间和景点信息返回模拟的开闭园、人流量、天气等状态
 */

export interface SpotStatus {
  spotName: string;
  isOpen: boolean;
  statusText: string;
  crowdLevel: 'low' | 'medium' | 'high';
  crowdText: string;
  weather: string;
  temp: number;
  bestTime: string;
}

const WEATHER_POOL = ['☀️ 晴', '⛅ 多云', '☁️ 阴', '🌧️ 小雨', '🌦️ 阵雨'];
const CROWD_LABELS: Record<string, string> = { low: '人少舒适', medium: '适中', high: '较拥挤' };

/** 获取景点实时状态（基于名称hash生成稳定的模拟数据） */
export function getSpotStatus(spotName: string, spotId?: number): SpotStatus {
  const now = new Date();
  const hour = now.getHours();
  const seed = (spotId || spotName.charCodeAt(0) || 65) + now.getDate();

  const isNight = hour < 6 || hour >= 21;
  const closedRandom = seed % 11 === 0; // ~9%

  let isOpen = true;
  let statusText = '营业中';
  if (isNight) { isOpen = false; statusText = '已闭园（夜间）'; }
  if (closedRandom && !isNight) { isOpen = false; statusText = '今日临时闭园'; }

  let crowdLevel: 'low' | 'medium' | 'high' = 'low';
  if (hour >= 9 && hour <= 12) crowdLevel = seed % 3 === 0 ? 'high' : 'medium';
  if (hour >= 14 && hour <= 17) crowdLevel = seed % 2 === 0 ? 'high' : 'medium';

  const weather = WEATHER_POOL[(seed + now.getMonth()) % WEATHER_POOL.length];
  const temp = 15 + (seed % 20) + (hour >= 13 ? 4 : 0);

  const bestTimes = ['08:00-10:00', '09:00-11:00', '14:00-16:00', '16:00-18:00'];
  const bestTime = bestTimes[seed % bestTimes.length];

  return {
    spotName,
    isOpen,
    statusText,
    crowdLevel,
    crowdText: CROWD_LABELS[crowdLevel],
    weather,
    temp,
    bestTime,
  };
}

export interface WeatherAlert {
  level: 'info' | 'yellow' | 'orange';
  message: string;
  icon: string;
}

/** 获取目的地的天气预警 */
export function getWeatherAlerts(cityName: string): WeatherAlert[] {
  const seed = cityName.charCodeAt(0) + cityName.charCodeAt(cityName.length - 1);
  const alerts: WeatherAlert[] = [];

  if (seed % 7 === 0) {
    alerts.push({ level: 'yellow', message: '明后天可能有降雨，建议携带雨具', icon: '🌧️' });
  }
  if (seed % 11 === 0) {
    alerts.push({ level: 'orange', message: '高温预警，注意防暑降温，避免正午户外活动', icon: '🔥' });
  }
  if (seed % 13 === 0) {
    alerts.push({ level: 'info', message: '近期为旅游旺季，热门景点可能排队较久', icon: '👥' });
  }

  return alerts;
}
