export type ExamListRequest = Record<string, unknown>;
export type ExamSubmitRequest = Record<string, unknown>;
export type ExamCacheAnswerRequest = Record<string, unknown>;
export type ExamSnapUploadRequest = Record<string, unknown>;

export enum EXAM_QUESTION_TYPE {
  RADIO = 1,
  MULTI = 2,
  JUDGE = 3,
  SIMPLE = 4,
  BLANK = 5,
  COMBINATION = 6,
}

export type ExamQuestionType = EXAM_QUESTION_TYPE;

export const EXAM_QUESTION_TYPE_LABELS = {
  [EXAM_QUESTION_TYPE.RADIO]: "单选题",
  [EXAM_QUESTION_TYPE.MULTI]: "多选题",
  [EXAM_QUESTION_TYPE.JUDGE]: "判断题",
  [EXAM_QUESTION_TYPE.SIMPLE]: "简答题",
  [EXAM_QUESTION_TYPE.BLANK]: "填空题",
  [EXAM_QUESTION_TYPE.COMBINATION]: "组合题",
} as const satisfies Record<ExamQuestionType, string>;

export enum EXAM_PAPER_STATE {
  IN_PROGRESS = 0,
  WAIT_REVIEW = 1,
  FINISHED = 2,
  BREAK = 3,
}

export type ExamPaperState = EXAM_PAPER_STATE;

export enum EXAM_RESULT_SHOW_TYPE {
  SCORE_ONLY = 1,
  SCORE_AND_DETAIL = 2,
}

export type ExamResultShowType = EXAM_RESULT_SHOW_TYPE;

export enum EXAM_PASSED_STATE {
  NOT_PASSED = 0,
  PASSED = 1,
}

export type ExamPassedState = EXAM_PASSED_STATE;
export type ExamDateTime = string;

export interface ExamQuestionAnswerDetail {
  id?: string;
  questionId?: string;
  content?: string;
  analysis?: string;
  isRight?: boolean;
  tag?: string;
  sort?: number;
  pathScore?: number;
}

export interface ExamQuestionDetail {
  id?: string;
  type?: ExamQuestionType;
  level?: number;
  content?: string;
  remark?: string;
  analysis?: string;
  repositoryId?: string;
  answerOrder?: boolean;
  child?: boolean;
  parentId?: string;
  sort?: number;
  createTime?: ExamDateTime;
  updateTime?: ExamDateTime;
  repositoryName?: string;
  score?: number;
  answerList?: ExamQuestionAnswerDetail[];
  questionNum?: number;
  subQuestionList?: ExamQuestionDetail[];
}

export interface ExamUserQuestionDetail {
  id?: string;
  userExamId?: string;
  questionId?: string;
  questionType?: ExamQuestionType;
  sort?: number;
  questionScore?: number;
  answered?: boolean;
  isRight?: boolean;
  createTime?: ExamDateTime;
  updateTime?: ExamDateTime;
  answer?: string;
  question?: ExamQuestionDetail;
  questionIndex?: number;
  questionTypeName?: string;
  actualScore?: number;
  canMissOption?: boolean;
  canBlankOption?: boolean;
  child?: boolean;
  parentQuestionId?: string;
  subQuestionList?: ExamUserQuestionDetail[];
}

export interface ExamAnswerCardDetail {
  questionCount?: number;
  questionScore?: number;
  indexList?: number[];
  questionType?: ExamQuestionType;
}

export type ExamAnswerCardGroup = {
  [typeName: string]: ExamAnswerCardDetail;
};

export interface ExamDetailResponse {
  id?: string;
  userId?: string;
  examId?: string;
  paperId?: string;
  userTime?: number;
  userScore?: number;
  commitTime?: ExamDateTime;
  state?: ExamPaperState;
  createTime?: ExamDateTime;
  updateTime?: ExamDateTime;
  limitTime?: ExamDateTime;
  qualifyScore?: number;
  totalScore?: number;
  passed?: ExamPassedState;
  hasSubjective?: boolean;
  subjectiveScore?: number;
  objectiveScore?: number;
  previewUser?: string;
  previewTime?: ExamDateTime;
  userExamQuestionList?: ExamUserQuestionDetail[];
  answerCardList?: ExamAnswerCardGroup[];
  leaveOn?: boolean;
  totalLeaveTimes?: number;
  examResultShowtype?: ExamResultShowType;
  showDeadline?: number;
  leaveTime?: number;
  userName?: string;
  realName?: string;
  examTitle?: string;
  ewmEnable?: boolean;
  examQrCodeUrl?: string;
  snapOn?: boolean;
  snapIntervalTime?: number;
  examNumber?: number;
  questionCount?: number;
  totalTime?: number;
  certificateId?: string;
  integral?: number;
  watermarkEnable?: boolean;
  invigilateEnable?: boolean;
}

export interface ExamPaperSummaryResponse {
  id?: string;
  title?: string;
  totalScore?: number;
  questionCount?: number;
  joinType?: number;
  joinType_dictText?: string;
}

export interface ExamSummaryResponse {
  id?: string;
  examId?: string;
  userExamId?: string;
  title?: string;
  examName?: string;
  name?: string;
  examType?: string | number;
  type?: string | number;
  state?: string | number;
  status?: string | number;
  examStatus?: string | number;
  startTime?: ExamDateTime;
  beginTime?: ExamDateTime;
  examStartTime?: ExamDateTime;
  endTime?: ExamDateTime;
  finishTime?: ExamDateTime;
  examEndTime?: ExamDateTime;
  examTime?: string;
  timeRange?: string;
  examDesc?: string;
  description?: string;
  remark?: string;
  introduction?: string;
  examDuration?: number;
  duration?: number;
  limitTime?: number | string;
  examNumber?: number;
  joinNum?: number;
  applyCount?: number;
  userCount?: number;
  qualifyScore?: number;
  totalTime?: number;
  limitCount?: number;
  leaveOn?: boolean | number | string;
  totalLeaveTimes?: number;
  snapOn?: boolean | number | string;
  snapIntervalTime?: number;
  openType_dictText?: string;
  tryCount?: number;
  paper?: ExamPaperSummaryResponse;
}

export interface ExamListPayloadResponse {
  records?: ExamSummaryResponse[];
  list?: ExamSummaryResponse[];
  rows?: ExamSummaryResponse[];
  data?: ExamSummaryResponse[];
  total?: number;
  count?: number;
  totalCount?: number;
  recordTotal?: number;
}

export interface ExamAnswerDetail {
  index?: string;
  questionType?: ExamQuestionType;
  answers?: string[];
  answerIndex?: string[];
  subjectiveAnswer?: string;
  blankAnswer?: string;
}

export interface ExamCacheAnswerResponse {
  userExamId?: string;
  limitTime?: ExamDateTime;
  examAnswers?: ExamAnswerDetail[];
}

export type ExamListResponse = ExamSummaryResponse[] | ExamListPayloadResponse;
export type ExamPreviewResponse = ExamSummaryResponse;
export interface ExamSessionResponse extends ExamDetailResponse {
  userExamId?: string;
}
export type ExamResultResponse = unknown;
export type ExamResultListResponse = unknown;
export type ExamDetailListResponse = unknown;
export type ExamLimitResponse = unknown;
