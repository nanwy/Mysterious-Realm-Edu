export type AuthDateTime = string;

export interface AuthLoginRequest {
  /** 账号 | @Schema 账号 */
  username: string;
  /** 密码 | @Schema 密码 */
  password: string;
  /** 登录部门 | @Schema 登录部门 */
  loginOrgCode?: string;
  /** 验证码 | @Schema 验证码 */
  captcha?: string;
  /** 验证码key | @Schema 验证码key */
  checkKey?: string;
  /** 是否校验验证码 */
  checkCaptcha?: boolean;
}

export interface AuthCaptchaRequest {
  key: string;
}

export interface AuthDepart {
  /** ID */
  id?: string;
  /** 父机构ID */
  parentId?: string;
  /** 机构/部门名称 */
  departName?: string;
  /** 机构/部门路径名称（非持久化字段） */
  departPathName?: string;
  /** 英文名 */
  departNameEn?: string;
  /** 缩写 */
  departNameAbbr?: string;
  /** 排序 */
  departOrder?: number;
  /** 描述 */
  description?: string;
  /** 机构类别 1=公司，2=组织机构，3=岗位 4=子公司 */
  orgCategory?: string;
  /** 机构类型 */
  orgType?: string;
  /** 机构编码 */
  orgCode?: string;
  /** 手机号 */
  mobile?: string;
  /** 传真 */
  fax?: string;
  /** 地址 */
  address?: string;
  /** 备注 */
  memo?: string;
  /** 状态（1启用，0不启用） | @Dict depart_status */
  status?: string;
  /** 删除状态（0，正常，1已删除） | @Dict del_flag */
  delFlag?: string;
  /** 创建人 */
  createBy?: string;
  /** 创建日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: AuthDateTime;
  /** 更新人 */
  updateBy?: string;
  /** 更新日期 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  updateTime?: AuthDateTime;
  /** 租户ID */
  tenantId?: number;
  /** 是否有叶子节点: 1是0否 */
  izLeaf?: number;
  /** 职级id | @Dict sys_position.id -> name */
  positionId?: string;
  /** 部门岗位id | @Dict sys_depart.id -> depart_name */
  depPostParentId?: string;
}

export interface AuthTenant {
  /** 编码 */
  id?: number;
  /** 名称 */
  name?: string;
  /** 创建人 | @Dict sys_user.username -> realname */
  createBy?: string;
  /** 创建时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  createTime?: AuthDateTime;
  /** 开始时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  beginDate?: AuthDateTime;
  /** 结束时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  endDate?: AuthDateTime;
  /** 状态 1正常 0冻结 | @Dict tenant_status */
  status?: number;
  /** 所属行业 | @Dict trade */
  trade?: string;
  /** 公司规模 | @Dict company_size */
  companySize?: string;
  /** 公司地址 */
  companyAddress?: string;
  /** 公司logo */
  companyLogo?: string;
  /** 门牌号 */
  houseNumber?: string;
  /** 工作地点 */
  workPlace?: string;
  /** 二级域名(暂时无用,预留字段) */
  secondaryDomain?: string;
  /** 登录背景图片(暂时无用，预留字段) */
  loginBkgdImg?: string;
  /** 职级 | @Dict company_rank */
  position?: string;
  /** 部门 | @Dict company_department */
  department?: string;
}

export interface AuthUser {
  /** id */
  id?: string;
  /** 登录账号 */
  username?: string;
  /** 真实姓名 */
  realname?: string;
  /** 所属部门名称 */
  orgCodeTxt?: string;
  /** 头像 */
  avatar?: string;
  /** 生日 | @JsonFormat yyyy-MM-dd */
  birthday?: AuthDateTime;
  /** 性别（1：男 2：女） | @Dict sex */
  sex?: number;
  /** 电子邮件 */
  email?: string;
  /** 电话 */
  phone?: string;
  /** 身份证 */
  idCard?: string;
  /** 登录选择部门编码 */
  orgCode?: string;
  /** 登录选择租户ID */
  loginTenantId?: number;
  /** 状态(1：正常  2：冻结 ） | @Dict user_status */
  status?: number;
  /** 删除状态（0，正常，1已删除） */
  delFlag?: number;
  /** 工号，唯一键 */
  workNo?: string;
  /** 职务，关联职务表 | @Dict sys_position.id -> name */
  post?: string;
  /** 积分 */
  integral?: number;
  /** 座机号 */
  telephone?: string;
  /** 创建人 */
  createBy?: string;
  /** 创建时间 */
  createTime?: AuthDateTime;
  /** 更新人 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: AuthDateTime;
  /** 同步工作流引擎1同步0不同步 */
  activitiSync?: number;
  /** 身份（0 普通成员 1 上级） */
  userIdentity?: number;
  /** 负责部门 | @Dict sys_depart.id -> depart_name */
  departIds?: string;
  /** 多租户ids临时用，不持久化数据库 */
  relTenantIds?: string;
  /** 设备id uniapp推送用 */
  clientId?: string;
  /** 登录首页地址 */
  homePath?: string;
  /** 职位名称 */
  postText?: string;
  /** 流程状态 */
  bpmStatus?: string;
  /** 是否已经绑定第三方 */
  izBindThird?: boolean;
  /** 个性签名 */
  sign?: string;
  /** 是否开启个性签名 */
  signEnable?: number;
  /** 主岗位 | @Dict sys_depart.id -> depart_name */
  mainDepPostId?: string;
  /** 兼职岗位 | @Dict sys_depart.id -> depart_name */
  otherDepPostId?: string;
  /** 职务(字典) | @Dict user_position */
  positionType?: string;
  /** 讲师介绍 */
  teacherIntroduce?: string;
  /** 微信小程序openid */
  mpOpenId?: string;
  /** app openid */
  appOpenId?: string;
  /** 人脸核验照片 */
  faceImage?: string;
  /** 人脸核验照片base64 */
  imageBase64?: string;
  /** 最后登录ip */
  lastLoginIp?: string;
  /** 最后登录ip归属地 */
  lastIpLocation?: string;
  /** 最后登录时间 */
  lastLoginTime?: AuthDateTime;
  /** 移动端主题 */
  mainTheme?: number;
  /** 最后密码修改时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  lastPwdUpdateTime?: AuthDateTime;
  /** 登录时，选择的部门，临时用，不持久化数据库 */
  loginOrgCode?: string;
  /** 排序 */
  sort?: number;
  /** 是否隐藏联系方式 0否1是 */
  izHideContact?: string;
  /** 所属部门的id */
  belongDepIds?: string;
}

export interface AuthLoginResponse {
  departs?: AuthDepart[];
  /** 0 无部门，1 单部门，2 多部门 */
  multi_depart?: number;
  tenantList?: AuthTenant[];
  userInfo?: AuthUser;
  token?: string;
}

export type AuthCaptchaResponse = string;
