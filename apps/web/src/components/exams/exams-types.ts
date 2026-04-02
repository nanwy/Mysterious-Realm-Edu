export const EXAMS_PAGE_SIZE = 9;

export const EXAM_TYPE_OPTIONS = [
  { value: "1", label: "公开考试" },
  { value: "2", label: "我的考试" },
] as const;

export const EXAM_STATUS_OPTIONS = [
  { value: "", label: "全部" },
  { value: "0", label: "进行中" },
  { value: "2", label: "未开始" },
  { value: "3", label: "已结束" },
] as const;

export type ExamTypeFilter = (typeof EXAM_TYPE_OPTIONS)[number]["value"];
export type ExamStatusFilter = (typeof EXAM_STATUS_OPTIONS)[number]["value"];

export interface ExamFiltersState {
  examTitle: string;
  examType: ExamTypeFilter;
  state: ExamStatusFilter;
  pageNo: number;
  pageSize: number;
}

export interface ExamListItem {
  id: string;
  examId: string;
  title: string;
  summary: string;
  timeText: string;
  status: Exclude<ExamStatusFilter, "">;
  statusLabel: string;
  typeLabel: string;
  attendeeText: string;
  actionLabel: string;
}

export interface ExamListResult {
  items: ExamListItem[];
  total: number;
}
