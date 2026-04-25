import { createApiClient, type ApiClientOptions } from "./client";
import { createAuthApi } from "./modules/auth";
import { createBannerApi } from "./modules/banner";
import { createCertificateApi } from "./modules/certificate";
import { createCourseApi } from "./modules/course";
import { createExamApi } from "./modules/exam";
import { createInvigilateApi } from "./modules/invigilate";
import { createMessageApi } from "./modules/message";
import { createNewsApi } from "./modules/news";
import { createOrderApi } from "./modules/order";
import { createPayApi } from "./modules/pay";
import { createPracticeApi } from "./modules/practice";
import { createQuestionnaireApi } from "./modules/questionnaire";
import { createSearchApi } from "./modules/search";
import { createUserApi } from "./modules/user";

export const createApi = (options: ApiClientOptions = {}) => {
  const client = createApiClient(options);

  return {
    auth: createAuthApi(client),
    banner: createBannerApi(client),
    certificate: createCertificateApi(client),
    course: createCourseApi(client),
    exam: createExamApi(client),
    invigilate: createInvigilateApi(client),
    message: createMessageApi(client),
    news: createNewsApi(client),
    order: createOrderApi(client),
    pay: createPayApi(client),
    practice: createPracticeApi(client),
    questionnaire: createQuestionnaireApi(client),
    search: createSearchApi(client),
    user: createUserApi(client),
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
