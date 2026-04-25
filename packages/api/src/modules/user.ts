import { createApiClient, type ApiClientOptions } from "../client";

export function createUserModule(options: ApiClientOptions = {}) {
  const client = createApiClient(options);

  return {
    updateUser(payload: Record<string, unknown>) {
      return client.post("/user/edit", payload);
    },
    updatePassword(payload: Record<string, unknown>) {
      return client.post("/user/updatePassword", payload);
    },
    registerUser(payload: Record<string, unknown>) {
      return client.post("/user/register", payload);
    },
    readImageBase64() {
      return client.get("/user/readImageBase64");
    },
    queryUserInfo() {
      return client.get("/user/queryUserInfo");
    },
    getCurrentUserDeparts() {
      return client.get("/user/getCurrentUserDeparts");
    },
    selectDepart(payload: Record<string, unknown>) {
      return client.post("/user/selectDepart", payload);
    },
    getCurrentDept() {
      return client.get("/user/getCurrentDept");
    },
  };
}

export function updateUser(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return createUserModule(options).updateUser(payload);
}

export function updatePassword(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return createUserModule(options).updatePassword(payload);
}

export function registerUser(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return createUserModule(options).registerUser(payload);
}

export function readImageBase64(options?: ApiClientOptions) {
  return createUserModule(options).readImageBase64();
}

export function queryUserInfo(options?: ApiClientOptions) {
  return createUserModule(options).queryUserInfo();
}

export function getCurrentUserDeparts(options?: ApiClientOptions) {
  return createUserModule(options).getCurrentUserDeparts();
}

export function selectDepart(
  payload: Record<string, unknown>,
  options?: ApiClientOptions
) {
  return createUserModule(options).selectDepart(payload);
}

export function getCurrentDept(options?: ApiClientOptions) {
  return createUserModule(options).getCurrentDept();
}
