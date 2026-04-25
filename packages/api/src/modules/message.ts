import { createApiClient, type ApiHttpClient } from "../client";

type Id = string | number;

export const createMessageApi = (client: ApiHttpClient) => ({
  listSystemMessages: (payload: Record<string, unknown>) =>
    client.post("/announcement/selectPageList", payload),

  readSystemMessage: ({ id }: { id: Id }) =>
    client.get("/announcement/readMessage", {
      query: { id },
    }),

  listBusinessMessages: (payload: Record<string, unknown>) =>
    client.post("/businessMessage/queryPageListByUser", payload),

  readBusinessMessage: ({ id }: { id: Id }) =>
    client.get("/businessMessage/readMessage", {
      query: { id },
    }),

  countUnreadMessage: () => client.get("/user/countUnreadMessage"),

  listAnnouncements: (payload?: Record<string, unknown>) =>
    client.post("/index/announcement/list", payload ?? {}),
});

const defaultMessageApi = createMessageApi(createApiClient());

export function getSystemMessageList(payload: Record<string, unknown>) {
  return defaultMessageApi.listSystemMessages(payload);
}

export function readSystemMessage(id: Id) {
  return defaultMessageApi.readSystemMessage({ id });
}

export function getBusinessMessageList(payload: Record<string, unknown>) {
  return defaultMessageApi.listBusinessMessages(payload);
}

export function readBusinessMessage(id: Id) {
  return defaultMessageApi.readBusinessMessage({ id });
}

export function countUnreadMessage() {
  return defaultMessageApi.countUnreadMessage();
}

export function getAnnouncementList(payload?: Record<string, unknown>) {
  return defaultMessageApi.listAnnouncements(payload);
}
