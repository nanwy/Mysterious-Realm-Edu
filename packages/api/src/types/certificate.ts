export type CertificateDateTime = string;
export type CertificateIntegerParam = number | string;

export enum CERTIFICATE_TYPE_CODE {
  COURSE = 1,
  EXAM = 2,
}

export type CertificateTypeCode =
  | CERTIFICATE_TYPE_CODE
  | `${CERTIFICATE_TYPE_CODE}`;

export interface CertificateListRequest {
  pageNo?: CertificateIntegerParam;
  pageSize?: CertificateIntegerParam;
  certificateType?: CertificateTypeCode;
}

export interface CertificateGenerateRequest {
  certificateId: string | number;
  examId: string | number;
  courseId: string | number;
}

export interface CertificateDetail {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 证书名称 | @Schema 证书名称 */
  name?: string;
  /** 证书分类 | @Schema 证书分类 | @Dict cert_type */
  type?: CERTIFICATE_TYPE_CODE;
  /** 颁发机构 | @Schema 颁发机构 */
  issuer?: string;
  /** 有效期（年） | @Schema 有效期（年） */
  validPeriod?: number;
  /** 证书模版 | @Schema 证书模版 */
  template?: string;
  /** 备注 | @Schema 备注 */
  remark?: string;
  /** 所属部门 | @Schema 所属部门 */
  sysOrgCode?: string;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CertificateDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CertificateDateTime;
}

export interface UserCertificateDetail {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户id | @Schema 用户id | @Dict sys_user.realname */
  userId?: string;
  userId_dictText?: string;
  /** 证书类型 | @Schema 证书类型 | @Dict cert_type */
  certificateType?: CERTIFICATE_TYPE_CODE;
  certificateType_dictText?: string;
  /** 考试id | @Schema 考试id | @Dict exam.title */
  examId?: string;
  examId_dictText?: string;
  /** 课程id | @Schema 课程id | @Dict course.name */
  courseId?: string;
  courseId_dictText?: string;
  /** 证书id | @Schema 证书id | @Dict certificate.name */
  certificateId?: string;
  certificateId_dictText?: string;
  /** 证书路径 | @Schema 证书路径 */
  certificatePath?: string;
  /** 创建人 | @Schema 创建人 */
  createBy?: string;
  /** 创建日期 | @Schema 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: CertificateDateTime;
  /** 更新人 | @Schema 更新人 */
  updateBy?: string;
  /** 更新日期 | @Schema 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: CertificateDateTime;
  realname?: string;
}

export interface CertificatePageResponse<TRecord> {
  records: TRecord[];
  total: number;
  size?: number;
  current?: number;
  pages?: number;
  searchCount?: boolean;
}

export type CertificateGenerateResponse = null;
export type UserCertificateResponse = UserCertificateDetail | null;
export type UserCertificateListResponse =
  CertificatePageResponse<UserCertificateDetail>;
