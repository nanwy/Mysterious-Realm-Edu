import { createApiClient, type ApiHttpClient } from "../client";
import type {
  CourseCategoryListResponse,
  CourseDetailResponse,
  CourseEvaluationListRequest,
  CourseEvaluationListResponse,
  CourseGradeCountResponse,
  CourseIntegralResponse,
  CourseLatestStudyTaskResponse,
  CourseListRequest,
  CourseListResponse,
  CourseStudyDetailResponse,
  CourseStudyProcessListRequest,
  CourseStudyProcessResponse,
  CourseStudyTimeRequest,
  CourseTaskStudyTimeResponse,
} from "../types";

type Id = string | number;

export const createCourseApi = (client: ApiHttpClient) => ({
  listCourses: (payload: CourseListRequest) =>
    client.post<CourseListResponse>("/course/list", payload),

  getCourseDetail: ({ courseId }: { courseId: Id }) =>
    client.get<CourseDetailResponse>("/course/getCourseDetail", {
      query: { courseId },
    }),

  listCourseCategories: ({ parentId }: { parentId: Id }) =>
    client.get<CourseCategoryListResponse>("/course/category/loadTreeData", {
      query: { pid: parentId },
    }),

  listOptimalCourses: (payload: CourseListRequest) =>
    client.post<CourseListResponse>("/course/optimalSelectList", payload),

  listRecommendedCourses: (payload: CourseListRequest) =>
    client.post<CourseListResponse>("/course/recommendList", payload),

  getCourseStudyDetail: ({ courseId }: { courseId: Id }) =>
    client.get<CourseStudyDetailResponse>("/course/getCourseStudyDetail", {
      query: { id: courseId },
    }),

  calcStudyTime: (payload: CourseStudyTimeRequest) =>
    client.post<CourseIntegralResponse>("/course/calcStudyTime", payload),

  getCourseStudyProcess: ({ courseId }: { courseId: Id }) =>
    client.get<CourseStudyProcessResponse>("/course/getCourseStudyProcess", {
      query: { courseId },
    }),

  findUserCatalog: ({
    courseCatalogId,
    courseId,
  }: {
    courseCatalogId: Id;
    courseId: Id;
  }) =>
    client.get<CourseStudyProcessResponse>("/course/findUserCatalog", {
      query: { courseCatalogId, courseId },
    }),

  checkPreTaskComplete: ({ courseCatalogId }: { courseCatalogId: Id }) =>
    client.get<CourseStudyProcessResponse>("/course/checkPreTaskComplete", {
      query: { id: courseCatalogId },
    }),

  listStudyProcesses: (payload: CourseStudyProcessListRequest) =>
    client.post<CourseStudyProcessResponse>(
      "/course/courseStudyProcessList",
      payload
    ),

  listMyFootPrint: (payload: CourseStudyProcessListRequest) =>
    client.post<CourseListResponse>("/course/myFootPrint", payload),

  listMyCollect: (payload: CourseStudyProcessListRequest) =>
    client.post<CourseListResponse>("/course/myCollect", payload),

  getLatestStudyTask: ({ courseId }: { courseId: Id }) =>
    client.get<CourseLatestStudyTaskResponse>("/course/latestStudyTask", {
      query: { courseId },
    }),

  getTaskStudyTime: ({ courseCatalogId }: { courseCatalogId: Id }) =>
    client.get<CourseTaskStudyTimeResponse>("/course/getTaskStudyTime", {
      query: { courseCatalogId },
    }),

  listGoodsEvaluation: (payload: CourseEvaluationListRequest) =>
    client.post<CourseEvaluationListResponse>(
      "/course/goodsEvaluation",
      payload
    ),

  countGradeNumber: ({
    goodsId,
    goodsType,
  }: {
    goodsId: Id;
    goodsType: Id;
  }) =>
    client.get<CourseGradeCountResponse>("/course/countGradeNumber", {
      query: { goodsId, goodsType },
    }),

  updateCourseIntegral: ({
    courseId,
    integral,
  }: {
    courseId: Id;
    integral: Id;
  }) =>
    client.get<CourseIntegralResponse>("/course/updateIntegral", {
      query: { courseId, integral },
    }),

  calcLiveStudyTime: (payload: CourseStudyTimeRequest) =>
    client.post<CourseIntegralResponse>("/course/calcLiveStudyTime", payload),

  listHotCourses: ({ limit }: { limit: number }) =>
    client.get<CourseListResponse>("/index/listHotCourse", {
      query: { limit },
    }),
});

const defaultCourseApi = createCourseApi(createApiClient());

export function getCourseList(payload: CourseListRequest) {
  return defaultCourseApi.listCourses(payload);
}

export function getCourseDetail(courseId: string) {
  return defaultCourseApi.getCourseDetail({ courseId });
}

export function getCourseCategoryList(parentId: Id) {
  return defaultCourseApi.listCourseCategories({ parentId });
}

export function getOptimalCourseList(payload: CourseListRequest) {
  return defaultCourseApi.listOptimalCourses(payload);
}

export function getRecommendedCourseList(payload: CourseListRequest) {
  return defaultCourseApi.listRecommendedCourses(payload);
}

export function getCourseStudyDetail(courseId: Id) {
  return defaultCourseApi.getCourseStudyDetail({ courseId });
}

export function calcStudyTime(payload: CourseStudyTimeRequest) {
  return defaultCourseApi.calcStudyTime(payload);
}

export function getCourseStudyProcess(courseId: Id) {
  return defaultCourseApi.getCourseStudyProcess({ courseId });
}

export function findUserCatalog(courseCatalogId: Id, courseId: Id) {
  return defaultCourseApi.findUserCatalog({ courseCatalogId, courseId });
}

export function checkPreTaskComplete(courseCatalogId: Id) {
  return defaultCourseApi.checkPreTaskComplete({ courseCatalogId });
}

export function getStudyProcessList(payload: CourseStudyProcessListRequest) {
  return defaultCourseApi.listStudyProcesses(payload);
}

export function getMyFootPrint(payload: CourseStudyProcessListRequest) {
  return defaultCourseApi.listMyFootPrint(payload);
}

export function getMyCollect(payload: CourseStudyProcessListRequest) {
  return defaultCourseApi.listMyCollect(payload);
}

export function getLatestStudyTask(courseId: Id) {
  return defaultCourseApi.getLatestStudyTask({ courseId });
}

export function getTaskStudyTime(courseCatalogId: Id) {
  return defaultCourseApi.getTaskStudyTime({ courseCatalogId });
}

export function listGoodsEvaluation(payload: CourseEvaluationListRequest) {
  return defaultCourseApi.listGoodsEvaluation(payload);
}

export function countGradeNumber(goodsId: Id, goodsType: Id) {
  return defaultCourseApi.countGradeNumber({ goodsId, goodsType });
}

export function updateCourseIntegral(courseId: Id, integral: Id) {
  return defaultCourseApi.updateCourseIntegral({ courseId, integral });
}

export function calcLiveStudyTime(payload: CourseStudyTimeRequest) {
  return defaultCourseApi.calcLiveStudyTime(payload);
}

export function listHotCourse(limit: number) {
  return defaultCourseApi.listHotCourses({ limit });
}
