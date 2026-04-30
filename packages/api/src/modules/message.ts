import type { ApiHttpClient } from "../client";
import type {
  AnnouncementListResponse,
  BusinessMessageListRequest,
  BusinessMessageListResponse,
  MessageIdRequest,
  SystemAnnouncementListRequest,
  SystemMessageListResponse,
  UnreadMessageCountResponse,
} from "../types/message";

export const createMessageApi = (client: ApiHttpClient) => ({
  listSystemMessages: (payload: SystemAnnouncementListRequest) =>
    client.post<SystemMessageListResponse>("/announcement/selectPageList", payload),

  readSystemMessage: ({ id }: MessageIdRequest) =>
    client.get<void>("/announcement/readMessage", {
      query: { id },
    }),

  listBusinessMessages: (payload: BusinessMessageListRequest) =>
    client.post<BusinessMessageListResponse>("/businessMessage/queryPageListByUser", payload),

  readBusinessMessage: ({ id }: MessageIdRequest) =>
    client.get<void>("/businessMessage/readMessage", {
      query: { id },
    }),

  countUnreadMessage: () =>
    client.get<UnreadMessageCountResponse>("/user/countUnreadMessage"),

  listAnnouncements: (payload: SystemAnnouncementListRequest = {}) =>
    client.post<AnnouncementListResponse>("/index/announcement/list", payload),
});
