// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: article

export type ArticleDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/article/entity/Article.java
export interface Article {
  /** id | @Schema id */
  id?: string;
  /** 封面 | @Schema 封面 */
  coverImg?: string;
  /** 所属分类 | @Schema 所属分类 | @Dict news_type */
  categoryId?: number;
  /** 标题 | @Schema 标题 */
  title?: string;
  /** 摘要 | @Schema 摘要 */
  remark?: string;
  /** 内容 | @Schema 内容 */
  content?: string;
  /** 标签 | @Schema 标签 */
  tag?: string;
  /** 发布时间 | @Schema 发布时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  publishTime?: ArticleDateTime;
  /** 状态：1:已发布，0:草稿 | @Schema 状态：1:已发布，0:草稿 | @Dict publish_status */
  status?: number;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd */
  createTime?: ArticleDateTime;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: ArticleDateTime;
  /** 点击量 | @Schema 点击量 */
  clickNum?: number;
  /** 评论数 | @Schema 评论数 */
  commentNum?: number;
  /** 收藏数 | @Schema 收藏数 */
  collectNum?: number;
  /** 热度 | @Schema 热度 */
  hotDegree?: java.lang.Integer;
  /** 是否点击或者阅读 */
  clickEd?: boolean;
  /** 是否评论 */
  commentEd?: boolean;
  /** /** 是否收藏 */
  collectEd?: boolean;
  createByName?: string;
  avatar?: string;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/app/api/v1/entity/dto/ArticleDTO.java
export interface ArticleDTO {
  title?: string;
  pageNo?: number;
  pageSize?: number;
  categoryId?: string;
  selectDate?: string;
  /** 推荐类型 */
  recommendType?: number;
  userId?: string;
  notIncludeIdList?: string[];
}

