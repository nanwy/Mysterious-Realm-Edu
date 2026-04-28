import type {
  ExamResolvedStatus,
  ExamStatusFilter,
  ExamTypeFilter,
} from "./config";
import type {
  ExamPaperState,
  ExamQuestionType,
  ExamResultShowType,
} from "@workspace/api";

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

export interface ExamOnlineOption {
  id: string;
  tag: string;
  content: string;
}

export interface ExamOnlineQuestion {
  id: string;
  index: number;
  title: string;
  type: ExamQuestionType;
  typeName: string;
  score: number;
  options: ExamOnlineOption[];
  subQuestions: ExamOnlineQuestion[];
}

export interface ExamOnlineAnswerGroup {
  typeName: string;
  questionType: ExamQuestionType;
  questionCount: number;
  questionScore: number;
  indexes: number[];
}

export interface ExamOnlineAnswerDraft {
  index: number | string;
  questionType: ExamQuestionType;
  answers?: string[];
  answerIndex?: number[];
  subjectiveAnswer?: string;
  blankAnswer?: string;
}

export interface ExamOnlineSession {
  examId: string;
  userExamId: string;
  submitted: boolean;
  resultDetailVisible: boolean;
  resultShowType: ExamResultShowType | null;
  showDeadline: number | null;
  paperState: ExamPaperState | null;
  passed: boolean | null;
  userScore: number | null;
  qualifyScore: number | null;
  commitTime: string;
  previewTime: string;
  title: string;
  totalScore: number;
  totalTime: number;
  questionCount: number;
  limitTime: string;
  remainSeconds: number | null;
  statusMessage: string;
  warning: string | null;
  questions: ExamOnlineQuestion[];
  answerGroups: ExamOnlineAnswerGroup[];
  cachedAnswers: ExamOnlineAnswerDraft[];
}
