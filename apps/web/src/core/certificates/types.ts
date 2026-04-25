import type { CertificateTypeFilter } from "./config";

export interface CertificateRecord {
  id: string;
  userName: string;
  certificateName: string;
  certificateTypeLabel: string;
  examName: string;
  courseName: string;
  issueTime: string;
  previewUrl: string | null;
  downloadUrl: string | null;
  actionHint: string | null;
}

export interface CertificateFiltersState {
  certificateType: CertificateTypeFilter;
  pageNo: number;
  pageSize: number;
}

export interface CertificateListResult {
  records: CertificateRecord[];
  total: number;
}
