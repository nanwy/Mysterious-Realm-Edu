import { createApiClient, buildQuery } from "../client";

const client = createApiClient();

export function getSystemMessageList(payload: Record<string, unknown>) {
  return client.post("/announcement/selectPageList", payload);
}

export function readSystemMessage(id: string | number) {
  return client.get(`/announcement/readMessage${buildQuery({ id })}`);
}

export function getBusinessMessageList(payload: Record<string, unknown>) {
  return client.post("/businessMessage/queryPageListByUser", payload);
}

export function readBusinessMessage(id: string | number) {
  return client.get(`/businessMessage/readMessage${buildQuery({ id })}`);
}

export function countUnreadMessage() {
  return client.get("/user/countUnreadMessage");
}

export function getAnnouncementList(payload?: Record<string, unknown>) {
  return client.post("/index/announcement/list", payload ?? {});
}

