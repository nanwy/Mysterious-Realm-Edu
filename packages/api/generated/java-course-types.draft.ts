// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: course

export type CourseDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/coursecatalog/enums/CatalogType.java
export enum CatalogType {
  CATALOG = 1, // 目录
  TASK = 2, // 任务
}
export const CatalogTypeOptions = [
  { label: "目录", value: CatalogType.CATALOG },
  { label: "任务", value: CatalogType.TASK },
] as const;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/coursecatalog/enums/ResourceType.java
export enum ResourceType {
  VIDEO = 1, // 视频
  FILE = 2, // 文档
}
export const ResourceTypeOptions = [
  { label: "视频", value: ResourceType.VIDEO },
  { label: "文档", value: ResourceType.FILE },
] as const;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/auditrecord/entity/dto/AuditDTO.java
export interface AuditDTO {
  /** 要审核的数据id */
  id?: string;
  /** 审核意见 */
  auditOpinion?: string;
  /** 审核结论 1:通过 2：不通过 */
  auditResult?: number;
  /** 审核时间 */
  auditTime?: CourseDateTime;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/auditrecord/entity/AuditRecord.java
export interface AuditRecord {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 审核人id | @Schema 审核人id */
  auditUserId?: string;
  /** 审核类型 | @Schema 审核类型 */
  auditType?: number;
  /** 要审核的数据id | @Schema 要审核的数据id */
  dataId?: string;
  /** 审核意见 | @Schema 审核意见 */
  auditOpinion?: string;
  /** 审核结论 | @Schema 审核结论 */
  auditResult?: number;
  /** 审核时间 | @Schema 审核时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  auditTime?: CourseDateTime;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CourseDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CourseDateTime;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/usercoursecatalog/entity/vo/CatalogTimeVO.java
export interface CatalogTimeVO {
  /** @Schema 课程id */
  courseId?: string;
  /** @Schema 课程任务id */
  courseCatalogId?: string;
  /** /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  startLearnTime?: CourseDateTime;
  /** @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  endLearnTime?: CourseDateTime;
  /** 当前视频进度条 | @Schema 当前视频进度条 */
  currentProcess?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/course/entity/Course.java
export interface Course {
  /** id | @Schema id */
  id?: string;
  /** 课程名称 | @Schema 课程名称 */
  name?: string;
  /** 课程分类id | @Schema 课程分类id */
  categoryId?: string;
  /** 课程分类名称 | @Schema 课程分类名称 */
  categoryName?: string;
  /** 课程摘要 | @Schema 课程摘要 */
  summary?: string;
  /** 课程介绍 | @Schema 课程介绍 */
  description?: string;
  /** 是否免费 | @Schema 是否免费 */
  isFree?: boolean;
  /** 价格 | @Schema 价格 */
  price?: number;
  /** 封面 | @Schema 封面 */
  cover?: string;
  /** 课时 | @Schema 课时 */
  classHour?: string;
  /** 点击量 | @Schema 点击量 */
  clickNum?: number;
  /** 评论数 | @Schema 评论数 */
  commentNum?: number;
  /** 收藏数 | @Schema 收藏数 */
  collectNum?: number;
  /** 开始时间 | @Schema 开始时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  startTime?: CourseDateTime;
  /** 截止时间 | @Schema 截止时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  endTime?: CourseDateTime;
  /** 是否必修 | @Schema 是否必修 */
  mustLearn?: boolean;
  /** 考试id | @Schema 考试id */
  examId?: string;
  /** 考试名称 | @Schema 考试名称 */
  examTitle?: string;
  /** 学习权限 1公开2部门3定员 | @Schema 学习权限 | @Dict course_open_type */
  openType?: number;
  /** 学员 | @Schema 学员 */
  learner?: string;
  /** 离开多少分钟弹窗 | @Schema 离开多少分钟弹窗 */
  leaveTimeAlert?: number;
  /** 视频是否禁止拖动 | @Schema 视频是否禁止拖动 */
  videoNodragg?: boolean;
  /** 任务是否顺序学习 | @Schema 任务是否顺序学习 */
  taskSequeUnlock?: boolean;
  /** 切屏后停止计算学习进度 | @Schema 切屏后停止计算学习进度 */
  cutScreen?: boolean;
  /** 弹窗防呆校验 | @Schema 弹窗防呆校验 */
  leaveOn?: boolean;
  /** 积分 */
  integral?: number;
  /** 讲师id | @Schema 讲师id */
  teacherId?: string;
  /** 讲师姓名 | @Schema 讲师姓名 */
  teacherName?: string;
  /** @Schema 讲师介绍 */
  teacherIntroduce?: string;
  /** @Schema 讲师头像 */
  teacherAvatar?: string;
  /** @Schema 讲师岗位 */
  teacherPost?: string;
  /** @Schema 证书 */
  certificateId?: string;
  /** 问卷id | @Schema 问卷id */
  questionnaireId?: string;
  /** 是否直播课程 | @Schema 是否直播课程 */
  isLive?: boolean;
  /** 直播课程必学时长 | @Schema 直播课程必学时长 */
  liveMustLearnTime?: number;
  /** rtmp推流地址 | @Schema rtmp推流地址 */
  rtmpPushUrl?: string;
  /** webRTC推流地址 | @Schema webRTC推流地址 */
  webrtcPushUrl?: string;
  /** rtmp播放地址 | @Schema rtmp播放地址 */
  rtmpPlayUrl?: string;
  /** webrtc播放地址 | @Schema webrtc播放地址 */
  webrtcPlayUrl?: string;
  /** hls播放地址 | @Schema hls播放地址 */
  hlsPlayUrl?: string;
  /** 状态 | @Schema 状态 | @Dict publish_status */
  status?: number;
  /** 所有者 | @Schema 所有者 */
  owner?: string;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CourseDateTime;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CourseDateTime;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** 目录 */
  catalogList?: CourseCatalog[];
  /** 任务数 */
  taskNum?: number;
  /** 已经学完的 */
  finishNum?: number;
  /** 已经学过的 */
  studyNum?: number;
  /** 课程学习进度 */
  courseStudyProcess?: number;
  /** 学习人数 */
  learnerNumber?: number;
  /** @Dict perform_state */
  state?: number;
  /** 是否点击或者阅读 */
  clickEd?: boolean;
  /** 是否评论 */
  commentEd?: boolean;
  /** 是否收藏 */
  collectEd?: boolean;
  /** 用户总学时 */
  totalLearnTime?: number;
  evaluationNumber?: number;
  /** 课程学习者id */
  studyUserIds?: string;
  /** 课程学习者头像 */
  studyUserAvatarList?: string[];
  /** @Schema 课程考试是否通过 */
  examPassed?: number;
  /** 用户考试分数 */
  userExamScore?: number;
  /** 是否直播中 */
  liveIng?: boolean;
  categoryIdList?: string[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/coursecatalog/entity/CourseCatalog.java
export interface CourseCatalog {
  /** id | @Schema id */
  id?: string;
  /** 父id | @Schema 父id */
  parentId?: string;
  /** 课程id | @Schema 课程id */
  courseId?: string;
  /** 目录或任务名称 | @Schema 目录或任务名称 */
  name?: string;
  /** 目录介绍 | @Schema 目录介绍 */
  catalogIntro?: string;
  /** 1:目录，2:任务 | @Schema 1:目录，2:任务 */
  type?: number;
  /** 资源类型  1:视频，2:文档 | @Schema 资源类型  1:视频，2:文档 */
  resourceType?: number;
  /** 资源id | @Schema 资源id */
  resourceId?: string;
  /** 视频时长 | @Schema 视频时长 */
  videoHour?: number;
  /** 必学时长 | @Schema 必学时长 */
  mustLearnTime?: number;
  /** @Schema 排序 */
  sort?: number;
  /** 是否试看 | @Schema 是否试看 */
  tryToSee?: boolean;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CourseDateTime;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CourseDateTime;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  childList?: CourseCatalog[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/category/entity/CourseCategory.java
export interface CourseCategory {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 名称 | @Schema 名称 */
  name?: string;
  /** 图片路径 | @Schema 图片路径 */
  imageUrl?: string;
  /** 父级节点 | @Schema 父级节点 */
  pid?: string;
  /** 排序 | @Schema 排序 */
  sort?: number;
  /** 是否有子节点 | @Schema 是否有子节点 | @Dict yn */
  hasChild?: string;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CourseDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CourseDateTime;
  children?: CourseCategory[];
}

// ../exam-backend-master/web/src/main/java/com/ynfy/app/api/v1/entity/dto/CourseCategoryDTO.java
export interface CourseCategoryDTO {
  name?: string;
  pageNo?: number;
  pageSize?: number;
  hasQuery?: string;
  pid?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/app/api/v1/entity/dto/CourseDTO.java
export interface CourseDTO {
  name?: string;
  pageNo?: number;
  pageSize?: number;
  categoryId?: string;
  taskName?: string;
  orderByType?: string;
  /** 排序字段 */
  orderField?: string;
  /** 排序方式 */
  orderSort?: string;
  /** 推荐类型 */
  recommendType?: number;
  userId?: string;
  /** 操作类型 */
  operationType?: number;
  /** 数据类型 */
  dataType?: number;
  /** 课程类型  1:公开课，2.我的课程 */
  courseType?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/coursestatistics/entity/CourseStatistics.java
export interface CourseStatistics {
  /** id | @Schema id */
  id?: string;
  /** 课程id | @Schema 课程id */
  courseId?: string;
  /** 课程名称 | @Schema 课程名称 */
  courseName?: string;
  /** 应学人数 | @Schema 应学人数 */
  mustLearner?: number;
  /** 实学人数 | @Schema 实学人数 */
  actualLearner?: number;
  /** 未学人数 | @Schema 未学人数 */
  missLearner?: number;
  /** 学完人数 | @Schema 学完人数 */
  finishedNum?: number;
  /** 未学完人数 | @Schema 未学完人数 */
  noFinishedNum?: number;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CourseDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CourseDateTime;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/usercoursecatalog/entity/vo/CourseStudyProcessVO.java
export interface CourseStudyProcessVO {
  courseId?: string;
  courseName?: string;
  /** 任务数 */
  taskNum?: number;
  /** 已经学完的 */
  finishNum?: number;
  /** 已经学过的 */
  studyNum?: number;
  totalLearnTime?: number;
  recentTime?: CourseDateTime;
  learnProcess?: number;
  isLive?: boolean;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/mall/ordergoodsevaluation/entity/vo/GradeNumberVO.java
export interface GradeNumberVO {
  grade?: number;
  number?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/mall/ordergoodsevaluation/entity/OrderGoodsEvaluation.java
export interface OrderGoodsEvaluation {
  /** ID | @Schema ID */
  id?: string;
  /** 订单号 | @Schema 订单号 */
  orderSn?: string;
  /** 订单商品id | @Schema 订单商品id */
  orderGoodsId?: string;
  /** 商品类型 | @Schema 商品类型 | @Dict goods_type */
  goodsType?: number;
  /** 评价人ID | @Schema 评价人ID */
  userId?: string;
  /** 商品ID | @Schema 商品ID */
  goodsId?: string;
  /** 商品名称 | @Schema 商品名称 */
  goodsName?: string;
  /** 商品图片 | @Schema 商品图片 */
  goodsImage?: string;
  /** 卖家ID | @Schema 卖家ID */
  sellerId?: string;
  /** 卖家名称 | @Schema 卖家名称 */
  sellerName?: string;
  /** 综合评价 | @Schema 综合评价 */
  ceScore?: number;
  /** 好中差评 | @Schema 好中差评 */
  grade?: string;
  /** 评价图片 | @Schema 评价图片 */
  images?: string;
  /** 评价内容 | @Schema 评价内容 */
  content?: string;
  /** 评论父级的id | @Schema 评论父级的id */
  parentId?: string;
  /** 被回复评论的id | @Schema 被回复评论的id */
  replyId?: string;
  /** 被回复人的id | @Schema 被回复人的id */
  replyUserId?: string;
  /** 用户是否点赞 | @Schema 用户是否点赞 */
  isLike?: boolean;
  /** 点赞数统计 | @Schema 点赞数统计 */
  likeCount?: number;
  /** 状态 | @Schema 状态 */
  status?: number;
  /** 审核记录id */
  auditRecordId?: string;
  /** 审批意见 */
  auditOpinion?: string;
  /** 审核时间 */
  auditTime?: CourseDateTime;
  /** 创建者 | @Schema 创建者 */
  createBy?: string;
  /** 创建时间 | @Schema 创建时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CourseDateTime;
  /** 更新者 | @Schema 更新者 */
  updateBy?: string;
  /** 更新时间 | @Schema 更新时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CourseDateTime;
  realname?: string;
  avatar?: string;
  replyName?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/mall/dto/OrderGoodsEvaluationDTO.java
export interface OrderGoodsEvaluationDTO {
  goodsId?: string;
  goodsType?: number;
  pageNo?: number;
  pageSize?: number;
  /** 好中差评 */
  grade?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/usercoursecatalog/entity/UserCourseCatalog.java
export interface UserCourseCatalog {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 任务id | @Schema 任务id */
  courseCatalogId?: string;
  /** 已学时长 | @Schema 已学时长 */
  totalLearnTime?: number;
  /** 学习进度 | @Schema 学习进度 */
  learnProcess?: number;
  /** 当前视频进度条 | @Schema 当前视频进度条 */
  currentProcess?: number;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CourseDateTime;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CourseDateTime;
  courseName?: string;
  taskName?: string;
  courseStudyProcess?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/usercourselive/entity/UserCourseLive.java
export interface UserCourseLive {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 课程id | @Schema 课程id */
  courseId?: string;
  /** 已学时长 | @Schema 已学时长 */
  totalLearnTime?: number;
  /** 学习进度 | @Schema 学习进度 */
  learnProcess?: number;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CourseDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CourseDateTime;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/usercoursecatalog/entity/vo/UserCourseStudyVO.java
export interface UserCourseStudyVO {
  courseId?: string;
  username?: string;
  realname?: string;
  /** 任务数 */
  taskNum?: number;
  /** 已经学完的 */
  finishNum?: number;
  /** 已经学过的 */
  studyNum?: number;
  /** 已学时长 */
  totalLearnTime?: number;
  courseStudyProcess?: number;
  totalLearnTimeText?: string;
  learnProcess?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/course/usercoursecatalog/entity/dto/UserStudyDTO.java
export interface UserStudyDTO {
  courseName?: string;
  taskName?: string;
  /** 已学时长 */
  totalLearnTime?: number;
  /** 学习进度 */
  learnProcess?: number;
  /** 最近学习 */
  lastLearnTime?: CourseDateTime;
}

