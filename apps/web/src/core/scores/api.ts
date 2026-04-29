import type {
  ExamDetailListResponse,
  ExamListRequest,
  ExamResultListResponse,
} from "@workspace/api";
import { api, unwrapEnvelope } from "@workspace/api";

const EMPTY_SCORE_LIST: ExamResultListResponse = {
  records: [],
  total: 0,
};

const EMPTY_SCORE_DETAILS: ExamDetailListResponse = {
  records: [],
  total: 0,
};

export const normalizeScoreError = (error: unknown) => {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "成绩接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message} 未检测到 NEXT_PUBLIC_API_BASE_URL。`;
  }

  if (message === "网络请求失败") {
    return "成绩接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
};

export const fetchScores = async (
  filters: ExamListRequest
): Promise<ExamResultListResponse> => {
  const response = await api.exam.getUserExamResultList({
    examTitle: filters.examTitle,
    passed: filters.passed,
    pageNo: filters.pageNo,
    pageSize: filters.pageSize,
  });

  return unwrapEnvelope(response) ?? EMPTY_SCORE_LIST;
};

export const fetchScoreDetails = async (
  examId: string,
  filters: ExamListRequest
): Promise<ExamDetailListResponse> => {
  const response = await api.exam.getUserExamDetailList({
    examId,
    passed: filters.passed,
    pageNo: filters.pageNo,
    pageSize: filters.pageSize,
  });

  return unwrapEnvelope(response) ?? EMPTY_SCORE_DETAILS;
};
