import { api, unwrapEnvelope } from "@workspace/api";
import type {
  CertificateListRequest,
  UserCertificateListResponse,
} from "@workspace/api";

export const fetchCertificates = async (
  filters: CertificateListRequest
): Promise<UserCertificateListResponse> => {
  const response = await api.certificate.listUserCertificates(filters);
  return unwrapEnvelope(response) ?? { records: [], total: 0 };
};

export const normalizeCertificatesError = (error: unknown): string => {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "证书接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前只能展示错误说明，不能视为接口已打通。`;
  }

  if (message === "网络请求失败") {
    return "证书接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
};
