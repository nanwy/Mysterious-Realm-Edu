import { api, unwrapEnvelope } from "@workspace/api";
import type {
  CertificateFiltersState,
  CertificateListResult,
  CertificateRecord,
} from "./types";
import {
  resolveCertificateDownloadUrl,
  resolveCertificatePreviewUrl,
  toText,
} from "@/lib/media";
import { toNumberOrFallback, toRecordOrEmpty } from "@/lib/normalize";

interface CertificateListPayload {
  records?: unknown[];
  total?: number;
}

const normalizeRecord = (
  item: unknown,
  index: number
): CertificateRecord => {
  const record = toRecordOrEmpty(item);
  const certificatePath = toText(
    record.certificatePath ?? record.objectName ?? record.filePath,
    ""
  );
  const previewResolution = resolveCertificatePreviewUrl(certificatePath);
  const downloadResolution = resolveCertificateDownloadUrl(certificatePath);
  const identifier =
    record.id ??
    record.userCertificateId ??
    record.certificateId ??
    record.examId ??
    `certificate-${index + 1}`;

  return {
    id: String(identifier),
    userName: toText(
      record.userId_dictText ?? record.userName ?? record.realName,
      `学员 ${index + 1}`
    ),
    certificateName: toText(
      record.certificateId_dictText ?? record.certificateName ?? record.title,
      `证书 ${index + 1}`
    ),
    certificateTypeLabel: toText(
      record.certificateType_dictText ?? record.certificateTypeName,
      "待补类型"
    ),
    examName: toText(record.examId_dictText ?? record.examName, "未关联考试"),
    courseName: toText(
      record.courseId_dictText ?? record.courseName,
      "未关联课程"
    ),
    issueTime: toText(
      record.createTime ?? record.issueTime ?? record.updateTime,
      "待补发证时间"
    ),
    previewUrl: previewResolution.url,
    downloadUrl: downloadResolution.url,
    actionHint: previewResolution.reason ?? downloadResolution.reason ?? null,
  };
};

export const fetchCertificates = async (
  filters: CertificateFiltersState
): Promise<CertificateListResult> => {
  const response = await api.certificate.listUserCertificates({
    pageNo: filters.pageNo,
    pageSize: filters.pageSize,
    certificateType: filters.certificateType,
  });
  const payload = unwrapEnvelope(response);
  const result =
    payload && typeof payload === "object"
      ? (payload as CertificateListPayload)
      : ({} as CertificateListPayload);
  const records = Array.isArray(result.records)
    ? result.records.map(normalizeRecord)
    : [];

  return {
    records,
    total: toNumberOrFallback(result.total, records.length),
  };
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
