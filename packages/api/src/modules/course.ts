import { createApiClient } from "../client";

const client = createApiClient();

export function getCourseList(payload: Record<string, unknown>) {
  return client.post("/course/list", payload);
}

export function getCourseDetail(courseId: string) {
  return client.get(`/course/getCourseDetail?courseId=${courseId}`);
}

export function getCourseCategoryList(parentId: string | number) {
  return client.get(`/course/category/loadTreeData?pid=${parentId}`);
}

export function getOptimalCourseList(payload: Record<string, unknown>) {
  return client.post("/course/optimalSelectList", payload);
}

export function getRecommendedCourseList(payload: Record<string, unknown>) {
  return client.post("/course/recommendList", payload);
}

export function getCourseStudyDetail(courseId: string | number) {
  return client.get(`/course/getCourseStudyDetail?id=${courseId}`);
}

export function calcStudyTime(payload: Record<string, unknown>) {
  return client.post("/course/calcStudyTime", payload);
}

export function getCourseStudyProcess(courseId: string | number) {
  return client.get(`/course/getCourseStudyProcess?courseId=${courseId}`);
}

export function findUserCatalog(courseCatalogId: string | number, courseId: string | number) {
  return client.get(
    `/course/findUserCatalog?courseCatalogId=${courseCatalogId}&courseId=${courseId}`
  );
}

export function checkPreTaskComplete(courseCatalogId: string | number) {
  return client.get(`/course/checkPreTaskComplete?id=${courseCatalogId}`);
}

export function getStudyProcessList(payload: Record<string, unknown>) {
  return client.post("/course/courseStudyProcessList", payload);
}

export function getMyFootPrint(payload: Record<string, unknown>) {
  return client.post("/course/myFootPrint", payload);
}

export function getMyCollect(payload: Record<string, unknown>) {
  return client.post("/course/myCollect", payload);
}

export function getLatestStudyTask(courseId: string | number) {
  return client.get(`/course/latestStudyTask?courseId=${courseId}`);
}

export function getTaskStudyTime(courseCatalogId: string | number) {
  return client.get(`/course/getTaskStudyTime?courseCatalogId=${courseCatalogId}`);
}

export function listGoodsEvaluation(payload: Record<string, unknown>) {
  return client.post("/course/goodsEvaluation", payload);
}

export function countGradeNumber(goodsId: string | number, goodsType: string | number) {
  return client.get(`/course/countGradeNumber?goodsId=${goodsId}&goodsType=${goodsType}`);
}

export function updateCourseIntegral(courseId: string | number, integral: string | number) {
  return client.get(`/course/updateIntegral?courseId=${courseId}&integral=${integral}`);
}

export function calcLiveStudyTime(payload: Record<string, unknown>) {
  return client.post("/course/calcLiveStudyTime", payload);
}

export function listHotCourse(limit: number) {
  return client.get(`/index/listHotCourse?limit=${limit}`);
}
