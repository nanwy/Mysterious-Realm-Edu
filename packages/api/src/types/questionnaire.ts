export type QuestionnaireDateTime = string;
export type QuestionnaireIntegerParam = number | string;
export type QuestionnaireId = string | number;

export interface QuestionnaireListRequest {
  /** 当前页码 */
  pageNo?: QuestionnaireIntegerParam;
  /** 每页条数 */
  pageSize?: QuestionnaireIntegerParam;
  /** 问卷名称 */
  name?: string;
  /** 问卷类型 */
  type?: QuestionnaireIntegerParam;
}

export interface QuestionnaireRecord {
  /** 主键 */
  id?: string;
  /** 问卷名称 */
  name?: string;
  /** 问卷说明 */
  remark?: string;
  /** 题目数量 */
  questionNum?: number;
  /** 答卷数量 */
  answerNum?: number;
  /** 问卷类型 */
  type?: QuestionnaireIntegerParam;
  /** 问卷类型文本 */
  type_dictText?: string;
  /** 状态文本 */
  status_dictText?: string;
  /** 发布状态文本 */
  publishStatus_dictText?: string;
  /** 答题地址 */
  answerAddress?: string;
  /** 创建时间 */
  createTime?: QuestionnaireDateTime;
  /** 更新时间 */
  updateTime?: QuestionnaireDateTime;
  /** 创建人 */
  createBy?: string;
  /** 更新人 */
  updateBy?: string;
}

export interface QuestionnairePageResponse<TRecord> {
  records: TRecord[];
  total: number;
  size?: number;
  current?: number;
  pages?: number;
  searchCount?: boolean;
}

export type QuestionnaireListResponse =
  QuestionnairePageResponse<QuestionnaireRecord>;
export type QuestionnaireDetailResponse = QuestionnaireRecord;
