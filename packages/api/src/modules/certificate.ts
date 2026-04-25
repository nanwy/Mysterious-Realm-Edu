import {
  createApiClient,
  type ApiClientOptions,
  type ApiHttpClient,
} from "../client";

type Id = string | number;

export const createCertificateApi = (client: ApiHttpClient) => ({
  generateCertificate: ({
    certificateId,
    examId,
    courseId,
  }: {
    certificateId: Id;
    examId: Id;
    courseId: Id;
  }) =>
    client.get("/certificate/generateCertificate", {
      query: { certificateId, examId, courseId },
    }),

  getUserCertificate: ({
    certificateId,
    examId,
    courseId,
  }: {
    certificateId: Id;
    examId: Id;
    courseId: Id;
  }) =>
    client.get("/certificate/getUserCertificate", {
      query: { certificateId, examId, courseId },
    }),

  listUserCertificates: (payload: Record<string, unknown>) =>
    client.post("/certificate/getUserCertificateList", payload),
});

const defaultCertificateApi = createCertificateApi(createApiClient());

const getCertificateApi = (options?: ApiClientOptions) =>
  options
    ? createCertificateApi(createApiClient(options))
    : defaultCertificateApi;

export function createCertificateModule(options: ApiClientOptions = {}) {
  const api = createCertificateApi(createApiClient(options));

  return {
    generateCertificate(
      certificateId: string | number,
      examId: string | number,
      courseId: string | number
    ) {
      return api.generateCertificate({ certificateId, examId, courseId });
    },
    getUserCertificate(
      certificateId: string | number,
      examId: string | number,
      courseId: string | number
    ) {
      return api.getUserCertificate({ certificateId, examId, courseId });
    },
    getUserCertificateList(payload: Record<string, unknown>) {
      return api.listUserCertificates(payload);
    },
  };
}

export function generateCertificate(
  certificateId: string | number,
  examId: string | number,
  courseId: string | number,
  options?: ApiClientOptions
) {
  return getCertificateApi(options).generateCertificate({
    certificateId,
    examId,
    courseId,
  });
}

export function getUserCertificate(
  certificateId: string | number,
  examId: string | number,
  courseId: string | number,
  options?: ApiClientOptions
) {
  return getCertificateApi(options).getUserCertificate({
    certificateId,
    examId,
    courseId,
  });
}

export function getUserCertificateList(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return getCertificateApi(options).listUserCertificates(payload);
}
