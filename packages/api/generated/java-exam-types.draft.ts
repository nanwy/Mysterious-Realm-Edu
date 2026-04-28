// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: exam

export type ExamDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/paper/enmus/JoinType.java
export enum JoinType {
  XT = 1, // 选题组卷
  SJ = 2, // 随机组卷
  CT = 3, // 抽题组卷
}
export const JoinTypeOptions = [
  { label: "选题组卷", value: JoinType.XT },
  { label: "随机组卷", value: JoinType.SJ },
  { label: "抽题组卷", value: JoinType.CT },
] as const;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/paper/enmus/LevelType.java
export enum LevelType {
  JD = 1, // 简单
  YB = 2, // 一般
  JN = 3, // 较难
}
export const LevelTypeOptions = [
  { label: "简单", value: LevelType.JD },
  { label: "一般", value: LevelType.YB },
  { label: "较难", value: LevelType.JN },
] as const;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/question/enums/QuestionType.java
export enum QuestionType {
  RADIO = 1, // 单选题
  MULTI = 2, // 多选题
  JUDGE = 3, // 判断题
  SIMPLE = 4, // 简答题
  BLANK = 5, // 填空题
  COMBINATION = 6, // 组合题
}
export const QuestionTypeOptions = [
  { label: "单选题", value: QuestionType.RADIO },
  { label: "多选题", value: QuestionType.MULTI },
  { label: "判断题", value: QuestionType.JUDGE },
  { label: "简答题", value: QuestionType.SIMPLE },
  { label: "填空题", value: QuestionType.BLANK },
  { label: "组合题", value: QuestionType.COMBINATION },
] as const;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/exam/dto/AnswerCardDTO.java
export interface AnswerCardDTO {
  /** 题数 */
  questionCount?: number;
  /** 分数 */
  questionScore?: number;
  /** 数值面板 */
  indexList?: number[];
  /** 题型 */
  questionType?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/exam/dto/BlankAnswerResultDTO.java
export interface BlankAnswerResultDTO {
  /** 答案序号 */
  tag?: string;
  /** 答案内容 */
  content?: string;
  /** 是否正确 */
  isRight?: boolean;
  /** 选项得分 */
  score?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/exam/entity/Exam.java
export interface Exam {
  /** id | @Schema id */
  id?: string;
  /** 考试标题 | @Schema 考试标题 */
  title?: string;
  /** 考试权限 1公开2部门3定员 | @Schema 1公开2部门3定员 | @Dict open_type */
  openType?: number;
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
  /** 状态 | @Schema 状态 | @Dict publish_status */
  status?: number;
  /** 试卷总分 | @Schema 试卷总分 */
  totalScore?: number;
  /** 及格分 | @Schema 及格分 */
  qualifyScore?: number;
  /** 考试时长 | @Schema 考试时长 */
  totalTime?: number;
  /** 试卷id | @Schema 试卷id */
  paperId?: string;
  /** @Schema 限考次数 */
  limitCount?: number;
  /** @Schema 考试者 */
  examiner?: string;
  /** @Schema 是否切屏检测 */
  leaveOn?: boolean;
  /** @Schema 可以切屏的次数 */
  totalLeaveTimes?: number;
  /** @Schema 切换到其他页面多长时间判定为切屏 */
  leaveTime?: number;
  /** @Schema 是否题目乱序 */
  questionDisorder?: boolean;
  /** @Schema 是否答案乱序 */
  answerDisorder?: boolean;
  /** 阅卷人类型  1:部门  2：人员 | @Schema 阅卷人类型 */
  reviewerType?: number;
  /** 阅卷人 | @Schema 阅卷人 */
  reviewer?: string;
  paper?: Paper;
  /** @Dict perform_state */
  state?: number;
  questionTypeCountList?: QuestionTypeCountDTO[];
  /** 用户考试次数 */
  tryCount?: number;
  /** 封面 | @Schema 封面 */
  image?: string;
  /** @Schema 考试结果展示类型 1：成绩 2：成绩+试卷明细 */
  examResultShowtype?: number;
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
  passed?: number;
  /** @Schema 是否摄像头抓拍 */
  snapOn?: boolean;
  /** @Schema 摄像头抓拍间隔时间 */
  snapIntervalTime?: number;
  /** 全局配置-是否启用人脸核身功能 */
  globalFaceEnable?: boolean;
  /** 本场考试是否启用人脸核身功能 */
  faceDetectEnable?: boolean;
  /** 临时二维码考试地址 */
  tmpExamQrCodeUrl?: string;
  /** 考试人数 */
  examNumber?: number;
  /** @Schema 证书 */
  certificateId?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/exam/dto/ExamAnswerDTO.java
export interface ExamAnswerDTO {
  /** 试题序号 */
  index?: string;
  /** 题型 */
  questionType?: number;
  /** 试题答案(客观题---单选/多选/判断题) */
  answers?: string[];
  /** 答案索引(客观题---单选/多选/判断题) */
  answerIndex?: string[];
  /** 试题答案(主观题---简答题) */
  subjectiveAnswer?: string;
  /** 试题答案(客观题---填空题) */
  blankAnswer?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/app/api/v1/entity/dto/ExamDTO.java
export interface ExamDTO {
  examId?: string;
  examTitle?: string;
  state?: number;
  pageNo?: number;
  pageSize?: number;
  passed?: number;
  userExamId?: string;
  base64Img?: string;
  /** 考试类型  1:公开考试，2.我的考试 */
  examType?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/invigilate/entity/ExamInvigilate.java
export interface ExamInvigilate {
  /** id | @Schema id */
  id?: string;
  /** 考试标题 | @Schema 考试标题 */
  title?: string;
  /** 考试权限 1公开2部门3定员 | @Schema 1公开2部门3定员 | @Dict open_type */
  openType?: number;
  /** 开始时间 | @Schema 开始时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  startTime?: ExamDateTime;
  /** 结束时间 | @Schema 结束时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  endTime?: ExamDateTime;
  /** 所有考试人数 | @Schema 所有考试人数 */
  allExamNumber?: number;
  /** 正在考试人数 | @Schema 正在考试人数 */
  nowExamNumber?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/examreview/dto/ExamPreviewDTO.java
export interface ExamPreviewDTO {
  /** 试卷序号 */
  index?: string;
  isRight?: boolean;
  /** 试题得分(主观题) */
  actualScore?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/examreview/entity/ExamReview.java
export interface ExamReview {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 考试名称 | @Schema 考试名称 */
  title?: string;
  /** 考试权限 | @Schema 考试权限 | @Dict open_type */
  openType?: number;
  /** 开始考试时间 | @Schema 开始考试时间 | @JsonFormat yyyy-MM-dd */
  startTime?: ExamDateTime;
  /** 结束考试时间 | @Schema 结束考试时间 | @JsonFormat yyyy-MM-dd */
  endTime?: ExamDateTime;
  /** 考试人数 | @Schema 考试人数 */
  examUserCount?: number;
  /** 待阅试卷数量 | @Schema 待阅试卷数量 */
  examReviewTimes?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/exam/dto/ExamSnapDTO.java
export interface ExamSnapDTO {
  userExamId?: string;
  /** 照片 */
  userExamSnapList?: UserExamSnap[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/examstatistics/entity/ExamStatistics.java
export interface ExamStatistics {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 考试id | @Schema 所属部门 */
  examId?: string;
  /** 应考人数 | @Schema 应考人数 */
  mustExaminee?: number;
  /** 实考人数 | @Schema 实考人数 */
  actualExaminee?: number;
  /** 缺考人数 | @Schema 缺考人数 */
  missExaminee?: number;
  /** 参加人次 | @Schema 参加人次 */
  participant?: number;
  /** 及格人数 | @Schema 及格人数 */
  pass?: number;
  /** 不及格人数 | @Schema 不及格人数 */
  noPass?: number;
  /** 正确率 | @Schema 正确率 */
  accuracy?: number;
  /** 最高分 | @Schema 最高分 */
  maxScore?: number;
  /** 平均分 | @Schema 平均分 */
  avgScore?: number;
  /** 最低分 | @Schema 最低分 */
  minScore?: number;
  /** 考试名称 | @Schema 考试名称 */
  examTitle?: string;
  /** 考试状态 | @Schema 考试状态 | @Dict perform_state */
  examState?: number;
  /** 实考人数占比 | @Schema 实考人数占比 */
  actualPercent?: number;
  /** 缺考人数占比 | @Schema 缺考人数占比 */
  missPercent?: number;
  /** 通过占比 | @Schema 通过占比 */
  passPercent?: number;
  /** 不通过占比 | @Schema 不通过占比 */
  nopassPercent?: number;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/examstatistics/dto/ExamStatisticsDTO.java
export interface ExamStatisticsDTO {
  userExamId?: string;
  userId?: string;
  username?: string;
  /** 用户真实姓名 */
  realname?: string;
  examId?: string;
  /** 考试名称 */
  title?: string;
  /** 考试权限 1公开2部门3定员 | @Dict open_type */
  openType?: number;
  /** 考试时长 */
  totalTime?: number;
  /** 试卷总分 */
  totalScore?: number;
  /** 及格分 */
  qualifyScore?: number;
  /** 用户用时 */
  userTime?: number;
  /** 用户得分 */
  userScore?: number;
  /** 交卷时间 */
  commitExamTime?: ExamDateTime;
  /** 开始考试时间 */
  startExamTime?: ExamDateTime;
  /** 是否通过 */
  passed?: number;
  /** 考试次数 */
  tryCount?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/exam/dto/ExamSubmitDTO.java
export interface ExamSubmitDTO {
  userExamId?: string;
  limitTime?: ExamDateTime;
  /** 试题答案 */
  examAnswers?: ExamAnswerDTO[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/examuserstatistics/entity/ExamUserStatistics.java
export interface ExamUserStatistics {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 用户名 | @Schema 用户名 */
  username?: string;
  /** 真实姓名 | @Schema 真实姓名 */
  realname?: string;
  /** 考试id | @Schema 考试id */
  examId?: string;
  /** 组织机构编码 | @Schema 组织机构编码 */
  orgCode?: string;
  /** 组织机构名称 | @Schema 组织机构名称 */
  orgName?: string;
  /** 开始考试时间 | @Schema 开始考试时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  startExamTime?: ExamDateTime;
  /** 交卷时间 | @Schema 交卷时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  commitExamTime?: ExamDateTime;
  /** 考试次数 | @Schema 考试次数 */
  tryCount?: number;
  /** 用户用时 | @Schema 用户用时 */
  userTime?: number;
  /** 用户得分 | @Schema 用户得分 */
  userScore?: number;
  /** 正确率 | @Schema 正确率 */
  accuracy?: number;
  /** 得分率 | @Schema 得分率 */
  scoreRate?: number;
  /** 排名 | @Schema 排名 */
  rankList?: number;
  /** 是否通过 | @Schema 是否通过 */
  passed?: number;
  passedText?: string;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/exam/dto/ExportPaperDTO.java
export interface ExportPaperDTO {
  questionType?: number;
  questionTypeName?: string;
  /** 题数 */
  questionCount?: number;
  everyQuestionEqual?: boolean;
  /** 分数 */
  questionScore?: number;
  totalScore?: number;
  rightAnswer?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/invigilate/entity/dto/InvigilateStatisticsDTO.java
export interface InvigilateStatisticsDTO {
  allExamNumber?: number;
  nowExamNumber?: number;
  finishExamNumber?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/paper/entity/Paper.java
export interface Paper {
  /** id | @Schema id */
  id?: string;
  /** 试卷名称 | @Schema 试卷名称 */
  title?: string;
  /** 试卷总分 | @Schema 试卷总分 */
  totalScore?: number;
  /** 组卷类型 1:选题组卷 2.随机组卷 | @Schema 组卷类型 1:选题组卷 2.随机组卷 | @Dict join_type */
  joinType?: number;
  /** 试题总数 | @Schema 试题总数 */
  questionCount?: number;
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

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/paperquestion/entity/PaperQuestion.java
export interface PaperQuestion {
  /** id | @Schema id */
  id?: string;
  /** 试卷id | @Schema 试卷id */
  paperId?: string;
  /** 题目id | @Schema 题目id */
  questionId?: string;
  /** 题目类型 | @Schema 题目类型 */
  questionType?: number;
  /** 排序 | @Schema 排序 */
  sort?: number;
  /** 题目分数 | @Schema 题目分数 */
  questionScore?: number;
  /** 所属组id | @Schema 所属组id */
  groupId?: string;
  /** 是否子题目 | @Schema 是否子题目 */
  child?: boolean;
  /** 父题目id | @Schema 父题目id */
  parentQuestionId?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/paperquestionanswer/entity/PaperQuestionAnswer.java
export interface PaperQuestionAnswer {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 试卷id | @Schema 试卷id */
  paperId?: string;
  /** 题目id | @Schema 题目id */
  questionId?: string;
  /** 答案id | @Schema 答案id */
  answerId?: string;
  /** 漏选给分的分值 | @Schema 漏选给分的分值 */
  pathScore?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/paperruledetail/entity/PaperRuleDetail.java
export interface PaperRuleDetail {
  /** id | @Schema id */
  id?: string;
  /** 题库id | @Schema 题库id */
  repositoryId?: string;
  /** 难度 | @Schema 难度 */
  level?: number;
  /** 所属组id | @Schema 所属组id */
  groupId?: string;
  /** 所属试卷id | @Schema 所属试卷id */
  paperId?: string;
  /** 题目数量 | @Schema 题目数量 */
  num?: number;
  /** 排序 | @Schema 排序 */
  sort?: number;
  /** 题型 | @Schema 题型 */
  questionType?: number;
  repositoryName?: string;
  level_dictText?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/paperrulegroup/entity/PaperRuleGroup.java
export interface PaperRuleGroup {
  /** id | @Schema id */
  id?: string;
  /** 组名 | @Schema 组名 */
  title?: string;
  /** 试卷id | @Schema 试卷id */
  paperId?: string;
  /** 题目类型 | @Schema 题目类型 | @Dict question_type */
  questionType?: number;
  /** 每题分数 | @Schema 每题分数 */
  perScore?: number;
  /** 题目数量 | @Schema 题目数量 */
  questionCount?: number;
  /** 总分数 | @Schema 总分数 */
  totalScore?: number;
  /** 排序 | @Schema 排序 */
  sort?: number;
  /** 漏选也给分 | @Schema 漏选也给分 */
  canMissOption?: boolean;
  /** 按空给分 | @Schema 按空给分 */
  canBlankOption?: boolean;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/examreview/dto/PreviewSubmitDTO.java
export interface PreviewSubmitDTO {
  userExamId?: string;
  /** 试题分数 */
  examPreviews?: ExamPreviewDTO[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/question/entity/Question.java
export interface Question {
  /** id | @Schema id */
  id?: string;
  /** 类型 | @Schema 类型 | @Dict question_type */
  type?: number;
  /** 级别 | @Schema 级别 | @Dict question_level */
  level?: number;
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
  answerList?: QuestionAnswer[];
  /** 题数 */
  questionNum?: number;
  /** 子题目列表 */
  subQuestionList?: Question[];
  /** 正确答案 */
  rightAnswer?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/questionanswer/entity/QuestionAnswer.java
export interface QuestionAnswer {
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

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/question/dto/QuestionConditionDTO.java
export interface QuestionConditionDTO {
  /** 题库 */
  repositoryId?: string;
  /** 题型 */
  questionType?: number;
  /** 级别 */
  level?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/question/dto/QuestionDTO.java
export interface QuestionDTO {
  /** 类型 | @Schema 类型 | @Dict question_type */
  type?: number;
  /** 级别 | @Schema 级别 | @Dict question_level */
  level?: number;
  /** @Schema 题库列表 */
  repositoryId?: string;
  /** @Schema 题库名称 */
  repositoryName?: string;
  /** @Schema 分类数量 */
  categoryCount?: number;
  /** @Schema 抽题数量 */
  num?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/question/vo/QuestionRownum.java
export interface QuestionRownum {
  /** 题目行号 */
  rowNum?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/question/dto/QuestionRownumDTO.java
export interface QuestionRownumDTO {
  questionType?: number;
  /** 级别 */
  level?: number;
  repositoryId?: string;
  /** 题目行号 */
  rownumList?: number[];
  /** 要抽取的题目数 */
  questionNum?: number;
  /** 所属组id */
  groupId?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/exam/dto/QuestionTypeCountDTO.java
export interface QuestionTypeCountDTO {
  /** 题数 */
  questionType?: number;
  /** 题数 */
  questionTypeName?: string;
  /** 题数 */
  questionCount?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/repository/entity/Repository.java
export interface Repository {
  /** id | @Schema id */
  id?: string;
  /** 题库名称 | @Schema 题库名称 */
  title?: string;
  /** 题库编码 */
  code?: string;
  /** 题库备注 | @Schema 题库备注 */
  remark?: string;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd */
  createTime?: ExamDateTime;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd */
  updateTime?: ExamDateTime;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** 题目数量 */
  num?: number;
  questionDTOList?: QuestionDTO[];
  /** 题目备注 */
  questionRemark?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/paperruledetail/dto/RuleDetailDTO.java
export interface RuleDetailDTO {
  repositoryIds?: string;
  type?: number;
  ruleList?: string;
  questionIds?: string;
  joinType?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/userexamcheat/entity/dto/UserCheatDTO.java
export interface UserCheatDTO {
  userId?: string;
  cheatNum?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/userexamcheat/entity/dto/UserCheatStatisticsDTO.java
export interface UserCheatStatisticsDTO {
  userList?: string[];
  cheatNumList?: number[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/userexam/entity/UserExam.java
export interface UserExam {
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
  state?: number;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 截止时间 | @Schema 截止时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  limitTime?: ExamDateTime;
  /** 及格分 | @Schema 及格分 */
  qualifyScore?: number;
  /** 试卷总分 | @Schema 试卷总分 */
  totalScore?: number;
  /** 是否通过 | @Schema 是否通过 | @Dict exam_result */
  passed?: number;
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
  userExamQuestionList?: UserExamQuestion[];
  leaveOn?: boolean;
  totalLeaveTimes?: number;
  /** @Schema 考试结果展示类型 1：成绩 2：成绩+试卷明细 */
  examResultShowtype?: number;
  /** @Schema 展示截止时间 */
  showDeadline?: number;
  leaveTime?: number;
  userName?: string;
  realName?: string;
  examTitle?: string;
  ewmEnable?: boolean;
  examQrCodeUrl?: string;
  snapOn?: boolean;
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

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/userexamcheat/entity/UserExamCheat.java
export interface UserExamCheat {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户考试id | @Schema 用户考试id */
  userExamId?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 考试id | @Schema 考试id */
  examId?: string;
  /** 作弊类型 | @Schema 作弊类型 */
  cheatType?: number;
  /** 作弊时间 | @Schema 作弊时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  cheatTime?: ExamDateTime;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
  realname?: string;
  cheatTypeName?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/exam/dto/UserExamDTO.java
export interface UserExamDTO {
  /** 答题卡 */
  answerCardList?: Record<string, AnswerCardDTO>[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/userexamquestion/entity/UserExamQuestion.java
export interface UserExamQuestion {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 试卷id | @Schema 试卷id */
  userExamId?: string;
  /** 题目id | @Schema 题目id */
  questionId?: string;
  /** 题目类型 | @Schema 题目类型 */
  questionType?: number;
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
  question?: Question;
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
  subQuestionList?: UserExamQuestion[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/userexamquestionanswer/entity/UserExamQuestionAnswer.java
export interface UserExamQuestionAnswer {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户考试id | @Schema 用户考试id */
  userExamId?: string;
  /** 题目ID | @Schema 题目ID */
  questionId?: string;
  /** 回答项ID | @Schema 回答项ID */
  answerId?: string;
  /** 排序 | @Schema 排序 */
  sort?: number;
  /** 选项标签 | @Schema 选项标签 */
  tag?: string;
  /** 是否正确项 | @Schema 是否正确项 */
  isRight?: boolean;
  /** 是否选中 | @Schema 是否选中 */
  checked?: boolean;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/userexamresult/entity/UserExamResult.java
export interface UserExamResult {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户ID | @Schema 用户ID */
  userId?: string;
  /** 考试ID | @Schema 考试ID */
  examId?: string;
  /** 考试次数 | @Schema 考试次数 */
  tryCount?: number;
  /** 最高分数 | @Schema 最高分数 */
  maxScore?: number;
  /** 是否通过 | @Schema 是否通过 | @Dict exam_result */
  passed?: number;
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

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/userexamresult/entity/vo/UserExamScoreVO.java
export interface UserExamScoreVO {
  /** 考试次数 */
  tryCount?: number;
  /** 最高得分 */
  maxScore?: number;
  /** 是否通过 */
  passed?: number;
  /** 试卷总分 */
  totalScore?: number;
  /** 及格分 */
  qualifyScore?: number;
  /** 试题总数 */
  questionCount?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/userexamsnap/entity/UserExamSnap.java
export interface UserExamSnap {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 考试id | @Schema 考试id */
  examId?: string;
  /** 用户考试id | @Schema 用户考试id */
  userExamId?: string;
  /** 抓拍照片存储路径 | @Schema 抓拍照片存储路径 */
  snapUrl?: string;
  /** 抓拍时间 | @Schema 抓拍时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  snapTime?: ExamDateTime;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: ExamDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ExamDateTime;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/invigilate/entity/dto/WebrtcInvigilateDTO.java
export interface WebrtcInvigilateDTO {
  examId?: string;
  userType?: number;
  offer?: unknown;
  answer?: unknown;
  candidate?: unknown;
  fromUserId?: string;
  toUserId?: string;
  /** 发送给考生的消息 */
  messageContent?: string;
  /** 作弊类型：1:切屏 */
  cheatType?: number;
  userExamId?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/exam/invigilate/entity/WebrtcInvigilateSession.java
export interface WebrtcInvigilateSession {
  examId?: string;
}

