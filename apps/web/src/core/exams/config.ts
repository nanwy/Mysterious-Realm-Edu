export const EXAMS_PAGE_SIZE = 9;

export enum EXAM_TYPE {
  PUBLIC = "1",
  MINE = "2",
}

export enum EXAM_STATUS {
  ALL = "",
  IN_PROGRESS = "0",
  NOT_STARTED = "2",
  ENDED = "3",
}

export type ExamTypeFilter = EXAM_TYPE;
export type ExamStatusFilter = EXAM_STATUS;
export type ExamResolvedStatus = Exclude<ExamStatusFilter, EXAM_STATUS.ALL>;

export const EXAM_TYPE_OPTIONS = [
  { value: EXAM_TYPE.PUBLIC, label: "公开考试" },
  { value: EXAM_TYPE.MINE, label: "我的考试" },
] as const;

export const EXAM_STATUS_OPTIONS = [
  { value: EXAM_STATUS.ALL, label: "全部" },
  { value: EXAM_STATUS.IN_PROGRESS, label: "进行中" },
  { value: EXAM_STATUS.NOT_STARTED, label: "未开始" },
  { value: EXAM_STATUS.ENDED, label: "已结束" },
] as const;
