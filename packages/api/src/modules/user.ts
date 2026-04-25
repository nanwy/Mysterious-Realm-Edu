import {
  createApiClient,
  type ApiClientOptions,
  type ApiHttpClient,
} from "../client";

export const createUserApi = (client: ApiHttpClient) => ({
  updateUser: (payload: Record<string, unknown>) =>
    client.post("/user/edit", payload),

  updatePassword: (payload: Record<string, unknown>) =>
    client.post("/user/updatePassword", payload),

  registerUser: (payload: Record<string, unknown>) =>
    client.post("/user/register", payload),

  readImageBase64: () => client.get("/user/readImageBase64"),

  queryUserInfo: () => client.get("/user/queryUserInfo"),

  getCurrentUserDeparts: () => client.get("/user/getCurrentUserDeparts"),

  selectDepart: (payload: Record<string, unknown>) =>
    client.post("/user/selectDepart", payload),

  getCurrentDept: () => client.get("/user/getCurrentDept"),
});

const defaultUserApi = createUserApi(createApiClient());

const getUserApi = (options?: ApiClientOptions) =>
  options ? createUserApi(createApiClient(options)) : defaultUserApi;

export function createUserModule(options: ApiClientOptions = {}) {
  return createUserApi(createApiClient(options));
}

export function updateUser(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return getUserApi(options).updateUser(payload);
}

export function updatePassword(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return getUserApi(options).updatePassword(payload);
}

export function registerUser(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return getUserApi(options).registerUser(payload);
}

export function readImageBase64(options?: ApiClientOptions) {
  return getUserApi(options).readImageBase64();
}

export function queryUserInfo(options?: ApiClientOptions) {
  return getUserApi(options).queryUserInfo();
}

export function getCurrentUserDeparts(options?: ApiClientOptions) {
  return getUserApi(options).getCurrentUserDeparts();
}

export function selectDepart(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return getUserApi(options).selectDepart(payload);
}

export function getCurrentDept(options?: ApiClientOptions) {
  return getUserApi(options).getCurrentDept();
}
