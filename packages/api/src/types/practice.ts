import type {
  ExamAnswerDetail,
  ExamQuestionDetail,
  ExamQuestionType,
} from "./exam";

export type PracticeDateTime = string;
export type PracticeIntegerParam = number | string;
export type PracticeId = string | number;

export enum PRACTICE_MODE {
  SEQUENCE = 1,
  RANDOM = 2,
  QUESTION_TYPE = 3,
}

export type PracticeModeCode = PRACTICE_MODE;

export const PRACTICE_MODE_OPTIONS = [
  { label: "顺序练习", value: PRACTICE_MODE.SEQUENCE },
  { label: "随机练习", value: PRACTICE_MODE.RANDOM },
  { label: "题型练习", value: PRACTICE_MODE.QUESTION_TYPE },
] as const satisfies ReadonlyArray<{
  label: string;
  value: PracticeModeCode;
}>;

export interface PracticePageResponse<TRecord> {
  records: TRecord[];
  total: number;
  size?: number;
  current?: number;
  pages?: number;
  searchCount?: boolean;
}

export interface PracticeQuestionTypeCountDetail {
  /** 类型 | @Schema 类型 | @Dict question_type */
  type?: ExamQuestionType;
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

export interface PracticeRepositoryDetail {
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
  createTime?: PracticeDateTime;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd */
  updateTime?: PracticeDateTime;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** 题目数量 */
  num?: number;
  questionDTOList?: PracticeQuestionTypeCountDetail[];
  /** 题目备注 */
  questionRemark?: string;
}

export interface PracticeRepositoryListRequest {
  /** 当前页码 */
  pageNo?: PracticeIntegerParam;
  /** 每页条数 */
  pageSize?: PracticeIntegerParam;
  /** 题库名称 */
  title?: string;
  /** 题库编码 */
  code?: string;
  /** 题库备注 */
  remark?: string;
}

export interface PracticeRepositoryDetailRequest {
  id: PracticeId;
}

export interface PracticeQuestionListRequest {
  pageNo?: PracticeIntegerParam;
  pageSize?: PracticeIntegerParam;
  repositoryId: PracticeId;
  questionType?: ExamQuestionType;
  mode: PracticeModeCode;
}

export interface PracticeQuestionSubmitDetail {
  /** 题目id */
  id?: string;
  /** 题目类型 */
  type?: ExamQuestionType;
  /** 所属题库 */
  repositoryId?: string;
  /** 是否已答 */
  answered?: boolean;
  /** 是否正确 */
  isRight?: boolean;
  /** 题目序号 */
  questionIndex?: string;
  /** 填空题答案 */
  blankAnswer?: string;
}

export interface UserPracticeDetail {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 练习名称 | @Schema 练习名称 */
  practiceName?: string;
  /** 练习类型，1.题库练习，2.每日一练 | @Schema 练习类型，1.题库练习，2.每日一练 */
  type?: number;
  /** 题库id | @Schema 题库id */
  repositoryId?: string;
  /** 练习模式：1.顺序练习，2.随机练习，3.题型练习 | @Schema 练习模式：1.顺序练习，2.随机练习，3.题型练习 */
  mode?: PracticeModeCode;
  /** 题型 | @Schema 题型 */
  questionType?: ExamQuestionType;
  /** 答对数量 | @Schema 答对数量 */
  rightNumber?: number;
  /** 总题数量 | @Schema 总题数量 */
  totalNumber?: number;
  /** 正确率 | @Schema 正确率 */
  accuracy?: number;
  /** 提交时间 | @Schema 提交时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  commitTime?: PracticeDateTime;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: PracticeDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: PracticeDateTime;
  repositoryName?: string;
}

export interface UserPracticeSubmitRequest {
  userId?: string;
  /** 题库id */
  repositoryId?: string;
  /** 练习模式：1.顺序练习，2.随机练习，3.题型练习 */
  mode?: PracticeModeCode;
  /** 题型 */
  questionType?: ExamQuestionType;
  questionList?: PracticeQuestionSubmitDetail[];
  /** 答案 */
  answers?: ExamAnswerDetail[];
}

export interface UserPracticeQuestionDetail {
  /** id | @Schema id */
  id?: string;
  /** 试卷id | @Schema 试卷id */
  userPracticeId?: string;
  /** 题目id | @Schema 题目id */
  questionId?: string;
  /** 题目类型 | @Schema 题目类型 */
  questionType?: ExamQuestionType;
  /** 问题排序 | @Schema 问题排序 */
  sort?: number;
  /** 是否已答 | @Schema 是否已答 */
  answered?: boolean;
  /** 是否答对 | @Schema 是否答对 */
  isRight?: boolean;
  /** 答案 | @Schema 答案 */
  answer?: string;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: PracticeDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: PracticeDateTime;
  question?: ExamQuestionDetail;
  questionTypeName?: string;
}

export interface UserPracticeResultDetail {
  userPractice?: UserPracticeDetail;
  questionList?: UserPracticeQuestionDetail[];
}

export interface UserPracticeListRequest {
  pageNo?: PracticeIntegerParam;
  pageSize?: PracticeIntegerParam;
  /** 练习名称 */
  practiceName?: string;
  /** 练习类型，1.题库练习，2.每日一练 */
  type?: number;
  /** 题库id */
  repositoryId?: string;
  /** 练习模式：1.顺序练习，2.随机练习，3.题型练习 */
  mode?: PracticeModeCode;
  /** 题型 */
  questionType?: ExamQuestionType;
}

export type PracticeRepositoryListResponse =
  PracticePageResponse<PracticeRepositoryDetail>;
export type PracticeRepositoryDetailResponse = PracticeRepositoryDetail | null;
export type PracticeQuestionListResponse =
  PracticePageResponse<ExamQuestionDetail>;
export type UserPracticeListResponse = PracticePageResponse<UserPracticeDetail>;
export type UserPracticeRecentResponse = UserPracticeDetail[];
export type UserPracticeSubmitResponse = string;
export type UserPracticeResultResponse = UserPracticeResultDetail | null;
