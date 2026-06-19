const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat, PageBreak,
} = require("docx");

// Colors
const RED = "8B0000";
const GOLD = "D4A574";
const LIGHT_RED = "F5E6E6";
const LIGHT_GRAY = "F5F5F5";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: border, bottom: border, left: border, right: border };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, font: "SimHei", color: RED })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, font: "SimHei", color: RED })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    indent: opts.indent ? { firstLine: 480 } : undefined,
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    children: [
      new TextRun({
        text,
        size: 24,
        font: "SimSun",
        ...opts,
      }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80, line: 340 },
    children: [new TextRun({ text, size: 24, font: "SimSun" })],
  });
}

function infoTable(rows) {
  const col1w = 2200, col2w = 7160;
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [col1w, col2w],
    rows: rows.map(([label, value], i) =>
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: col1w, type: WidthType.DXA },
            shading: { fill: LIGHT_RED, type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22, font: "SimHei" })] })],
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: col2w, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: value, size: 22, font: "SimSun" })] })],
          }),
        ],
      })
    ),
  });
}

function dataTable(headers, rows) {
  const n = headers.length;
  const colW = Math.floor(9360 / n);
  const colWidths = Array(n).fill(colW);
  // Adjust last column
  colWidths[n - 1] = 9360 - colW * (n - 1);

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      // Header row
      new TableRow({
        children: headers.map((h, i) =>
          new TableCell({
            borders: cellBorders,
            width: { size: colWidths[i], type: WidthType.DXA },
            shading: { fill: RED, type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: h, bold: true, size: 20, font: "SimHei", color: WHITE })],
            })],
          })
        ),
      }),
      // Data rows
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((cell, ci) =>
            new TableCell({
              borders: cellBorders,
              width: { size: colWidths[ci], type: WidthType.DXA },
              shading: ri % 2 === 0 ? { fill: WHITE, type: ShadingType.CLEAR } : { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
              margins: { top: 50, bottom: 50, left: 100, right: 100 },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: cell, size: 20, font: "SimSun" })],
              })],
            })
          ),
        })
      ),
    ],
  });
}

// ====== BUILD DOCUMENT ======

const doc = new Document({
  styles: {
    default: { document: { run: { font: "SimSun", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "SimHei", color: RED },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "SimHei", color: RED },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    }],
  },
  sections: [
    // ====== COVER PAGE ======
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({ spacing: { before: 2400 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "中国国际大学生创新创业大赛", size: 36, bold: true, font: "SimHei", color: RED })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "青年红色筑梦之旅赛道", size: 28, font: "SimHei", color: RED })],
        }),
        new Paragraph({ spacing: { before: 600 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "项 目 申 报 书", size: 44, bold: true, font: "SimHei", color: RED })],
        }),
        new Paragraph({ spacing: { before: 400 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "红  途", size: 52, bold: true, font: "SimHei", color: RED })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "AI驱动的革命旧址数字研学平台", size: 28, font: "SimHei", color: "333333" })],
        }),
        new Paragraph({ spacing: { before: 600 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: "所属领域：教育", size: 24, font: "SimSun", color: "666666" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: "项目类型：信息技术与文化教育融合", size: 24, font: "SimSun", color: "666666" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "2026年6月", size: 24, font: "SimSun", color: "666666" })],
        }),
      ],
    },

    // ====== MAIN CONTENT ======
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RED, space: 4 } },
            children: [new TextRun({ text: "红途——AI驱动的革命旧址数字研学平台", size: 18, font: "SimHei", color: RED })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "第 ", size: 18, font: "SimSun" }), new TextRun({ children: [PageNumber.CURRENT], size: 18 }), new TextRun({ text: " 页", size: 18, font: "SimSun" })],
          })],
        }),
      },
      children: [
        // Table of Contents
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 300 },
          children: [new TextRun({ text: "目  录", bold: true, size: 32, font: "SimHei", color: RED })],
        }),
        para("一、项目概述", { bold: true }),
        para("二、项目背景与市场分析", { bold: true }),
        para("三、产品与服务", { bold: true }),
        para("四、技术方案", { bold: true }),
        para("五、商业模式与盈利设计", { bold: true }),
        para("六、团队介绍", { bold: true }),
        para("七、发展规划", { bold: true }),
        para("八、社会价值与教育意义", { bold: true }),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== 一、项目概述 =====
        heading1("一、项目概述"),

        heading2("1.1 基本信息"),
        infoTable([
          ["项目名称", "红途——AI驱动的革命旧址数字研学平台"],
          ["参赛赛道", "青年红色筑梦之旅"],
          ["所属领域", "教育"],
          ["项目类型", "信息技术与文化教育融合"],
          ["技术架构", "Next.js 16 + React 19 + Three.js + AI大模型"],
        ]),

        heading2("1.2 项目简介"),
        para("\"红途\"是一款面向大学生和青年群体的革命旧址数字研学平台。平台以交互式中国地图为入口，整合全国11个省份、23个核心革命旧址和博物馆的详细数据，通过AI红色讲解员、时间线叙事、研学路线自动生成三大核心功能，打造\"可交互的革命历史教科书\"。项目将3D可视化、AI大语言模型与红色教育深度融合，旨在解决当前红色研学中信息分散、呈现单一、规划低效三大痛点。", { indent: true }),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 二、项目背景 =====
        heading1("二、项目背景与市场分析"),

        heading2("2.1 政策背景"),
        para("党的二十大报告明确提出\"弘扬以伟大建党精神为源头的中国共产党人精神谱系，用好红色资源\"。2024年《爱国主义教育法》正式实施，将红色研学纳入大中小学必修课程体系。教育部等11部门联合推进中小学生研学旅行，红色研学市场规模持续扩大。", { indent: true }),

        heading2("2.2 市场痛点"),
        para("当前红色研学市场存在三大核心痛点：", { indent: true }),
        bullet("信息碎片化：革命旧址和博物馆的信息分散在各官网、公众号、旅游平台，缺乏一站式聚合平台，用户需要耗费大量时间搜集和比对信息。"),
        bullet("内容呈现单一：大多数红色景点以图文展板为主，缺乏互动性和沉浸感，难以吸引习惯于短视频和交互体验的青年群体。"),
        bullet("路线规划低效：红色研学路线依赖人工规划，难以根据用户需求（天数、地区、兴趣偏好）自动生成个性化方案，且缺乏专业的历史背景串联。"),

        heading2("2.3 市场规模"),
        para("据《中国红色旅游发展报告》数据，2025年全国红色旅游接待人数超过15亿人次，红色旅游综合收入突破8000亿元。其中，研学旅行市场规模超过1500亿元，红色研学占比约20%，即300亿元。随着《爱国主义教育法》的深入实施，预计到2028年红色研学市场规模将突破600亿元。", { indent: true }),

        heading2("2.4 竞品分析"),
        dataTable(
          ["竞品", "类型", "AI能力", "3D地图", "路线生成", "缺陷"],
          [
            ["学习强国APP", "综合平台", "无", "无", "无", "非研学专精"],
            ["红色旅游网", "资讯网站", "无", "无", "无", "信息陈旧无交互"],
            ["美团/携程", "OTA平台", "弱", "无", "基础", "无红色专题"],
            ["红途（本项目）", "数字研学", "强", "有", "AI自动", "数据需扩充"],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 三、产品与服务 =====
        heading1("三、产品与服务"),

        heading2("3.1 核心功能"),
        para("\"红途\"平台围绕\"探索-学习-规划-分享\"四大环节，提供以下核心功能：", { indent: true }),

        para("（1）交互式地图探索", { bold: true }),
        para("以中国地图为入口，11个省份已收录的革命旧址以红色标记标注。用户点击标记即可查看该省份所有革命旧址列表，选择后进入详细页面，包含：旧址历史背景（800-1500字深度介绍）、关联历史事件与人物、实地参观信息（门票、交通、开放时间）、博物馆展品图片。", { indent: true }),

        para("（2）AI红色讲解员", { bold: true }),
        para("基于DeepSeek大语言模型，训练专用的红色研学Prompt。支持三种交互模式：旧址深度讲解（输入旧址名称，AI自动生成包含历史背景、重要事件、历史意义、参观建议的完整讲解）、历史知识问答（回答\"遵义会议为什么是转折点？\"等深度问题）、个性化路线推荐（输入目的地和天数，AI自动规划研学日程）。支持语音播报功能。", { indent: true }),

        para("（3）时间线浏览", { bold: true }),
        para("按建党初期（1919-1927）、土地革命（1927-1937）、抗日战争（1937-1945）、解放战争（1945-1949）四个历史时期，以纵向时间轴串联全国23个核心革命旧址。每个时期展示该时期的革命旧址、重大事件和代表人物，帮助用户建立完整的历史脉络认知。", { indent: true }),

        para("（4）AI研学路线生成", { bold: true }),
        para("用户输入目的地城市、研学天数、偏好风格（深度研学/主题路线/精华速览），AI自动生成完整的研学路线。每条路线包含：每日详细行程（时间点、参观点、停留时长）、参观建议与学习要点、交通指引（公交/地铁/步行具体方案）、门票信息与预约方式、预算明细（住宿/餐饮/交通/门票分项估算），支持导出PDF和分享。", { indent: true }),

        para("（5）收藏与分享", { bold: true }),
        para("用户可收藏感兴趣的旧址和研学路线，支持导出PDF、复制文本、分享链接。底部导航栏（首页/探索/AI讲解员/研学广场/我的）简洁直观，学习成本低。", { indent: true }),

        heading2("3.2 产品特色"),
        bullet("三端合一：Web端（浏览器直接访问）+ 移动端适配（响应式设计）+ 未来计划推出微信小程序"),
        bullet("AI驱动：不同于传统资讯网站，平台以AI为核心引擎，实现智能化个性化服务"),
        bullet("交互沉浸：交互式地图、时间线叙事、AI对话，让\"学历史\"变成\"体验历史\""),
        bullet("开放平台：数据开源，支持第三方贡献旧址信息和纠错"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 四、技术方案 =====
        heading1("四、技术方案"),

        heading2("4.1 技术架构"),
        infoTable([
          ["前端框架", "Next.js 16 (App Router) + React 19 + TypeScript"],
          ["UI框架", "Tailwind CSS 4 + 自定义红色主题"],
          ["地图引擎", "Leaflet + react-leaflet（2D）+ Three.js（3D预留）"],
          ["AI引擎", "DeepSeek Chat API（支持流式响应SSE）"],
          ["数据库", "SQLite（本地开发）/ PostgreSQL（生产环境）"],
          ["ORM", "Prisma 7（类型安全的数据访问层）"],
          ["认证系统", "NextAuth.js 5（手机/邮箱/微信三种登录）"],
          ["部署", "Vercel（前端）+ 自建服务器（AI代理）"],
        ]),

        heading2("4.2 系统架构图"),
        para("平台采用前后端分离的Serverless架构：", { indent: true }),
        bullet("表现层：React组件 → Next.js App Router → 服务端渲染（SSR）+ 客户端渲染（CSR）混合模式"),
        bullet("API层：Next.js API Routes → Prisma ORM → 数据库 / AI API"),
        bullet("数据层：Prisma Schema定义数据模型 → SQLite本地/PostgreSQL云端"),
        bullet("AI层：API Routes接收请求 → 格式化Prompt → 调用DeepSeek API → SSE流式响应 → 解析JSON结果 → 结构化存储"),

        heading2("4.3 核心数据模型"),
        para("平台设计了完整的革命旧址数据模型，包含以下核心实体：Era（革命时期）、Province（省份）、City（城市）、Site（旧址/博物馆，含历史背景、参观信息等20+字段）、Event（历史事件）、Person（历史人物）、Journey（研学路线，含每日行程安排）、User（用户系统）。数据模型支持旧址与事件、人物之间的多对多关联，实现历史叙事的深度串联。", { indent: true }),

        heading2("4.4 技术创新点"),
        bullet("AI Prompt工程：自研红色研学专用Prompt，确保AI输出的历史准确性和教育价值"),
        bullet("SSE流式响应：采用Server-Sent Events实现AI生成内容的实时流式展示，提升用户体验"),
        bullet("结构化解析：AI生成的JSON格式路线自动解析为数据库中的结构化Day/Stop记录"),
        bullet("渐进式渲染：地图组件采用动态导入+SSR禁用策略，确保Leaflet在Next.js环境中的兼容性"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 五、商业模式 =====
        heading1("五、商业模式与盈利设计"),

        heading2("5.1 目标用户"),
        bullet("C端用户：在校大学生（红色研学课程需求）、青年旅行爱好者（红色旅游打卡）、考研/考公群体（党史学习需求）"),
        bullet("B端客户：高校团委/思政部门（学生红色研学统一组织）、中小学（研学旅行课程合作）、企事业单位（党建活动/团建策划）、文旅局/红色景区（数字化升级合作）"),

        heading2("5.2 盈利模式"),
        dataTable(
          ["盈利方式", "目标客户", "定价策略", "预期占比"],
          [
            ["高级会员订阅", "C端用户", "29元/月，解锁无限AI生成", "30%"],
            ["机构B端SaaS", "高校/中小学", "5000-20000元/年", "35%"],
            ["景区数字化合作", "文旅局/景区", "按项目定制报价", "20%"],
            ["研学团定制服务", "旅行社/研学机构", "按路线按人次收费", "15%"],
          ]
        ),

        heading2("5.3 推广策略"),
        bullet("高校合作：通过团委、学生会渠道，与高校思政课程结合，提供免费试用账号"),
        bullet("社交媒体：在抖音、B站、小红书发布\"AI讲解革命旧址\"的短视频内容引流"),
        bullet("赛事曝光：参加创新创业大赛、挑战杯等赛事获取媒体关注"),
        bullet("SEO+口碑：优化搜索引擎排名，鼓励用户分享研学路线形成社交裂变"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 六、团队介绍 =====
        heading1("六、团队介绍"),

        para("项目团队由来自飞行器制造工程、计算机科学等专业的本科生组成，具备跨学科协作能力：", { indent: true }),

        infoTable([
          ["项目负责人", "张鋆宇，飞行器制造工程专业，负责产品设计、全栈开发、项目统筹。联系方式：13940605898"],
          ["指导教师", "张春红，提供红色教育领域专业指导与项目方向把控"],
        ]),

        heading2("6.1 团队优势"),
        bullet("学科交叉：团队成员覆盖工程技术、人文历史等学科，兼顾技术实现与内容质量"),
        bullet("技术积累：项目负责人具备全栈开发能力，平台核心功能已开发完成并开源"),
        bullet("地域优势：学校位于辽宁省，周边有丰富的红色资源（九一八纪念馆、辽沈战役纪念馆等）"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 七、发展规划 =====
        heading1("七、发展规划"),

        heading2("7.1 阶段规划"),
        dataTable(
          ["阶段", "时间", "核心任务", "里程碑"],
          [
            ["一期（MVP）", "2026.06-2026.08", "核心功能完善，数据扩充至50+旧址", "参赛并获取种子用户"],
            ["二期（增长）", "2026.09-2026.12", "上线微信小程序，高校合作落地", "用户突破5000人"],
            ["三期（扩展）", "2027.01-2027.06", "3D旧址复原，VR虚拟展厅", "B端合作10+机构"],
            ["四期（规模）", "2027.07-2027.12", "全国100+旧址覆盖，AI模型自训练", "实现盈亏平衡"],
          ]
        ),

        heading2("7.2 关键风险与应对"),
        infoTable([
          ["内容准确性", "组建历史学顾问团队，建立内容\"三审三校\"机制"],
          ["AI幻觉问题", "限定AI回答的知识范围，对不确定内容标注\"待核实\""],
          ["用户增长缓慢", "以高校合作为突破口，先2B再2C，降低获客成本"],
          ["竞品模仿", "持续迭代AI能力，积累专有数据形成壁垒"],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 八、社会价值 =====
        heading1("八、社会价值与教育意义"),

        heading2("8.1 文化传承价值"),
        para("\"红途\"平台通过数字化手段将分散的革命旧址和博物馆聚合呈现，降低了青年群体接触红色文化的门槛。平台不是简单的信息搬运，而是通过AI讲解、时间线叙事、路线串联等方式，将孤立的历史知识转化为有逻辑、有脉络、有温度的历史故事，让红色文化\"活\"起来。", { indent: true }),

        heading2("8.2 教育创新价值"),
        para("平台改变了传统红色教育\"说教式\"\"灌输式\"的模式，以\"探索式学习\"\"对话式学习\"\"沉浸式学习\"为核心设计理念。学生不再是被动接受者，而是通过地图探索、AI问答、路线规划等主动参与行为，在\"做中学\"的过程中完成对革命历史的认知建构，符合现代教育理念。", { indent: true }),

        heading2("8.3 乡村振兴价值"),
        para("大量革命旧址位于经济欠发达的革命老区。平台通过红色研学路线规划，将分散的革命旧址串联为有吸引力的研学产品，引导青年群体走进革命老区，带动当地的交通、住宿、餐饮、文创等消费，实现\"红色教育+乡村旅游+老区振兴\"的协同发展。", { indent: true }),

        heading2("8.4 社会责任"),
        bullet("数据开源：平台核心数据向社会免费开放，降低红色教育资源获取门槛"),
        bullet("内容共建：欢迎历史学者、博物馆、景区参与数据和内容的贡献与审核"),
        bullet("公益服务：为经济困难的学生群体提供免费的高级会员服务"),
        bullet("就业带动：项目发展将创造技术开发、内容运营、市场推广等就业岗位"),

        new Paragraph({ spacing: { before: 600 }, children: [] }),
        para("", { center: true }),
        para("【完】", { center: true, color: RED }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buf => {
  const out = "C:/Users/张鋆宇/Desktop/红途_项目申报书_v2.docx";
  fs.writeFileSync(out, buf);
  console.log("Done: " + out);
});
