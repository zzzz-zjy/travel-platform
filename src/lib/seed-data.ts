export interface SeedAttraction {
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating: number;
  ticketInfo: string;
  transportTips: string;
  description: string;
}

export interface SeedCity {
  name: string;
  lat: number;
  lng: number;
  attractions: SeedAttraction[];
}

export const seedData: Record<string, Record<string, SeedCity[]>> = {
  CN: {
    "四川": [
      {
        name: "成都", lat: 30.5728, lng: 104.0668,
        attractions: [
          { name: "宽窄巷子", category: "culture", lat: 30.6688, lng: 104.0583, rating: 4.5,
            ticketInfo: "免费进入", transportTips: "地铁2号线宽窄巷子站B口出",
            description: "由宽巷子、窄巷子和井巷子平行排列组成的清代古街区，成都最具代表性的历史文化街区之一。" },
          { name: "大熊猫繁育研究基地", category: "nature", lat: 30.7366, lng: 104.1427, rating: 4.7,
            ticketInfo: "55元/人，需提前在公众号「成都大熊猫繁育研究基地」预约", transportTips: "地铁3号线熊猫大道站A口出，换乘景区直通车",
            description: "全球最大的大熊猫人工繁殖基地，可以近距离观察可爱的大熊猫。" },
          { name: "锦里古街", category: "culture", lat: 30.6481, lng: 104.0474, rating: 4.4,
            ticketInfo: "免费进入", transportTips: "地铁3号线高升桥站D口出步行10分钟",
            description: "三国文化主题商业街，小吃、手工艺品、川剧变脸表演应有尽有。" },
          { name: "都江堰", category: "nature", lat: 30.9985, lng: 103.6112, rating: 4.6,
            ticketInfo: "80元/人", transportTips: "成都犀浦站乘城际列车至都江堰站，约30分钟",
            description: "世界文化遗产，两千多年前李冰父子修建的水利工程，至今仍在发挥作用。" }
        ]
      }
    ],
    "北京": [
      {
        name: "北京", lat: 39.9042, lng: 116.4074,
        attractions: [
          { name: "故宫博物院", category: "culture", lat: 39.9163, lng: 116.3972, rating: 4.8,
            ticketInfo: "60元(旺季)/40元(淡季)，需提前在「故宫博物院」小程序预约", transportTips: "地铁1号线天安门东站B口出",
            description: "明清两代皇家宫殿，世界上现存规模最大、保存最完整的木质结构古建筑群。" },
          { name: "长城（八达岭）", category: "nature", lat: 40.3544, lng: 116.0201, rating: 4.6,
            ticketInfo: "40元(旺季)/35元(淡季)", transportTips: "北京北站乘S2线市郊铁路至八达岭站，约1小时",
            description: "明长城精华段，'不到长城非好汉'的必打卡之地。" },
          { name: "颐和园", category: "nature", lat: 39.9999, lng: 116.2754, rating: 4.5,
            ticketInfo: "30元(旺季)/20元(淡季)", transportTips: "地铁4号线北宫门站D口出",
            description: "中国现存最大的皇家园林，昆明湖与万寿山交相辉映。" }
        ]
      }
    ],
    "浙江": [
      {
        name: "杭州", lat: 30.2741, lng: 120.1551,
        attractions: [
          { name: "西湖", category: "nature", lat: 30.2434, lng: 120.1473, rating: 4.7,
            ticketInfo: "景区免费，部分景点收费（雷峰塔40元，灵隐寺45元）", transportTips: "地铁1号线龙翔桥站C口出步行5分钟",
            description: "中国十大风景名胜之一，'欲把西湖比西子，淡妆浓抹总相宜'。" },
          { name: "灵隐寺", category: "culture", lat: 30.2432, lng: 120.0971, rating: 4.6,
            ticketInfo: "45元(含飞来峰门票)", transportTips: "公交7路/Y2路至灵隐站",
            description: "中国佛教禅宗十大古刹之一，始建于东晋，飞来峰石刻尤为珍贵。" },
          { name: "龙井村", category: "food", lat: 30.2267, lng: 120.1227, rating: 4.4,
            ticketInfo: "免费进入，品茶约50-100元/人", transportTips: "公交27路至龙井村站",
            description: "龙井茶原产地，春天可以体验采茶、炒茶，品尝正宗明前龙井。" }
        ]
      }
    ],
    "云南": [
      {
        name: "丽江", lat: 26.8721, lng: 100.2299,
        attractions: [
          { name: "丽江古城", category: "culture", lat: 26.8721, lng: 100.2368, rating: 4.5,
            ticketInfo: "古城维护费50元", transportTips: "丽江三义机场打车约30分钟，或乘机场大巴",
            description: "世界文化遗产，纳西族文化中心，小桥流水人家的浪漫古城。" },
          { name: "玉龙雪山", category: "nature", lat: 27.1072, lng: 100.1761, rating: 4.7,
            ticketInfo: "进山费100元+大索道180元，需提前一天预约", transportTips: "丽江古城包车约40分钟，或乘旅游专线大巴",
            description: "北半球最南端的雪山，海拔5596米，冰川公园可乘大索道到达4506米。" }
        ]
      }
    ],
    "陕西": [
      {
        name: "西安", lat: 34.3416, lng: 108.9398,
        attractions: [
          { name: "兵马俑", category: "culture", lat: 34.3852, lng: 109.2732, rating: 4.8,
            ticketInfo: "120元(旺季)/100元(淡季)", transportTips: "西安火车站乘游5(306)路公交直达，约1小时",
            description: "世界第八大奇迹，秦始皇陵陪葬坑，数千陶俑神态各异举世无双。" },
          { name: "大雁塔", category: "culture", lat: 34.2141, lng: 108.9626, rating: 4.5,
            ticketInfo: "大慈恩寺50元，登塔另付30元", transportTips: "地铁3号线大雁塔站B口出",
            description: "唐代玄奘法师为保存佛经而建，西安地标性建筑。" },
          { name: "回民街", category: "food", lat: 34.2646, lng: 108.9429, rating: 4.3,
            ticketInfo: "免费进入", transportTips: "地铁2号线钟楼站出步行5分钟",
            description: "西安著名美食街，肉夹馍、羊肉泡馍、biangbiang面等西北美食汇聚。" }
        ]
      }
    ]
  },
  JP: {
    "东京都": [
      {
        name: "东京", lat: 35.6762, lng: 139.6503,
        attractions: [
          { name: "浅草寺", category: "culture", lat: 35.7148, lng: 139.7967, rating: 4.5,
            ticketInfo: "免费进入", transportTips: "地铁银座线浅草站1号口出",
            description: "东京最古老的寺庙，雷门大红灯笼是标志性打卡点。" },
          { name: "明治神宫", category: "culture", lat: 35.6764, lng: 139.6993, rating: 4.6,
            ticketInfo: "免费进入，宝物殿500日元", transportTips: "JR山手线原宿站表参道口出",
            description: "供奉明治天皇的神社，位于东京市中心却如森林般幽静。" },
          { name: "筑地场外市场", category: "food", lat: 35.6652, lng: 139.7707, rating: 4.4,
            ticketInfo: "免费进入", transportTips: "地铁日比谷线筑地站1号口出",
            description: "东京美食圣地，新鲜刺身、烤海鲜、玉子烧，吃货天堂。" }
        ]
      }
    ]
  }
};
