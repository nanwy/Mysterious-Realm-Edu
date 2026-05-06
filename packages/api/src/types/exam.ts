export enum EXAM_QUESTION_TYPE {
  RADIO = 1,
  MULTI = 2,
  JUDGE = 3,
  SIMPLE = 4,
  BLANK = 5,
  COMBINATION = 6,
}

export type ExamQuestionType = EXAM_QUESTION_TYPE;

export const EXAM_QUESTION_TYPE_OPTIONS = [
  { label: "单选题", value: EXAM_QUESTION_TYPE.RADIO },
  { label: "多选题", value: EXAM_QUESTION_TYPE.MULTI },
  { label: "判断题", value: EXAM_QUESTION_TYPE.JUDGE },
  { label: "简答题", value: EXAM_QUESTION_TYPE.SIMPLE },
  { label: "填空题", value: EXAM_QUESTION_TYPE.BLANK },
  { label: "组合题", value: EXAM_QUESTION_TYPE.COMBINATION },
] as const satisfies ReadonlyArray<{
  label: string;
  value: ExamQuestionType;
}>;

export const EXAM_QUESTION_TYPE_LABELS =
  Object.fromEntries(
    EXAM_QUESTION_TYPE_OPTIONS.map((item) => [item.value, item.label])
  ) as Record<ExamQuestionType, string>;

export enum EXAM_QUESTION_LEVEL {
  EASY = 1,
  NORMAL = 2,
  HARD = 3,
}

export type ExamQuestionLevel = EXAM_QUESTION_LEVEL;

export const EXAM_QUESTION_LEVEL_OPTIONS = [
  { label: "简单", value: EXAM_QUESTION_LEVEL.EASY },
  { label: "一般", value: EXAM_QUESTION_LEVEL.NORMAL },
  { label: "较难", value: EXAM_QUESTION_LEVEL.HARD },
] as const satisfies ReadonlyArray<{
  label: string;
  value: ExamQuestionLevel;
}>;

export const EXAM_QUESTION_LEVEL_LABELS =
  Object.fromEntries(
    EXAM_QUESTION_LEVEL_OPTIONS.map((item) => [item.value, item.label])
  ) as Record<ExamQuestionLevel, string>;

export enum EXAM_PAPER_STATE {
  IN_PROGRESS = 0,
  WAIT_REVIEW = 1,
  FINISHED = 2,
  BREAK = 3,
}

export type ExamPaperState = EXAM_PAPER_STATE;

export enum EXAM_PERFORM_STATE {
  IN_PROGRESS = 0,
  NOT_STARTED = 2,
  ENDED = 3,
}

export type ExamPerformState = EXAM_PERFORM_STATE;
export type ExamPerformStateParam = ExamPerformState | `${ExamPerformState}` | "";

export const EXAM_PERFORM_STATE_OPTIONS = [
  { label: "进行中", value: EXAM_PERFORM_STATE.IN_PROGRESS },
  { label: "未开始", value: EXAM_PERFORM_STATE.NOT_STARTED },
  { label: "已结束", value: EXAM_PERFORM_STATE.ENDED },
] as const satisfies ReadonlyArray<{
  label: string;
  value: ExamPerformState;
}>;

export const EXAM_PERFORM_STATE_LABELS =
  Object.fromEntries(
    EXAM_PERFORM_STATE_OPTIONS.map((item) => [item.value, item.label])
  ) as Record<ExamPerformState, string>;

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
export type ExamPassedStateParam = ExamPassedState | `${ExamPassedState}` | "";

export enum EXAM_LIST_TYPE {
  PUBLIC = 1,
  MINE = 2,
}

export type ExamListType = EXAM_LIST_TYPE;
export type ExamListTypeParam = ExamListType | `${ExamListType}`;

export enum EXAM_OPEN_TYPE {
  PUBLIC = 1,
  DEPARTMENT = 2,
  ASSIGNED_USER = 3,
}

export type ExamOpenType = EXAM_OPEN_TYPE;

export enum EXAM_REVIEWER_TYPE {
  DEPARTMENT = 1,
  USER = 2,
}

export type ExamReviewerType = EXAM_REVIEWER_TYPE;

export enum EXAM_PUBLISH_STATUS {
  PUBLISHED = 1,
}

export type ExamPublishStatus = EXAM_PUBLISH_STATUS;

export enum EXAM_JOIN_TYPE {
  SELECTED_QUESTIONS = 1,
  RANDOM_PAPER = 2,
  RANDOM_QUESTIONS = 3,
}

export type ExamJoinType = EXAM_JOIN_TYPE;

export const EXAM_JOIN_TYPE_OPTIONS = [
  { label: "选题组卷", value: EXAM_JOIN_TYPE.SELECTED_QUESTIONS },
  { label: "随机组卷", value: EXAM_JOIN_TYPE.RANDOM_PAPER },
  { label: "抽题组卷", value: EXAM_JOIN_TYPE.RANDOM_QUESTIONS },
] as const satisfies ReadonlyArray<{
  label: string;
  value: ExamJoinType;
}>;

export const EXAM_JOIN_TYPE_LABELS =
  Object.fromEntries(
    EXAM_JOIN_TYPE_OPTIONS.map((item) => [item.value, item.label])
  ) as Record<ExamJoinType, string>;

export type ExamDateTime = string;
export type ExamIntegerParam = number | string;

export interface ExamQuestionTypeCountDetail {
  /** 题数 */
  questionType?: ExamQuestionType;
  /** 题数 */
  questionTypeName?: string;
  /** 题数 */
  questionCount?: number;
}

export interface ExamListRequest {
  /** 考试 id */
  examId?: string;
  /** 考试名称 */
  examTitle?: string;
  /** perform_state: 0 进行中, 2 未开始, 3 已结束。 */
  state?: ExamPerformStateParam;
  /** 当前页码 */
  pageNo?: ExamIntegerParam;
  /** 每页条数 */
  pageSize?: ExamIntegerParam;
  /** exam_result 字典值。 */
  passed?: ExamPassedStateParam;
  /** 用户考试 id */
  userExamId?: string;
  /** 摄像头抓拍图片 base64 */
  base64Img?: string;
  /** 1 公开考试, 2 我的考试。 */
  examType?: ExamListTypeParam;
}

export interface ExamQuestionAnswerDetail {
  /** id | @Schema id */
  id?: string;
  /** 题目ID | @Schema 题目ID */
  questionId?: string;
  /** 答案内容 | @Schema 答案内容 */
  content?: string;
  /** 答案分析 | @Schema 答案分析 */
  analysis?: string;
  /** 是否正确 | @Schema 是否正确 */
  isRight?: boolean;
  /** tag | @Schema tag */
  tag?: string;
  /** 排序 | @Schema 排序 */
  sort?: number;
  /** 漏选给分分值 */
  pathScore?: number;
}

export interface ExamQuestionDetail {
  /** id | @Schema id */
  id?: string;
  /** 类型 | @Schema 类型 | @Dict question_type */
  type?: ExamQuestionType;
  /** 级别 | @Schema 级别 | @Dict question_level */
  level?: ExamQuestionLevel;
  /** 内容 | @Schema 内容 */
  content?: string;
  /** 备注 | @Schema 备注 */
  remark?: string;
  /** 解析 | @Schema 解析 */
  analysis?: string;
  /** @Schema 题库列表 */
  repositoryId?: string;
  /** 按序作答 | @Schema 按序作答 */
  answerOrder?: boolean;
  /** 是否子题目 | @Schema 是否子题目 */
  child?: boolean;
  /** 父题目id | @Schema 父题目id */
  parentId?: string;
  /** 排序 */
  sort?: number;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** 题库名称 */
  repositoryName?: string;
  /** 分数 */
  score?: number;
  /** 答案选项 */
  answerList?: ExamQuestionAnswerDetail[];
  /** 题数 */
  questionNum?: number;
  /** 子题目列表 */
  subQuestionList?: ExamQuestionDetail[];
  /** 正确答案 */
  rightAnswer?: string;
}

export interface ExamUserQuestionDetail {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 试卷id | @Schema 试卷id */
  userExamId?: string;
  /** 题目id | @Schema 题目id */
  questionId?: string;
  /** 题目类型 | @Schema 题目类型 */
  questionType?: ExamQuestionType;
  /** 问题排序 | @Schema 问题排序 */
  sort?: number;
  /** 题目分值 | @Schema 题目分值 */
  questionScore?: number;
  /** 是否已答 | @Schema 是否已答 */
  answered?: boolean;
  /** 是否答对 | @Schema 是否答对 */
  isRight?: boolean;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
  /** @Schema 答案 */
  answer?: string;
  /** 题目详情 */
  question?: ExamQuestionDetail;
  /** 题目序号 */
  questionIndex?: number;
  /** 题目类型名称 */
  questionTypeName?: string;
  /** 实际得分 | @Schema 实际得分 */
  actualScore?: number;
  /** 漏选也给分 | @Schema 漏选也给分 */
  canMissOption?: boolean;
  /** 按空给分 | @Schema 按空给分 */
  canBlankOption?: boolean;
  /** 是否子题目 | @Schema 是否子题目 */
  child?: boolean;
  /** 父题目id | @Schema 父题目id */
  parentQuestionId?: string;
  /** 子题目列表 */
  subQuestionList?: ExamUserQuestionDetail[];
}

export interface ExamAnswerCardDetail {
  /** 题数 */
  questionCount?: number;
  /** 分数 */
  questionScore?: number;
  /** 数值面板 */
  indexList?: number[];
  /** 题型 */
  questionType?: ExamQuestionType;
}

export type ExamAnswerCardGroup = {
  [typeName: string]: ExamAnswerCardDetail;
};

export interface ExamDetailResponse {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户ID | @Schema 用户ID */
  userId?: string;
  /** 考试id | @Schema 考试id */
  examId?: string;
  /** 试卷id | @Schema 试卷id */
  paperId?: string;
  /** 用户时长 | @Schema 用户时长 */
  userTime?: number;
  /** 用户得分 | @Schema 用户得分 */
  userScore?: number;
  /** 交卷时间 | @Schema 交卷时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  commitTime?: ExamDateTime;
  /** 状态 | @Schema 状态 */
  state?: ExamPaperState;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 截止时间 | @Schema 截止时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  limitTime?: ExamDateTime;
  /** 及格分 | @Schema 及格分 */
  qualifyScore?: number;
  /** 试卷总分 | @Schema 试卷总分 */
  totalScore?: number;
  /** 是否通过 | @Schema 是否通过 | @Dict exam_result */
  passed?: ExamPassedState;
  /** 是否有主观题 | @Schema 是否有主观题 */
  hasSubjective?: boolean;
  /** 主观题得分 | @Schema 主观题得分 */
  subjectiveScore?: number;
  /** 客观题得分 | @Schema 客观题得分 */
  objectiveScore?: number;
  /** 阅卷人 | @Schema 阅卷人 */
  previewUser?: string;
  /** 阅卷时间 | @Schema 阅卷时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  previewTime?: ExamDateTime;
  /** 用户试题列表 */
  userExamQuestionList?: ExamUserQuestionDetail[];
  /** 答题卡 */
  answerCardList?: ExamAnswerCardGroup[];
  /** 是否切屏检测 */
  leaveOn?: boolean;
  /** 可以切屏的次数 */
  totalLeaveTimes?: number;
  /** @Schema 考试结果展示类型 1：成绩 2：成绩+试卷明细 */
  examResultShowtype?: ExamResultShowType;
  /** @Schema 展示截止时间 */
  showDeadline?: number;
  /** 切换到其他页面多长时间判定为切屏 */
  leaveTime?: number;
  /** 用户名 */
  userName?: string;
  /** 用户真实姓名 */
  realName?: string;
  /** 考试名称 */
  examTitle?: string;
  /** 是否二维码考试 */
  ewmEnable?: boolean;
  /** 二维码考试地址 */
  examQrCodeUrl?: string;
  /** 是否摄像头抓拍 */
  snapOn?: boolean;
  /** 摄像头抓拍间隔时间 */
  snapIntervalTime?: number;
  /** 考试人数 */
  examNumber?: number;
  /** 题目数 */
  questionCount?: number;
  /** 考试时长 */
  totalTime?: number;
  /** 考试证书id */
  certificateId?: string;
  /** 积分 */
  integral?: number;
  /** 是否开启考试水印 */
  watermarkEnable?: boolean;
  /** 是否开启监考 */
  invigilateEnable?: boolean;
}

export interface ExamPaperSummaryResponse {
  /** id | @Schema id */
  id?: string;
  /** 试卷名称。 */
  title?: string;
  /** 试卷总分。 */
  totalScore?: number;
  /** 试题总数。 */
  questionCount?: number;
  /** join_type: 1 选题组卷, 2 随机组卷, 3 抽题组卷。 */
  joinType?: ExamJoinType;
  /** 是否有主观题 | @Schema 是否有主观题 */
  hasSubjective?: boolean;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd */
  createTime?: ExamDateTime;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd */
  updateTime?: ExamDateTime;
  /** 组卷方式文本 */
  joinType_dictText?: string;
}

export interface ExamSummaryResponse {
  /** id | @Schema id */
  id?: string;
  /** 考试标题 | @Schema 考试标题 */
  title?: string;
  /** 考试权限 1公开2部门3定员 | @Schema 1公开2部门3定员 | @Dict open_type */
  openType?: ExamOpenType;
  /** perform_state: 0 进行中, 2 未开始, 3 已结束。 */
  state?: ExamPerformStateParam;
  /** publish_status，已发布为 1。 */
  status?: ExamPublishStatus | ExamIntegerParam;
  /** 开始时间 | @Schema 开始时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  startTime?: ExamDateTime;
  /** 结束时间 | @Schema 结束时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  endTime?: ExamDateTime;
  /** 是否免费 | @Schema 是否免费 */
  isFree?: boolean;
  /** 价格 | @Schema 价格 */
  price?: number;
  /** 所有者 | @Schema 所有者 */
  owner?: string;
  /** 评论数 | @Schema 评论数 */
  commentNum?: number;
  /** 积分 */
  integral?: number;
  /** 试卷id | @Schema 试卷id */
  paperId?: string;
  /** 考试人数 */
  examNumber?: number;
  /** 及格分 | @Schema 及格分 */
  qualifyScore?: number;
  /** 试卷总分 | @Schema 试卷总分 */
  totalScore?: number;
  /** 考试时长 | @Schema 考试时长 */
  totalTime?: number;
  /** @Schema 限考次数 */
  limitCount?: number;
  /** @Schema 是否切屏检测 */
  leaveOn?: boolean | number | string;
  /** @Schema 考试者 */
  examiner?: string;
  /** @Schema 可以切屏的次数 */
  totalLeaveTimes?: number;
  /** @Schema 切换到其他页面多长时间判定为切屏 */
  leaveTime?: number;
  /** @Schema 是否题目乱序 */
  questionDisorder?: boolean;
  /** @Schema 是否答案乱序 */
  answerDisorder?: boolean;
  /** 阅卷人类型 1 部门, 2 人员 | @Schema 阅卷人类型 */
  reviewerType?: ExamReviewerType;
  /** 阅卷人 | @Schema 阅卷人 */
  reviewer?: string;
  /** @Schema 是否摄像头抓拍 */
  snapOn?: boolean | number | string;
  /** @Schema 摄像头抓拍间隔时间 */
  snapIntervalTime?: number;
  /** 题型数量统计 */
  questionTypeCountList?: ExamQuestionTypeCountDetail[];
  /** 用户考试次数 */
  tryCount?: number;
  /** 封面 | @Schema 封面 */
  image?: string;
  /** @Schema 考试结果展示类型 1：成绩 2：成绩+试卷明细 */
  examResultShowtype?: ExamResultShowType;
  /** @Schema 展示截止时间 */
  showDeadline?: number;
  /** @Schema 是否二维码考试 */
  ewmEnable?: boolean;
  /** @Schema 二维码考试地址 */
  examQrCodeUrl?: string;
  /** @Schema 是否开启考试水印 */
  watermarkEnable?: boolean;
  /** @Schema 是否开启监考 */
  invigilateEnable?: boolean;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** app端展示时间 | @JsonFormat yyyy-MM-dd */
  appShowTime?: ExamDateTime;
  /** @Schema 是否通过 */
  passed?: ExamPassedState;
  /** 全局配置-是否启用人脸核身功能 */
  globalFaceEnable?: boolean;
  /** 本场考试是否启用人脸核身功能 */
  faceDetectEnable?: boolean;
  /** 临时二维码考试地址 */
  tmpExamQrCodeUrl?: string;
  /** @Schema 证书 */
  certificateId?: string;
  /** 试卷信息 */
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
  /** 试题序号。组合题子题可能是 1.1 这类字符串。 */
  index?: string;
  /** question_type: 1 单选, 2 多选, 3 判断, 4 简答, 5 填空, 6 组合。 */
  questionType?: ExamQuestionType;
  /** 客观题答案 id 列表。 */
  answers?: string[];
  /** 客观题答案索引列表。后端 Java DTO 是 String[]。 */
  answerIndex?: string[];
  /** 简答题答案。 */
  subjectiveAnswer?: string;
  /** 填空题答案序列化文本。 */
  blankAnswer?: string;
}

export interface ExamSubmitRequest {
  /** 用户考试 id */
  userExamId?: string;
  /** 截止时间 */
  limitTime?: ExamDateTime;
  /** 试题答案 */
  examAnswers?: ExamAnswerDetail[];
}

export type ExamCacheAnswerRequest = ExamSubmitRequest;

export interface ExamSnapUploadRequest {
  /** 考试 id */
  examId?: string;
  /** 考试名称 */
  examTitle?: string;
  /** perform_state: 0 进行中, 2 未开始, 3 已结束。 */
  state?: ExamPerformStateParam;
  /** 当前页码 */
  pageNo?: ExamIntegerParam;
  /** 每页条数 */
  pageSize?: ExamIntegerParam;
  /** exam_result 字典值。 */
  passed?: ExamPassedStateParam;
  /** 用户考试 id */
  userExamId?: string;
  /** 摄像头抓拍图片 base64。 */
  base64Img?: string;
  /** 考试类型 1 公开考试, 2 我的考试。 */
  examType?: ExamListTypeParam;
}

export interface ExamCacheAnswerResponse {
  /** 用户考试 id */
  userExamId?: string;
  /** 截止时间 */
  limitTime?: ExamDateTime;
  /** 试题答案 */
  examAnswers?: ExamAnswerDetail[];
}

export interface ExamPageResponse<TRecord> {
  records?: TRecord[];
  list?: TRecord[];
  rows?: TRecord[];
  data?: TRecord[];
  total?: number;
  count?: number;
  totalCount?: number;
  recordTotal?: number;
  size?: number;
  current?: number;
  pages?: number;
  searchCount?: boolean;
}

export interface ExamScoreResponse {
  /** 考试次数。 */
  tryCount?: number;
  /** 最高得分。 */
  maxScore?: number;
  /** exam_result 字典值。 */
  passed?: ExamPassedState;
  /** 试卷总分。 */
  totalScore?: number;
  /** 及格分。 */
  qualifyScore?: number;
  /** 试题总数。 */
  questionCount?: number;
}

export interface ExamResultListItem {
  /** 用户考试成绩记录 id。 */
  id?: string;
  /** 用户ID | @Schema 用户ID */
  userId?: string;
  /** 考试ID | @Schema 考试ID */
  examId?: string;
  /** 考试次数。 */
  tryCount?: number;
  /** 最高分数。 */
  maxScore?: number;
  /** exam_result 字典值。 */
  passed?: ExamPassedState;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
  /** 考试名称 */
  examTitle?: string;
  /** 考试封面 */
  examCover?: string;
}

export type ExamListResponse =
  | ExamSummaryResponse[]
  | ExamPageResponse<ExamSummaryResponse>
  | ExamListPayloadResponse;
export type LatestExamListResponse = ExamSummaryResponse[];
export type ExamPreviewResponse = ExamSummaryResponse;
export interface ExamSessionResponse extends ExamDetailResponse {
  /** 用户考试 id。createExam 返回 UserExam 时等同于 id。 */
  userExamId?: string;
}
export type ExamCurrentSessionResponse = ExamDetailResponse | null;
export type ExamResultDetailResponse = ExamDetailResponse;
export type ExamResultListResponse = ExamPageResponse<ExamResultListItem>;
export type ExamDetailListResponse = ExamPageResponse<ExamDetailResponse>;
