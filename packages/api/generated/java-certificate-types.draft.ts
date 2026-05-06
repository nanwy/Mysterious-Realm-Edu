// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: certificate

export type CertificateDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/certificate/certificate/entity/Certificate.java
export interface Certificate {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 证书名称 | @Schema 证书名称 */
  name?: string;
  /** 证书分类 | @Schema 证书分类 | @Dict cert_type */
  type?: number;
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

// ../exam-backend-master/web/src/main/java/com/ynfy/app/api/v1/entity/dto/CertificateDTO.java
export interface CertificateDTO {
  pageNo?: number;
  pageSize?: number;
  certificateType?: number;
}

// ../exam-backend-master/web/src/main/java/com/ynfy/buss/certificate/usercertificate/entity/UserCertificate.java
export interface UserCertificate {
  /** 主键 | @Schema 主键 */
  id?: string;
  /** 用户id | @Schema 用户id */
  userId?: string;
  /** 证书类型 | @Schema 证书类型 | @Dict cert_type */
  certificateType?: number;
  /** 考试id | @Schema 考试id */
  examId?: string;
  /** 课程id | @Schema 课程id */
  courseId?: string;
  /** 证书id | @Schema 证书id */
  certificateId?: string;
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

