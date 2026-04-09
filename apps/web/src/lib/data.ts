import { HomePayload } from "@/components/home/home-types";
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
    if (Array.isArray(record.records))
      return record.records as Array<Record<string, unknown>>;
    if (Array.isArray(record.list))
      return record.list as Array<Record<string, unknown>>;
    if (Array.isArray(record.rows))
      return record.rows as Array<Record<string, unknown>>;
    if (Array.isArray(record.data))
      return record.data as Array<Record<string, unknown>>;
  }

  return [];
}

async function safeArrayRequest(
  factory: () => Promise<{
    code: number;
    message: string;
    result?: unknown;
    data?: unknown;
  }>
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

export async function getHomePageData(): Promise<HomePayload> {
  // === 接口未通时临时使用的 Mock 数据 (与 HomePayload 定义严格对齐) ===
  // 这里返回的 Key 必须与 HomePayload 一一对应
  const mockData: HomePayload = {
    banners: [
      {
        id: "1",
        title: "欢迎来到全新学习中枢",
        imgUrl:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2946&auto=format&fit=crop",
        link: "/courses",
      },
    ],
    bannerError: null,
    announcements: [
      {
        id: "1",
        title: "云学考 V2.0 系统升级完毕，新版已正式上线",
        time: "2026-04-08",
      },
      {
        id: "2",
        title: "关于2026年度春季继续教育排课的通知",
        time: "2026-04-07",
      },
    ],
    announcementError: null,
    hotCourses: [
      {
        id: "1",
        name: "高级网络安全攻防实战与 AWD 战术详解",
        learnerNumber: 1350,
        isFree: true,
        cover:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop",
      },
      {
        id: "2",
        name: "企业级 Web 渗透测试全栈核心指南",
        learnerNumber: 942,
        price: 299,
        cover:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2940&auto=format&fit=crop",
      },
      {
        id: "3",
        name: "云原生架构下的零信任边界安全实践",
        learnerNumber: 653,
        price: 199,
        cover:
          "https://images.unsplash.com/photo-1614064641938-3bcefc1fcbd3?q=80&w=2940&auto=format&fit=crop",
      },
      {
        id: "4",
        name: "移动端恶意代码动态分析实战",
        learnerNumber: 421,
        price: 399,
        cover:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop",
      },
    ],
    courseError: null,
    latestExams: [
      {
        id: "1",
        title: "安全运营（SecOps）初级攻防考核",
        time: "14:00 - 16:00",
        state: 1,
      },
      {
        id: "2",
        title: "红蓝对抗（Red Team）进阶演练测验",
        time: "明天 09:00",
        state: 0,
      },
    ],
    examError: null,
    questionnaires: [
      { id: "1", title: "实战课程《Web 渗透测试》质量满意度调查" },
    ],
    questionnaireError: null,
    recommendedNews: [
      {
        id: "1",
        title: "2026网络安全威胁全景洞察：AI 攻击加剧",
        time: "2026-04-05",
        cover:
          "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=2938&auto=format&fit=crop",
      },
      {
        id: "2",
        title: "从基础 CTF 比赛到企业级实战思维体系",
        time: "2026-04-04",
        cover:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2634&auto=format&fit=crop",
      },
    ],
    recommendedNewsError: null,
    hotNews: [
      {
        id: "1",
        title: "国家网安基地2026年度“极客杯”大赛报名开启",
        time: "10:00",
      },
    ],
    hotNewsError: null,
  };

  // 如果需要使用 Mock，直接取消下一行的注释
  return mockData;

  const [
    banners,
    announcements,
    hotCourses,
    latestExams,
    questionnaires,
    recommendedNews,
    hotNews,
  ] = await Promise.all([
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
