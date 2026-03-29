import { createApiClient } from "../client";

const client = createApiClient();

export function updateUser(payload: Record<string, unknown>) {
  return client.post("/user/edit", payload);
}

export function updatePassword(payload: Record<string, unknown>) {
  return client.post("/user/updatePassword", payload);
}

export function registerUser(payload: Record<string, unknown>) {
  return client.post("/user/register", payload);
}

export function readImageBase64() {
  return client.get("/user/readImageBase64");
}

export function queryUserInfo() {
  return client.get("/user/queryUserInfo");
}

export function getCurrentUserDeparts() {
  return client.get("/user/getCurrentUserDeparts");
}

export function selectDepart(payload: Record<string, unknown>) {
  return client.post("/user/selectDepart", payload);
}

export function getCurrentDept() {
  return client.get("/user/getCurrentDept");
}

