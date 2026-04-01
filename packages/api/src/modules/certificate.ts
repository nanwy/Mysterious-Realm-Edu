import { buildQuery, createApiClient, type ApiClientOptions } from "../client.ts";

export function createCertificateModule(options: ApiClientOptions = {}) {
  const client = createApiClient(options);

  return {
    generateCertificate(
      certificateId: string | number,
      examId: string | number,
      courseId: string | number
    ) {
      return client.get(
        `/certificate/generateCertificate${buildQuery({
          certificateId,
          examId,
          courseId,
        })}`
      );
    },
    getUserCertificate(
      certificateId: string | number,
      examId: string | number,
      courseId: string | number
    ) {
      return client.get(
        `/certificate/getUserCertificate${buildQuery({
          certificateId,
          examId,
          courseId,
        })}`
      );
    },
    getUserCertificateList(payload: Record<string, unknown>) {
      return client.post("/certificate/getUserCertificateList", payload);
    },
  };
}

export function generateCertificate(
  certificateId: string | number,
  examId: string | number,
  courseId: string | number,
  options?: ApiClientOptions
) {
  return createCertificateModule(options).generateCertificate(
    certificateId,
    examId,
    courseId
  );
}

export function getUserCertificate(
  certificateId: string | number,
  examId: string | number,
  courseId: string | number,
  options?: ApiClientOptions
) {
  return createCertificateModule(options).getUserCertificate(
    certificateId,
    examId,
    courseId
  );
}

export function getUserCertificateList(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return createCertificateModule(options).getUserCertificateList(payload);
}
