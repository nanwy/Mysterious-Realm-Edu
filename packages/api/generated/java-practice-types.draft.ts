// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: practice

export type PracticeDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/practice/userpractice/enums/PracticeMode.java
export enum PracticeMode {
  SX = 1, // 顺序练习
  SJ = 2, // 随机练习
  TX = 3, // 题型练习
}
export const PracticeModeOptions = [
  { label: "顺序练习", value: PracticeMode.SX },
  { label: "随机练习", value: PracticeMode.SJ },
  { label: "题型练习", value: PracticeMode.TX },
] as const;

// ../exam-backend-master/web/src/main/java/com/ynfy/app/api/v1/entity/dto/PracticeDTO.java
export interface PracticeDTO {
  repositoryId?: string;
  repositoryName?: string;
  practiceName?: string;
  /** 练习模式 */
  mode?: number;
  questionType?: number;
  pageNo?: number;
  pageSize?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/practice/userpractice/entity/dto/PracticeQuestionDTO.java
export interface PracticeQuestionDTO {
  /** 题目id */
  id?: string;
  /** 题目类型 */
  type?: number;
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

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/practice/userpractice/entity/UserPractice.java
export interface UserPractice {
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
  mode?: number;
  /** 题型 | @Schema 题型 */
  questionType?: number;
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

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/practice/userpractice/entity/dto/UserPracticeDTO.java
export interface UserPracticeDTO {
  userId?: string;
  /** 题库id */
  repositoryId?: string;
  /** 练习模式：1.顺序练习，2.随机练习，3.题型练习 */
  mode?: number;
  /** 题型 */
  questionType?: number;
  questionList?: PracticeQuestionDTO[];
  /** 答案 */
  answers?: ExamAnswerDTO[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/practice/userpracticequestion/entity/UserPracticeQuestion.java
export interface UserPracticeQuestion {
  /** id | @Schema id */
  id?: string;
  /** 试卷id | @Schema 试卷id */
  userPracticeId?: string;
  /** 题目id | @Schema 题目id */
  questionId?: string;
  /** 题目类型 | @Schema 题目类型 */
  questionType?: number;
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
  question?: Question;
  questionTypeName?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/practice/userpractice/entity/dto/UserPracticeResultDTO.java
export interface UserPracticeResultDTO {
  userPractice?: UserPractice;
  questionList?: UserPracticeQuestion[];
}

