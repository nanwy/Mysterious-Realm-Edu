import type {
  ExamResolvedStatus,
  ExamStatusFilter,
  ExamTypeFilter,
} from "./config";

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
  status: ExamResolvedStatus;
  statusLabel: string;
  typeLabel: string;
  attendeeText: string;
  actionLabel: string;
}

export interface ExamListResult {
  items: ExamListItem[];
  total: number;
}

export interface ExamPreview {
  id: string;
  title: string;
  summary: string;
  description: string;
  schedule: Array<{ label: string; value: string }>;
  stats: Array<{ label: string; value: string }>;
  instructions: string[];
  startDisabled: boolean;
  startLabel: string;
  startHint: string;
}
