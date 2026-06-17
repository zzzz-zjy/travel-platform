export interface SeedSite {
  name: string;
  siteType: string;
  lat: number; lng: number;
  rating: number;
  ticketInfo: string;
  transportTips: string;
  description: string;
  historicalBg: string;
  images: string[];
  era?: string;
}

export interface SeedCity {
  name: string;
  lat: number; lng: number;
  sites: SeedSite[];
}

export interface SeedProvince {
  cities: SeedCity[];
}

export const ERAS = [
  { name: "建党初期", color: "#8B0000", startYear: 1919, endYear: 1927, description: "五四运动到南昌起义前，党的诞生与早期革命活动" },
  { name: "土地革命", color: "#B22222", startYear: 1927, endYear: 1937, description: "南昌起义到全面抗战前，井冈山斗争与红军长征" },
  { name: "抗日战争", color: "#C41E3A", startYear: 1937, endYear: 1945, description: "全面抗战时期，敌后战场与抗日根据地" },
  { name: "解放战争", color: "#DC143C", startYear: 1945, endYear: 1949, description: "重庆谈判到新中国成立" },
];

export const REVOLUTION_SEED: Record<string, SeedProvince> = {
  "北京": {
    cities: [
      { name: "北京", lat: 39.9042, lng: 116.4074, sites: [
        {
          name: "中国共产党历史展览馆", siteType: "博物馆",
          lat: 40.0020, lng: 116.3977, rating: 4.9,
          ticketInfo: "免费，公众号预约", transportTips: "地铁8号线奥林匹克公园站B口出",
          description: "全方位展示中国共产党百年奋斗历程的国家级展览馆",
          historicalBg: "2021年建党百年之际建成开馆，是展示中国共产党历史最全面、最权威的展馆。馆藏2600余件文物实物，全景式展现了从石库门到天安门的伟大历程。",
          images: [],
        },
        {
          name: "北大红楼（北京新文化运动纪念馆）", siteType: "旧址",
          lat: 39.9219, lng: 116.4080, rating: 4.7,
          ticketInfo: "免费，凭身份证领票", transportTips: "地铁6/8号线南锣鼓巷站F口出",
          description: "五四运动策源地，中国最早传播马克思主义的地方",
          historicalBg: "1918年建成，原北京大学文科大楼。李大钊在此开设中国最早的马克思主义课程，毛泽东曾在此担任图书馆助理员。这里是五四运动的重要发源地，也是中国共产党早期北京革命活动的见证。",
          images: [],
          era: "建党初期",
        },
        {
          name: "中国人民抗日战争纪念馆", siteType: "博物馆",
          lat: 39.8500, lng: 116.2188, rating: 4.8,
          ticketInfo: "免费，公众号预约", transportTips: "地铁14号线大井站B口出步行15分钟",
          description: "全国唯一全面反映中国人民抗日战争历史的综合性纪念馆",
          historicalBg: "位于卢沟桥畔宛平城内，1987年建成开馆。馆藏抗日战争时期各类文物3万余件，全景展现了从九一八事变到抗战胜利的历史。每年7月7日在此举办纪念全民族抗战爆发仪式。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "宛平城抗战遗址", siteType: "旧址",
          lat: 39.8490, lng: 116.2200, rating: 4.6,
          ticketInfo: "免费", transportTips: "地铁14号线大井站B口出",
          description: "七七事变爆发地，全民族抗战的起点",
          historicalBg: "1937年7月7日夜，日军在卢沟桥附近制造事端，进攻宛平城，挑起七七事变（卢沟桥事变），中国守军奋起抵抗。这一事件标志着全民族抗日战争的全面爆发，成为中华民族全面抗战的起点。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "香山革命纪念馆", siteType: "博物馆",
          lat: 39.9925, lng: 116.1915, rating: 4.6,
          ticketInfo: "免费，公众号预约", transportTips: "地铁西郊线香山站出步行10分钟",
          description: "中共中央进驻北平后的第一个驻地",
          historicalBg: "1949年3月，中共中央从西柏坡迁至北平香山。毛泽东在此指挥了渡江战役，筹备了中国人民政治协商会议，为新中国诞生做了最后准备。双清别墅是毛泽东居住和办公的地点。",
          images: [],
          era: "解放战争",
        },
      ]},
    ],
  },
  "上海": {
    cities: [
      { name: "上海", lat: 31.2304, lng: 121.4737, sites: [
        {
          name: "中共一大会址纪念馆", siteType: "旧址",
          lat: 31.2220, lng: 121.4750, rating: 4.9,
          ticketInfo: "免费，公众号预约", transportTips: "地铁1号线黄陂南路站2号口出",
          description: "中国共产党的诞生地",
          historicalBg: "1921年7月23日，中国共产党第一次全国代表大会在此召开。来自全国各地的13名代表，代表全国50多名党员，在这里宣告了中国共产党的成立。会议最后一天因法租界巡捕袭扰，转移到浙江嘉兴南湖的游船上继续举行。",
          images: [
            "https://images.unsplash.com/photo-1559827269-dc5c52c3a5c8?w=800",
            "https://images.unsplash.com/photo-1523740856324-f2ce89135981?w=800",
          ],
        },
        {
          name: "中共二大会址纪念馆", siteType: "旧址",
          lat: 31.2260, lng: 121.4610, rating: 4.5,
          ticketInfo: "免费", transportTips: "地铁2号线南京西路站1号口出",
          description: "第一部党章诞生地",
          historicalBg: "1922年7月，中共二大在此召开。制定了党的最低纲领和最高纲领，通过了第一部《中国共产党章程》，在中国革命史上首次明确地提出了彻底反帝反封建的民主革命纲领。",
          images: [],
        },
        {
          name: "龙华烈士陵园", siteType: "陵园",
          lat: 31.1775, lng: 121.4496, rating: 4.7,
          ticketInfo: "免费", transportTips: "地铁3号线龙漕路站换公交",
          description: "缅怀革命先烈的纪念圣地",
          historicalBg: "原为国民党淞沪警备司令部旧址，1927年至1937年间，数以千计的共产党人和革命志士在此被关押和杀害。包括陈延年、赵世炎、柔石等烈士，鲁迅曾写下《为了忘却的记念》悼念在此牺牲的左联五烈士。",
          images: [],
          era: "土地革命",
        },
      ]},
    ],
  },
  "江西": {
    cities: [
      { name: "南昌", lat: 28.6820, lng: 115.8581, sites: [
        {
          name: "南昌八一起义纪念馆", siteType: "纪念馆",
          lat: 28.6795, lng: 115.8850, rating: 4.8,
          ticketInfo: "免费，凭身份证领票", transportTips: "地铁1号线八一馆站出",
          description: "军旗升起的地方，人民军队的诞生地",
          historicalBg: "1927年8月1日，周恩来、贺龙、叶挺、朱德等在此领导了南昌起义，打响了武装反抗国民党反动派的第一枪。这是中国共产党独立领导武装斗争和创建革命军队的开始。",
          images: [],
        },
      ]},
      { name: "井冈山", lat: 26.5680, lng: 114.1800, sites: [
        {
          name: "井冈山革命博物馆", siteType: "博物馆",
          lat: 26.5610, lng: 114.1720, rating: 4.8,
          ticketInfo: "井冈山景区联票190元", transportTips: "井冈山火车站乘景区大巴至茨坪",
          description: "中国第一个农村革命根据地的全景展示",
          historicalBg: "1927年10月，毛泽东率领秋收起义部队到达井冈山，创建了中国第一个农村革命根据地。在这里形成了'农村包围城市、武装夺取政权'的革命道路。井冈山斗争历时两年四个月，为中国革命保存了星星之火。",
          images: [],
        },
        {
          name: "八角楼毛泽东旧居", siteType: "旧址",
          lat: 26.5830, lng: 114.1470, rating: 4.6,
          ticketInfo: "含景区联票", transportTips: "井冈山景区大巴至茅坪",
          description: "毛泽东写下《星星之火，可以燎原》的地方",
          historicalBg: "1927年冬至1929年秋，毛泽东在此居住和办公。在这座土砖结构的八角形小楼里，毛泽东写下了《中国的红色政权为什么能够存在？》等光辉著作，回答了'红旗到底打得多久'的疑问。",
          images: [],
        },
      ]},
      { name: "瑞金", lat: 25.8788, lng: 116.0274, sites: [
        {
          name: "瑞金中央革命根据地纪念馆", siteType: "博物馆",
          lat: 25.8870, lng: 116.0250, rating: 4.6,
          ticketInfo: "免费", transportTips: "瑞金站乘5路公交至纪念馆",
          description: "中华苏维埃共和国临时中央政府所在地",
          historicalBg: "1931年11月，中华苏维埃共和国临时中央政府在瑞金成立，毛泽东当选为主席。瑞金成为中央革命根据地的中心，被称为'红色故都'。这里是中国共产党治国理政的第一次伟大实践。",
          images: [],
        },
      ]},
    ],
  },
  "陕西": {
    cities: [
      { name: "延安", lat: 36.5855, lng: 109.4897, sites: [
        {
          name: "延安革命纪念馆", siteType: "博物馆",
          lat: 36.5915, lng: 109.4950, rating: 4.9,
          ticketInfo: "免费，凭身份证领票", transportTips: "延安站乘K1路公交至王家坪",
          description: "中国革命从延安走向全国的见证",
          historicalBg: "1935年至1948年，延安是中共中央所在地。十三年间，党中央在此领导了抗日战争和解放战争，形成了以坚定正确的政治方向、解放思想实事求是、全心全意为人民服务、自力更生艰苦奋斗为核心的延安精神。",
          images: [
            "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800",
            "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800",
          ],
          era: "抗日战争",
        },
        {
          name: "王家坪革命旧址", siteType: "旧址",
          lat: 36.5970, lng: 109.4900, rating: 4.5,
          ticketInfo: "免费", transportTips: "延安市区乘1路公交至王家坪",
          description: "中央军委和八路军总部驻地",
          historicalBg: "1937年至1947年，中央军委和八路军总部在此办公。毛泽东在此发表了《为人民服务》等著名演讲。王家坪见证了抗日战争和解放战争时期党中央指挥全国军事斗争的历史。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "中共中央西北局旧址", siteType: "旧址",
          lat: 36.5890, lng: 109.4800, rating: 4.3,
          ticketInfo: "免费", transportTips: "延安市区乘2路公交至西北局",
          description: "西北地区党的领导指挥中心",
          historicalBg: "1941年5月，中共中央西北局在延安成立，高岗任书记。西北局统一领导陕甘宁边区和西北各省党的工作，为抗日战争和解放战争的胜利做出了重要贡献。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "宝塔山革命遗址", siteType: "旧址",
          lat: 36.5950, lng: 109.4930, rating: 4.6,
          ticketInfo: "门票30元", transportTips: "延安市区步行至宝塔山",
          description: "延安的象征，革命圣地的标志",
          historicalBg: "宝塔山上的唐代宝塔是延安的标志性建筑。延安时期，宝塔山见证了无数革命青年的到来，成为革命圣地的象征。山上保存有范公井、摘星楼等历史遗迹，与延安革命历史交相辉映。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "杨家岭革命旧址", siteType: "旧址",
          lat: 36.6000, lng: 109.4840, rating: 4.7,
          ticketInfo: "免费", transportTips: "延安市区乘1路公交至杨家岭",
          description: "中共七大召开地",
          historicalBg: "1938年至1947年，中共中央在此办公。1945年，中共七大在此召开，确立了毛泽东思想为党的指导思想。毛泽东在此发表了《在延安文艺座谈会上的讲话》，会见了美国记者斯特朗，提出了'一切反动派都是纸老虎'的著名论断。",
          images: [],
        },
        {
          name: "枣园革命旧址", siteType: "旧址",
          lat: 36.6150, lng: 109.5020, rating: 4.7,
          ticketInfo: "免费", transportTips: "延安市区乘3路公交至枣园",
          description: "毛泽东《论联合政府》诞生地",
          historicalBg: "1944年至1947年，中共中央书记处在此办公。毛泽东在此写下了《论联合政府》《为人民服务》等重要文章。1944年，中央警卫团战士张思德牺牲后，毛泽东在此发表了《为人民服务》的著名演讲。",
          images: [],
        },
      ]},
      { name: "西安", lat: 34.3416, lng: 108.9398, sites: [
        {
          name: "西安事变纪念馆（张学良公馆）", siteType: "旧址",
          lat: 34.2640, lng: 108.9685, rating: 4.5,
          ticketInfo: "免费", transportTips: "地铁4号线大差市站C口出",
          description: "西安事变发生地，改变中国历史进程的关键地点",
          historicalBg: "1936年12月12日，张学良、杨虎城在此发动西安事变，扣押蒋介石，逼蒋抗日。在中国共产党的斡旋下，事变和平解决，促成了抗日民族统一战线的形成，成为扭转时局的关键。",
          images: [],
          era: "土地革命",
        },
      ]},
    ],
  },
  "贵州": {
    cities: [
      { name: "遵义", lat: 27.7225, lng: 106.9268, sites: [
        {
          name: "遵义会议会址", siteType: "旧址",
          lat: 27.6932, lng: 106.9220, rating: 4.9,
          ticketInfo: "免费，凭身份证领票", transportTips: "遵义站乘1路公交至会议会址",
          description: "中国共产党历史上一个生死攸关的转折点",
          historicalBg: "1935年1月15日至17日，中共中央政治局在遵义召开扩大会议。会议结束了王明'左'倾教条主义在中共中央的统治，确立了毛泽东在红军和中共中央的领导地位，在极端危急的历史关头挽救了党、挽救了红军、挽救了中国革命。",
          images: [],
        },
      ]},
    ],
  },
  "河北": {
    cities: [
      { name: "石家庄", lat: 38.0428, lng: 114.5149, sites: [
        {
          name: "西柏坡纪念馆", siteType: "纪念馆",
          lat: 38.3170, lng: 113.9370, rating: 4.8,
          ticketInfo: "免费", transportTips: "石家庄站乘大巴至西柏坡约1.5小时",
          description: "新中国从这里走来",
          historicalBg: "1948年5月至1949年3月，中共中央在此办公。西柏坡是解放全中国的最后一个农村指挥所。在这里，党中央指挥了三大战役，召开了七届二中全会，提出了'两个务必'的著名论断。",
          images: [],
          era: "解放战争",
        },
      ]},
      { name: "保定", lat: 38.8739, lng: 115.4648, sites: [
        {
          name: "冉庄地道战遗址纪念馆", siteType: "纪念馆",
          lat: 38.7550, lng: 115.4290, rating: 4.5,
          ticketInfo: "免费", transportTips: "保定站乘大巴至冉庄约40分钟",
          description: "地道战的光辉典范",
          historicalBg: "抗日战争时期，冉庄人民在共产党领导下，创造了长达16公里的地道网。地道设有指挥部、休息室、陷阱等，既能藏身又能作战。冉庄地道战是华北敌后抗战中人民战争的光辉典范。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "狼牙山五壮士纪念馆", siteType: "纪念馆",
          lat: 38.9980, lng: 115.1350, rating: 4.7,
          ticketInfo: "免费", transportTips: "保定站乘旅游大巴至狼牙山",
          description: "五壮士英勇跳崖的英雄壮举",
          historicalBg: "1941年9月25日，日军对狼牙山根据地发动扫荡。马宝玉、葛振林、宋学义、胡德林、胡福才五位战士为掩护大部队转移，将敌人引上绝路，在弹尽粮绝后纵身跳下悬崖，谱写了抗日战争中最壮烈的篇章。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "白求恩柯棣华纪念馆", siteType: "纪念馆",
          lat: 38.7430, lng: 114.9850, rating: 4.5,
          ticketInfo: "免费", transportTips: "保定乘车至唐县",
          description: "国际主义精神的丰碑",
          historicalBg: "白求恩（加拿大）和柯棣华（印度）两位国际友人先后在晋察冀边区从事医疗救援工作。白求恩1939年在手术中感染殉职，毛泽东写下《纪念白求恩》。柯棣华1942年积劳成疾逝世于唐县。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "晋察冀边区革命纪念馆", siteType: "纪念馆",
          lat: 38.8850, lng: 114.2080, rating: 4.4,
          ticketInfo: "免费", transportTips: "保定乘车至阜平县城南庄",
          description: "敌后抗日根据地指挥中心",
          historicalBg: "晋察冀边区是中国共产党在敌后创建的第一个抗日根据地。聂荣臻率部在此开辟了华北敌后最大的抗日根据地，被毛泽东誉为'敌后模范抗日根据地'。阜平县城南庄是晋察冀军区司令部所在地。",
          images: [],
          era: "抗日战争",
        },
      ]},
    ],
  },
  "湖南": {
    cities: [
      { name: "韶山", lat: 27.9257, lng: 112.5240, sites: [
        {
          name: "韶山毛泽东同志纪念馆", siteType: "纪念馆",
          lat: 27.9180, lng: 112.4880, rating: 4.9,
          ticketInfo: "免费，公众号预约", transportTips: "韶山南站乘旅游大巴至景区",
          description: "毛泽东同志故乡，红太阳升起的地方",
          historicalBg: "1893年12月26日，毛泽东诞生于韶山冲上屋场。这里是毛泽东同志青少年时期生活、学习和从事早期革命活动的地方。1925年，毛泽东在此创建了中国共产党最早的农村党支部之一。",
          images: [],
        },
      ]},
      { name: "芷江", lat: 27.4430, lng: 109.6850, sites: [
        {
          name: "芷江受降纪念坊（抗日战争胜利受降纪念馆）", siteType: "纪念馆",
          lat: 27.4400, lng: 109.6830, rating: 4.7,
          ticketInfo: "免费", transportTips: "怀化站乘大巴至芷江",
          description: "抗日战争胜利受降地",
          historicalBg: "1945年8月21日，侵华日军副总参谋长今井武夫在芷江向中国陆军总司令部投降。芷江受降标志着日本帝国主义侵华战争的彻底失败。纪念坊是中国唯一的抗日战争胜利受降纪念建筑。",
          images: [],
          era: "抗日战争",
        },
      ]},
    ],
  },
  "浙江": {
    cities: [
      { name: "嘉兴", lat: 30.7640, lng: 120.7560, sites: [
        {
          name: "南湖革命纪念馆", siteType: "纪念馆",
          lat: 30.7580, lng: 120.7640, rating: 4.7,
          ticketInfo: "免费", transportTips: "嘉兴站乘1路公交至南湖",
          description: "中共一大召开地（转移后），红船精神诞生地",
          historicalBg: "1921年8月初，因上海会场遭法租界巡捕袭扰，中共一大代表转移到嘉兴南湖，在一艘画舫上继续举行会议。大会通过了党的纲领和工作决议案，选举了中央领导机构，庄严宣告中国共产党成立。",
          images: [],
        },
      ]},
      { name: "宁波", lat: 29.8683, lng: 121.5440, sites: [
        {
          name: "四明山革命烈士陵园", siteType: "陵园",
          lat: 29.7420, lng: 121.0830, rating: 4.4,
          ticketInfo: "免费", transportTips: "宁波站乘车至余姚梁弄镇",
          description: "浙东抗日根据地纪念地",
          historicalBg: "四明山是浙东抗日根据地的中心区域。1941年至1945年，新四军浙东游击纵队在四明山区建立了稳固的抗日根据地，牵制和打击了大量日伪军。这里是浙东地区革命斗争的重要象征。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "浙东抗日根据地旧址", siteType: "旧址",
          lat: 29.7350, lng: 121.0780, rating: 4.5,
          ticketInfo: "免费", transportTips: "余姚乘车至梁弄镇横坎头村",
          description: "新四军浙东游击纵队司令部驻地",
          historicalBg: "1942年7月，中共浙东区委员会在四明山成立。此后，浙东抗日根据地发展成为全国十九块抗日根据地之一，面积达1万余平方公里，人口400余万，为抗战胜利做出了重要贡献。",
          images: [],
          era: "抗日战争",
        },
      ]},
    ],
  },
  "重庆": {
    cities: [
      { name: "重庆", lat: 29.4316, lng: 106.9123, sites: [
        {
          name: "红岩革命纪念馆", siteType: "纪念馆",
          lat: 29.5560, lng: 106.4950, rating: 4.8,
          ticketInfo: "免费", transportTips: "地铁1号线烈士墓站2B口出",
          description: "红岩精神的发源地",
          historicalBg: "抗日战争和解放战争时期，以周恩来为首的中共中央南方局在重庆红岩村办公。这里是中国共产党在国民党统治区的指挥中心，形成了伟大的红岩精神。纪念馆包括红岩村、曾家岩、桂园等革命遗址。",
          images: [],
        },
        {
          name: "歌乐山烈士陵园（渣滓洞、白公馆）", siteType: "陵园",
          lat: 29.5660, lng: 106.4370, rating: 4.7,
          ticketInfo: "免费", transportTips: "地铁1号线烈士墓站出换公交",
          description: "红岩英烈长眠之地",
          historicalBg: "渣滓洞和白公馆是国民党军统特务关押、迫害共产党人和革命志士的监狱。1949年11月27日，国民党在溃逃前夕制造了震惊中外的'一一·二七'大屠杀，江竹筠（江姐）等300多名革命者英勇就义。",
          images: [],
          era: "解放战争",
        },
        {
          name: "曾家岩50号周公馆", siteType: "旧址",
          lat: 29.5670, lng: 106.5480, rating: 4.5,
          ticketInfo: "免费", transportTips: "地铁2号线曾家岩站出",
          description: "周恩来在重庆的办公地",
          historicalBg: "1939年至1945年，周恩来以个人名义租下曾家岩50号，作为中共中央南方局在重庆的办事处。这里成为国共合作抗日的重要联络点，周恩来在此进行了大量统战工作，会见过众多民主人士和国际友人。",
          images: [],
          era: "抗日战争",
        },
      ]},
    ],
  },
  "甘肃": {
    cities: [
      { name: "会宁", lat: 35.6940, lng: 105.0530, sites: [
        {
          name: "红军会宁会师旧址", siteType: "旧址",
          lat: 35.6975, lng: 105.0560, rating: 4.6,
          ticketInfo: "免费", transportTips: "会宁站乘1路公交至会师旧址",
          description: "长征胜利结束的标志",
          historicalBg: "1936年10月，红一、红二、红四方面军在会宁胜利会师，标志着历时两年、行程二万五千里的红军长征胜利结束。大会师是中国革命转危为安的关键，为此后的全民族抗战保存了革命骨干力量。",
          images: [],
        },
      ]},
    ],
  },
  "辽宁": {
    cities: [
      { name: "沈阳", lat: 41.8057, lng: 123.4315, sites: [
        {
          name: "九一八历史博物馆", siteType: "博物馆",
          lat: 41.8310, lng: 123.4615, rating: 4.8,
          ticketInfo: "免费，凭身份证领票", transportTips: "地铁1号线黎明广场站换公交",
          description: "全面展示九一八事变和东北抗日斗争历史",
          historicalBg: "1931年9月18日，日本关东军悍然发动九一八事变，开始了对东北的武装侵略。中国人民由此开始了长达14年的抗日战争。博物馆以大量文物和史料记录了这段血与火的历史，警示后人勿忘国耻。",
          images: [],
          era: "抗日战争",
        },
      ]},
      { name: "抚顺", lat: 41.8808, lng: 123.9572, sites: [
        {
          name: "抚顺平顶山惨案纪念馆", siteType: "纪念馆",
          lat: 41.8520, lng: 123.9430, rating: 4.5,
          ticketInfo: "免费", transportTips: "抚顺站乘公交至平顶山",
          description: "日军暴行的铁证",
          historicalBg: "1932年9月16日，日军以'通匪'为名将平顶山村3000余名村民集体屠杀，烧毁房屋，制造了震惊中外的平顶山惨案。纪念馆建立在屠杀遗址之上，是揭露日本军国主义罪行的重要物证。",
          images: [],
          era: "抗日战争",
        },
      ]},
    ],
  },
  "黑龙江": {
    cities: [
      { name: "哈尔滨", lat: 45.8038, lng: 126.5350, sites: [
        {
          name: "侵华日军第七三一部队罪证陈列馆", siteType: "博物馆",
          lat: 45.6090, lng: 126.6330, rating: 4.7,
          ticketInfo: "免费", transportTips: "哈尔滨站乘343路公交至平房区",
          description: "揭露日军细菌战罪行的世界记忆遗产",
          historicalBg: "七三一部队是日本关东军在中国哈尔滨设立的细菌战研究机构，进行惨无人道的人体实验和细菌武器研发。陈列馆保存了大量遗址和实物，2015年被列入联合国教科文组织世界记忆遗产名录。",
          images: [],
          era: "抗日战争",
        },
        {
          name: "东北抗联博物馆", siteType: "博物馆",
          lat: 45.7600, lng: 126.6350, rating: 4.6,
          ticketInfo: "免费", transportTips: "哈尔滨市区乘公交至一曼街",
          description: "东北抗日联军的英勇斗争史",
          historicalBg: "东北抗日联军是中国共产党领导下的东北人民抗日武装，在极其艰苦的条件下坚持抗战14年。杨靖宇、赵尚志、赵一曼等英雄的事迹是中华民族不屈精神的象征。",
          images: [],
          era: "抗日战争",
        },
      ]},
    ],
  },
  "吉林": {
    cities: [
      { name: "通化", lat: 41.7282, lng: 125.9398, sites: [
        {
          name: "杨靖宇烈士陵园", siteType: "陵园",
          lat: 41.7350, lng: 125.9450, rating: 4.8,
          ticketInfo: "免费", transportTips: "通化站乘公交至靖宇陵园",
          description: "抗日民族英雄杨靖宇长眠之地",
          historicalBg: "杨靖宇是东北抗日联军的创建者和领导人之一。1940年2月23日，在吉林省濛江县（今靖宇县）壮烈牺牲，年仅35岁。日军解剖他的遗体，发现胃里只有草根和棉絮。",
          images: [],
          era: "抗日战争",
        },
      ]},
    ],
  },
  "山西": {
    cities: [
      { name: "长治", lat: 36.1953, lng: 113.1165, sites: [
        { name: "八路军太行纪念馆", siteType: "博物馆", lat: 36.8380, lng: 113.1120, rating: 4.7, ticketInfo: "免费", transportTips: "长治乘车至武乡县", description: "全面展示八路军抗战历史", historicalBg: "位于武乡县，八路军总部长期驻扎地，朱德彭德怀左权在此指挥华北抗战。", images: [], era: "抗日战争" },
      ]},
      { name: "大同", lat: 40.0768, lng: 113.3001, sites: [
        { name: "平型关大捷纪念馆", siteType: "纪念馆", lat: 39.3230, lng: 113.9600, rating: 4.6, ticketInfo: "免费", transportTips: "大同乘车至灵丘县", description: "八路军出师第一个大胜仗", historicalBg: "1937年9月25日八路军一一五师在平型关设伏歼灭日军1000余人。", images: [], era: "抗日战争" },
      ]},
      { name: "忻州", lat: 38.4167, lng: 112.7342, sites: [
        { name: "夜袭阳明堡战斗遗址纪念馆", siteType: "纪念馆", lat: 39.0100, lng: 112.8600, rating: 4.3, ticketInfo: "免费", transportTips: "忻州乘车至代县", description: "夜袭日军机场经典战例", historicalBg: "1937年10月陈锡联率部奇袭阳明堡机场炸毁敌机24架。", images: [], era: "抗日战争" },
      ]},
      { name: "吕梁", lat: 37.5196, lng: 111.1447, sites: [
        { name: "晋绥边区革命纪念馆", siteType: "纪念馆", lat: 38.4870, lng: 111.0750, rating: 4.4, ticketInfo: "免费", transportTips: "吕梁乘车至兴县", description: "华北四大抗日根据地之一", historicalBg: "贺龙关向应率一二〇师建立晋绥边区保卫陕甘宁边区。", images: [], era: "抗日战争" },
      ]},
    ],
  },
  "江苏": {
    cities: [
      { name: "南京", lat: 32.0603, lng: 118.7969, sites: [
        { name: "侵华日军南京大屠杀遇难同胞纪念馆", siteType: "纪念馆", lat: 32.0360, lng: 118.7420, rating: 4.9, ticketInfo: "免费", transportTips: "地铁2号线云锦路站2号口", description: "铭记惨痛历史珍爱世界和平", historicalBg: "1937年12月13日日军攻陷南京进行六周大屠杀，30多万军民惨遭杀害。", images: [], era: "抗日战争" },
      ]},
      { name: "镇江", lat: 32.1895, lng: 119.4250, sites: [
        { name: "茅山新四军纪念馆", siteType: "纪念馆", lat: 31.7950, lng: 119.3140, rating: 4.5, ticketInfo: "免费", transportTips: "句容站乘车至茅山", description: "新四军东进苏南指挥中心", historicalBg: "1938年陈毅粟裕率部挺进苏南创建茅山抗日根据地。", images: [], era: "抗日战争" },
      ]},
      { name: "苏州", lat: 31.2990, lng: 120.5853, sites: [
        { name: "沙家浜革命历史纪念馆", siteType: "纪念馆", lat: 31.5620, lng: 120.8370, rating: 4.4, ticketInfo: "门票60元", transportTips: "常熟站乘车至沙家浜", description: "京剧沙家浜故事原型地", historicalBg: "沙家浜位于常熟阳澄湖畔，新四军伤病员在此养伤。", images: [], era: "抗日战争" },
      ]},
    ],
  },
  "山东": {
    cities: [
      { name: "枣庄", lat: 34.8640, lng: 117.3238, sites: [
        { name: "台儿庄大战纪念馆", siteType: "纪念馆", lat: 34.5600, lng: 117.7420, rating: 4.8, ticketInfo: "免费", transportTips: "枣庄站乘车至台儿庄", description: "抗战正面战场最大胜利", historicalBg: "1938年李宗仁指挥取得台儿庄大捷歼灭日军1万余人。", images: [], era: "抗日战争" },
        { name: "铁道游击队纪念馆", siteType: "纪念馆", lat: 34.8000, lng: 117.3300, rating: 4.5, ticketInfo: "免费", transportTips: "枣庄站乘车至薛城区", description: "铁道游击队传奇", historicalBg: "活跃在鲁南津浦铁路沿线破袭日军交通线。", images: [], era: "抗日战争" },
      ]},
      { name: "临沂", lat: 35.1046, lng: 118.3564, sites: [
        { name: "沂蒙革命纪念馆", siteType: "纪念馆", lat: 35.0630, lng: 118.3450, rating: 4.6, ticketInfo: "免费", transportTips: "临沂乘车至蒙阴县", description: "沂蒙精神发源地", historicalBg: "沂蒙山区是山东抗日根据地中心。", images: [], era: "抗日战争" },
      ]},
    ],
  },
  "安徽": {
    cities: [
      { name: "宣城", lat: 30.9397, lng: 118.7520, sites: [
        { name: "新四军军部旧址纪念馆", siteType: "旧址", lat: 30.6900, lng: 118.3320, rating: 4.7, ticketInfo: "免费", transportTips: "泾县站乘车至云岭镇", description: "新四军军部驻地", historicalBg: "1938-1941年新四军军部驻此，1941年皖南事变发生地。", images: [], era: "抗日战争" },
      ]},
    ],
  },
  "广西": {
    cities: [
      { name: "南宁", lat: 22.8170, lng: 108.3665, sites: [
        { name: "昆仑关战役博物馆", siteType: "博物馆", lat: 23.1300, lng: 108.7500, rating: 4.5, ticketInfo: "门票30元", transportTips: "南宁乘车至宾阳县", description: "桂南会战关键战役", historicalBg: "1939年12月中国军队歼灭日军5000余人击毙旅团长中村正雄。", images: [], era: "抗日战争" },
      ]},
    ],
  },
  "云南": {
    cities: [
      { name: "保山", lat: 25.1120, lng: 99.1691, sites: [
        { name: "滇西抗战纪念馆（国殇墓园）", siteType: "纪念馆", lat: 25.0320, lng: 98.4880, rating: 4.8, ticketInfo: "免费", transportTips: "腾冲乘车至国殇墓园", description: "远征军滇西反攻纪念圣地", historicalBg: "1944年远征军强渡怒江全歼日军收复滇西。", images: [], era: "抗日战争" },
      ]},
    ],
  },
};
