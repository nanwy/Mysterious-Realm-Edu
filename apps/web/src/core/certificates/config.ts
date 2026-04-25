export const CERTIFICATES_PAGE_SIZE = 10;

export enum CERTIFICATE_TYPE {
  ALL = "",
  STUDY = "1",
  EXAM = "2",
}

export type CertificateTypeFilter = CERTIFICATE_TYPE;

export const CERTIFICATE_TYPE_OPTIONS = [
  { value: CERTIFICATE_TYPE.ALL, label: "全部" },
  { value: CERTIFICATE_TYPE.STUDY, label: "学习证书" },
  { value: CERTIFICATE_TYPE.EXAM, label: "考试证书" },
] as const;
