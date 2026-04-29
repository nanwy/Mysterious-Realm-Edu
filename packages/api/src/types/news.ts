export type NewsDateTime = string;
export type NewsIntegerParam = number | string;

export enum NEWS_PUBLISH_STATUS {
  DRAFT = 0,
  PUBLISHED = 1,
}

export interface NewsListRequest {
  title?: string;
  pageNo?: NewsIntegerParam;
  pageSize?: NewsIntegerParam;
  categoryId?: string;
  selectDate?: string;
  /** 推荐类型 */
  recommendType?: number;
  userId?: string;
  notIncludeIdList?: string[];
}

export interface NewsArticle {
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
  publishTime?: NewsDateTime;
  /** 状态：1:已发布，0:草稿 | @Schema 状态：1:已发布，0:草稿 | @Dict publish_status */
  status?: NEWS_PUBLISH_STATUS;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** createBy | @Schema createBy */
  createBy?: string;
  /** createTime | @Schema createTime | @JsonFormat yyyy-MM-dd */
  createTime?: NewsDateTime;
  /** updateBy | @Schema updateBy */
  updateBy?: string;
  /** updateTime | @Schema updateTime | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: NewsDateTime;
  /** 点击量 | @Schema 点击量 */
  clickNum?: number;
  /** 评论数 | @Schema 评论数 */
  commentNum?: number;
  /** 收藏数 | @Schema 收藏数 */
  collectNum?: number;
  /** 热度 | @Schema 热度 */
  hotDegree?: number;
  /** 是否点击或者阅读 */
  clickEd?: boolean;
  /** 是否评论 */
  commentEd?: boolean;
  /** 是否收藏 */
  collectEd?: boolean;
  createByName?: string;
  avatar?: string;
}

export interface NewsPageResponse<TRecord> {
  records: TRecord[];
  total: number;
  size?: number;
  current?: number;
  pages?: number;
  searchCount?: boolean;
}

export type NewsListResponse = NewsPageResponse<NewsArticle>;
export type NewsSearchResponse = NewsArticle[];
export type NewsDetailResponse = NewsArticle;

export interface NewsQueryState {
  page: number;
  keyword: string;
}

export interface NewsPageData {
  recommended: NewsArticle[];
  recommendedError: string | null;
  hot: NewsArticle[];
  hotError: string | null;
  items: NewsArticle[];
  total: number;
}

export interface NewsDetailData {
  article: NewsArticle | null;
  hotNews: NewsArticle[];
}
