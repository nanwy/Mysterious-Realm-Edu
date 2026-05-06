// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: banner

export type BannerDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/banner/entity/Banner.java
export interface Banner {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 标题 | @Schema 标题 */
  title?: string;
  /** 链接 | @Schema 链接 */
  link?: string;
  /** 图片路径 | @Schema 图片路径 */
  imgUrl?: string;
  /** 视频路径 | @Schema 视频路径 */
  videoUrl?: string;
  /** 媒体类型 | @Schema 媒体类型 | @Dict media_type */
  mediaType?: number;
  /** 子标题 | @Schema 子标题 */
  subTitle?: string;
  /** 链接名称 | @Schema 链接名称 */
  linkName?: string;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** 创建时间 | @Schema 创建时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: BannerDateTime;
  /** 修改时间 | @Schema 修改时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: BannerDateTime;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 修改人 | @Schema 修改人 */
  updateBy?: string;
}

