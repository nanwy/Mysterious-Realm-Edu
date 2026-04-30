export type UserId = string | number;
export type UserDateTime = string;

export interface UserProfileResponse {
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
  birthday?: UserDateTime;
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
  /** 职务，关联职务表 */
  post?: string;
  /** 积分 */
  integral?: number;
  /** 座机号 */
  telephone?: string;
  /** 创建人 */
  createBy?: string;
  /** 创建时间 */
  createTime?: UserDateTime;
  /** 更新人 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: UserDateTime;
  /** 同步工作流引擎1同步0不同步 */
  activitiSync?: number;
  /** 身份（0 普通成员 1 上级） */
  userIdentity?: number;
  /** 负责部门 */
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
  /** 主岗位 */
  mainDepPostId?: string;
  /** 兼职岗位 */
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
  lastLoginTime?: UserDateTime;
  /** 移动端主题 */
  mainTheme?: number;
  /** 最后密码修改时间 | @JsonFormat yyyy-MM-dd HH:mm:ss */
  lastPwdUpdateTime?: UserDateTime;
  /** 登录时，选择的部门，临时用，不持久化数据库 */
  loginOrgCode?: string;
  /** 排序 */
  sort?: number;
  /** 是否隐藏联系方式 0否1是 */
  izHideContact?: string;
  /** 所属部门的id */
  belongDepIds?: string;
}

export interface UserDTO {
  id?: string;
  username?: string;
  realname?: string;
  sex?: number;
  phone?: string;
  email?: string;
  password?: string;
  avatar?: string;
  /** 旧密码 */
  oldPassword?: string;
  /** 新密码 */
  newPassword?: string;
  /** 确认密码 */
  confirmPassword?: string;
}

export type UserUpdateRequest = UserProfileResponse;

export type UserUpdatePasswordRequest = UserDTO;
export type UserRegisterRequest = UserDTO;

export interface UserDepartment {
  id?: string;
  deptId?: string;
  departId?: string;
  departmentId?: string;
  deptName?: string;
  departName?: string;
  departmentName?: string;
  orgName?: string;
  companyName?: string;
  tenantName?: string;
  schoolName?: string;
  orgCode?: string;
  createTime?: UserDateTime;
  updateTime?: UserDateTime;
}

export interface UserSelectDepartRequest {
  id?: UserId;
  username?: string;
  orgCode?: string;
  loginTenantId?: number;
}

export interface UserCurrentDepartsResponse {
  list?: UserDepartment[];
  orgCode?: string;
}

export interface UserCurrentDeptResponse {
  /** 0 无部门, 1 单部门, 2 多部门 */
  multiDepart?: 0 | 1 | 2;
  orgCode?: string;
  orgCodeTxt?: string;
}

export interface UserSelectDepartResponse {
  userInfo?: UserProfileResponse;
}

export type UserUpdateResponse = string;
export type UserUpdatePasswordResponse = string;
export type UserRegisterResponse = string;
export type UserImageBase64Response = string;
