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
