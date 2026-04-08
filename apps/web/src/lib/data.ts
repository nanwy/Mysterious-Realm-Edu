import {
  getAnnouncementList,
  getBannerList,
  getCourseList,
  getExamList,
  getQuestionnaireList,
  getRepositoryList,
  listHotCourse,
  listHotNews,
  listLatestExam,
  listRecommendedNews,
  unwrapEnvelope,
} from "@workspace/api";

function toArray(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value as Array<Record<string, unknown>>;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.records)) return record.records as Array<Record<string, unknown>>;
    if (Array.isArray(record.list)) return record.list as Array<Record<string, unknown>>;
    if (Array.isArray(record.rows)) return record.rows as Array<Record<string, unknown>>;
    if (Array.isArray(record.data)) return record.data as Array<Record<string, unknown>>;
  }

  return [];
}

async function safeArrayRequest(
  factory: () => Promise<{ code: number; message: string; result?: unknown; data?: unknown }>
) {
  try {
    const response = await factory();
    return {
      items: toArray(unwrapEnvelope(response)),
      error: null as string | null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "接口请求失败";
    return {
      items: [] as Array<Record<string, unknown>>,
      error: message,
    };
  }
}

export async function getHomePageData() {
  // === 接口未通时临时使用的 Mock 数据 ===
  return {
    banners: [{ title: "欢迎来到全新学习中枢", imgUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2946&auto=format&fit=crop" }],
    bannerError: null,
    announcements: [
      { titile: "云学考 V2.0 系统升级完毕，新版已正式上线", time: "2026-04-08" },
      { titile: "关于2026年度春季继续教育排课的通知", time: "2026-04-07" },
    ],
    announcementError: null,
    hotCourses: [
      { id: "1", name: "高级网络安全攻防实战与 AWD 战术详解", learnerNumber: 1240, isFree: true, cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop" },
      { id: "2", name: "企业级 Web 渗透测试全栈核心指南", learnerNumber: 892, price: 299, cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2940&auto=format&fit=crop" },
      { id: "3", name: "云原生架构下的零信任边界安全实践", learnerNumber: 653, price: 199, cover: "https://images.unsplash.com/photo-1614064641938-3bcefc1fcbd3?q=80&w=2940&auto=format&fit=crop" },
      { id: "4", name: "逆向工程：移动端恶意代码动态分析", learnerNumber: 421, isFree: false, price: 399, cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop" },
    ],
    courseError: null,
    latestExams: [
      { id: "1", title: "安全运营（SecOps）初级攻防与审计结业考核", time: "今晚 14:00 - 16:00" },
      { id: "2", title: "红蓝对抗（Red Team）进阶实操演练测验", time: "明天 09:00 - 11:30" },
      { id: "3", title: "2026年春季 AWD 防御结业水平资格考试", time: "本周五 13:00 - 17:00" },
    ],
    examError: null,
    questionnaires: [
      { id: "1", title: "实战课程《Web 渗透测试》质量满意度调查（必填）" },
      { id: "2", title: "本周末线下 CTF 实训营参训意向及信息确认" },
    ],
    questionnaireError: null,
    recommendedNews: [
      { id: "1", title: "2026全球网络安全威胁全景洞察：AI 大模型驱动的新型智能攻击加剧", time: "2026-04-05", cover: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=2938&auto=format&fit=crop" },
      { id: "2", title: "从基础 CTF 比赛到企业级实战：如何快速建立起系统漏洞挖掘的思维体系", time: "2026-04-04", cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2634&auto=format&fit=crop" },
      { id: "3", title: "新一代轻量防护引擎的演进：大语言模型对传统正则匹配规则引擎的降维打击", time: "2026-04-03", cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2946&auto=format&fit=crop" },
      { id: "4", title: "零信任（Zero Trust）架构落地踩坑总结：企业内网微隔离权限边界到底怎么划？", time: "2026-04-01", cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2940&auto=format&fit=crop" },
    ],
    recommendedNewsError: null,
    hotNews: [
      { id: "1", title: "国家网安基地2026年度“极客杯”安全攻防技能大赛报名通道正式开启", time: "今天 10:00" },
      { id: "2", title: "【安全通报】关于近期平台部分实训靶机频繁遭受僵尸网络主动探测的预警通知", time: "昨天 16:30" },
      { id: "3", title: "【活动】周末红队技术沙龙：高级代码审计技巧与反序列化链挖掘深度分享", time: "2026-04-06" },
      { id: "4", title: "教务办公处：本学期“网络靶场实战冲刺”专项学分激励计划实施细则已经发布", time: "2026-04-05" },
      { id: "5", title: "漏洞通知：请各大合作单位尽快组织修复今天新近披露的高危框架组件漏洞", time: "2026-04-04" },
    ],
    hotNewsError: null,
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [banners, announcements, hotCourses, latestExams, questionnaires, recommendedNews, hotNews] = await Promise.all([
    safeArrayRequest(() => getBannerList()),
    safeArrayRequest(() => getAnnouncementList()),
    safeArrayRequest(() => listHotCourse(8)),
    safeArrayRequest(() => listLatestExam(6)),
    safeArrayRequest(() =>
      getQuestionnaireList({
        pageNo: 1,
        pageSize: 6,
        type: 1,
      })
    ),
    safeArrayRequest(() =>
      listRecommendedNews({
        pageNo: 1,
        pageSize: 4,
      })
    ),
    safeArrayRequest(() =>
      listHotNews({
        pageNo: 1,
        pageSize: 5,
      })
    ),
  ]);

  return {
    banners: banners.items,
    bannerError: banners.error,
    announcements: announcements.items,
    announcementError: announcements.error,
    hotCourses: hotCourses.items,
    courseError: hotCourses.error,
    latestExams: latestExams.items,
    examError: latestExams.error,
    questionnaires: questionnaires.items,
    questionnaireError: questionnaires.error,
    recommendedNews: recommendedNews.items,
    recommendedNewsError: recommendedNews.error,
    hotNews: hotNews.items,
    hotNewsError: hotNews.error,
  };
}

export async function getCoursePageData() {
  return safeArrayRequest(() =>
    getCourseList({
      pageNo: 1,
      pageSize: 8,
    })
  );
}

export async function getPracticePageData() {
  return safeArrayRequest(() =>
    getRepositoryList({
      pageNo: 1,
      pageSize: 8,
    })
  );
}

export async function getExamPageData() {
  return safeArrayRequest(() =>
    getExamList({
      pageNo: 1,
      pageSize: 8,
    })
  );
}
