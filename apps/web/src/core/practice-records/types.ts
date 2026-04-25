export interface PracticeRecordsQuery {
  repositoryName: string;
  practiceName: string;
  pageNo: number;
  pageSize: number;
}

export type PracticeRecordsFilterValues = Pick<
  PracticeRecordsQuery,
  "repositoryName" | "practiceName"
>;

export interface PracticeRecordItem {
  id: string;
  repositoryName: string;
  practiceName: string;
  rightNumber: number;
  totalNumber: number;
  accuracy: number;
  accuracyLabel: string;
  commitTime: string;
  durationLabel: string;
  statusLabel: string;
  resultHref: string;
}

export interface PracticeRecordsResult {
  records: PracticeRecordItem[];
  total: number;
}
