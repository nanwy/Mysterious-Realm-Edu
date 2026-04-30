// Generated draft from Java sources. Review before using as API contract.
// Backend: /Users/nanfugongmeiying/Desktop/project/exam-backend-master
// Domain: user

export type UserDateTime = string;

// ../exam-backend-master/web/src/main/java/com/ynfy/app/api/v1/entity/dto/UserDTO.java
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

