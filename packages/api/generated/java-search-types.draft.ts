// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: search

export type SearchDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/app/api/v1/entity/dto/SearchDTO.java
export interface SearchDTO {
  /** 关键词 */
  keyword?: string;
  /** 查询类型 */
  searchType?: number;
  pageNo?: number;
  pageSize?: number;
  username?: string;
  searchTypes?: string;
}

