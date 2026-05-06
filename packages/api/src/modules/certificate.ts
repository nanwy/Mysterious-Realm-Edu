import { type ApiHttpClient } from "../client";
import type {
  CertificateGenerateRequest,
  CertificateGenerateResponse,
  CertificateListRequest,
  UserCertificateListResponse,
  UserCertificateResponse,
} from "../types";

export const createCertificateApi = (client: ApiHttpClient) => ({
  generateCertificate: ({
    certificateId,
    examId,
    courseId,
  }: CertificateGenerateRequest) =>
    client.get<CertificateGenerateResponse>("/certificate/generateCertificate", {
      query: { certificateId, examId, courseId },
    }),

  getUserCertificate: ({
    certificateId,
    examId,
    courseId,
  }: CertificateGenerateRequest) =>
    client.get<UserCertificateResponse>("/certificate/getUserCertificate", {
      query: { certificateId, examId, courseId },
    }),

  listUserCertificates: (payload: CertificateListRequest) =>
    client.post<UserCertificateListResponse>(
      "/certificate/getUserCertificateList",
      payload
    ),
});
