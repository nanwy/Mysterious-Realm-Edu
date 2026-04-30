export type SearchDateTime = string;
export type SearchIntegerParam = number | string;

export interface SearchPageResponse<TRecord> {
  records: TRecord[];
  total: number;
  size?: number;
  current?: number;
  pages?: number;
  searchCount?: boolean;
}

export interface SearchDTO {
  /** 关键词 */
  keyword?: string;
  /** 查询类型 */
  searchType?: number;
  pageNo?: SearchIntegerParam;
  pageSize?: SearchIntegerParam;
  username?: string;
  searchTypes?: string;
}

export interface SearchHistory {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 搜索关键字 | @Schema 搜索关键字 */
  keyword?: string;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: SearchDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: SearchDateTime;
  /** 关键词搜索的次数 */
  searchNum?: number;
}

export interface SearchResultRecord {
  /** 数据id */
  id?: string;
  /** 查询类型 */
  searchType?: number;
  /** 描述 */
  resume?: string;
  /** 文本标题 */
  title?: string;
}

export interface SearchListResponse {
  pageList: SearchPageResponse<SearchResultRecord>;
  groupBy?: Record<string, SearchResultRecord[]>;
}

export interface HotSearchCountRequest {
  limitCount?: number;
}

export type SearchListRequest = SearchDTO;
export type HotSearchCountResponse = SearchHistory[];
export type MySearchHistoryResponse = string[];
