import { api, unwrapEnvelope } from "@workspace/api";
import { cache } from "react";

const HOME_MOCK_DATA = {
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
      titile: "云学考 V2.0 系统升级完毕，新版已正式上线",
      createTime: "2026-04-08",
    },
    {
      id: "2",
      titile: "关于2026年度春季继续教育排课的通知",
      createTime: "2026-04-07",
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
      startTime: "14:00",
      state: 2,
    },
    {
      id: "2",
      title: "红蓝对抗（Red Team）进阶演练测验",
      startTime: "明天 09:00",
      state: 0,
    },
  ],
  examError: null,
  questionnaires: [{ id: "1", name: "实战课程《Web 渗透测试》质量满意度调查" }],
  questionnaireError: null,
  recommendedNews: [
    {
      id: "1",
      title: "2026网络安全威胁全景洞察：AI 攻击加剧",
      publishTime: "2026-04-05",
      coverImg:
        "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=2938&auto=format&fit=crop",
    },
    {
      id: "2",
      title: "从基础 CTF 比赛到企业级实战思维体系",
      publishTime: "2026-04-04",
      coverImg:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2634&auto=format&fit=crop",
    },
  ],
  recommendedNewsError: null,
  hotNews: [
    {
      id: "1",
      title: "国家网安基地2026年度“极客杯”大赛报名开启",
      publishTime: "10:00",
    },
  ],
  hotNewsError: null,
};

function shouldUseMock() {
  return process.env.HOME_PAGE_USE_MOCK === "1";
}

export const getHomePageData = cache(async () => {
  if (shouldUseMock()) return HOME_MOCK_DATA;

  const [
    banners,
    announcements,
    hotCourses,
    latestExams,
    questionnaires,
    recommendedNews,
    hotNews,
  ] = await Promise.all([
    api.banner
      .listBanners()
      .then((response) => unwrapEnvelope(response) ?? [])
      .catch(() => []),
    api.message
      .listAnnouncements()
      .then((response) => unwrapEnvelope(response) ?? [])
      .catch(() => []),
    api.course
      .listHotCourses({ limit: 8 })
      .then((response) => unwrapEnvelope(response) ?? [])
      .catch(() => []),
    api.exam
      .listLatestExam({ limit: 6 })
      .then((response) => unwrapEnvelope(response) ?? [])
      .catch(() => []),
    api.questionnaire
      .listQuestionnaires({
        pageNo: 1,
        pageSize: 6,
        type: 1,
      })
      .then((response) => unwrapEnvelope(response)?.records ?? [])
      .catch(() => []),
    api.news
      .listRecommendedNews({
        pageNo: 1,
        pageSize: 4,
      })
      .then((response) => unwrapEnvelope(response)?.records ?? [])
      .catch(() => []),
    api.news
      .listHotNews({
        pageNo: 1,
        pageSize: 5,
      })
      .then((response) => unwrapEnvelope(response)?.records ?? [])
      .catch(() => []),
  ]);

  return {
    banners,
    bannerError: null,
    announcements,
    announcementError: null,
    hotCourses,
    courseError: null,
    latestExams,
    examError: null,
    questionnaires,
    questionnaireError: null,
    recommendedNews,
    recommendedNewsError: null,
    hotNews,
    hotNewsError: null,
  };
});
