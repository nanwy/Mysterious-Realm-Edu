import { type ApiHttpClient } from "../client";
import type {
  UserCurrentDepartsResponse,
  UserCurrentDeptResponse,
  UserImageBase64Response,
  UserProfileResponse,
  UserRegisterRequest,
  UserRegisterResponse,
  UserSelectDepartRequest,
  UserSelectDepartResponse,
  UserUpdatePasswordRequest,
  UserUpdatePasswordResponse,
  UserUpdateRequest,
  UserUpdateResponse,
} from "../types";

export const createUserApi = (client: ApiHttpClient) => ({
  updateUser: (payload: UserUpdateRequest) =>
    client.post<UserUpdateResponse>("/user/edit", payload),

  updatePassword: (payload: UserUpdatePasswordRequest) =>
    client.post<UserUpdatePasswordResponse>("/user/updatePassword", payload),

  registerUser: (payload: UserRegisterRequest) =>
    client.post<UserRegisterResponse>("/user/register", payload),

  readImageBase64: () =>
    client.get<UserImageBase64Response>("/user/readImageBase64"),

  queryUserInfo: () => client.get<UserProfileResponse>("/user/queryUserInfo"),

  getCurrentUserDeparts: () =>
    client.get<UserCurrentDepartsResponse>("/user/getCurrentUserDeparts"),

  selectDepart: (payload: UserSelectDepartRequest) =>
    client.post<UserSelectDepartResponse>("/user/selectDepart", payload),

  getCurrentDept: () =>
    client.get<UserCurrentDeptResponse>("/user/getCurrentDept"),
});
