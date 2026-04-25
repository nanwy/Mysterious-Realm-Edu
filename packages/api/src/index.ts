import { createApiClient, type ApiClientOptions } from "./client";
import { createCourseApi } from "./modules/course";
import { createExamApi } from "./modules/exam";

export const createApi = (options: ApiClientOptions = {}) => {
  const client = createApiClient(options);

  return {
    course: createCourseApi(client),
    exam: createExamApi(client),
  };
};

export const api = createApi();

export * from "./modules/banner";
export * from "./client";
export * from "./endpoint";
export * from "./errors";
export * from "./types";
export * from "./modules/auth";
export * from "./modules/course";
export * from "./modules/certificate";
export * from "./modules/practice";
export * from "./modules/exam";
export * from "./modules/invigilate";
export * from "./modules/message";
export * from "./modules/news";
export * from "./modules/order";
export * from "./modules/pay";
export * from "./modules/questionnaire";
export * from "./modules/search";
export * from "./modules/user";
