import { createApiClient, type ApiHttpClient } from "../client";
import type {
  InvigilateCheatCountResponse,
  InvigilateCheatRequest,
  InvigilateMutationResponse,
  InvigilateWebrtcRequest,
} from "../types";

export const createInvigilateApi = (client: ApiHttpClient) => ({
  userJoin: (payload: InvigilateWebrtcRequest) =>
    client.post<InvigilateMutationResponse>("/invigilate/userJoin", payload),

  handleOffer: (payload: InvigilateWebrtcRequest) =>
    client.post<InvigilateMutationResponse>("/invigilate/handleOffer", payload),

  handleAnswer: (payload: InvigilateWebrtcRequest) =>
    client.post<InvigilateMutationResponse>("/invigilate/handleAnswer", payload),

  handleCandidate: (payload: InvigilateWebrtcRequest) =>
    client.post<InvigilateMutationResponse>("/invigilate/candidate", payload),

  handleUserLeave: (payload: InvigilateWebrtcRequest) =>
    client.post<InvigilateMutationResponse>("/invigilate/userLeave", payload),

  reportCheat: (payload: InvigilateCheatRequest) =>
    client.post<null>("/invigilate/reportCheat", payload),

  countCheat: (payload: InvigilateCheatRequest) =>
    client.post<InvigilateCheatCountResponse>(
      "/invigilate/countCheat",
      payload
    ),
});

const defaultInvigilateApi = createInvigilateApi(createApiClient());

export function userJoinInvigilate(payload: InvigilateWebrtcRequest) {
  return defaultInvigilateApi.userJoin(payload);
}

export function handleOffer(payload: InvigilateWebrtcRequest) {
  return defaultInvigilateApi.handleOffer(payload);
}

export function handleAnswer(payload: InvigilateWebrtcRequest) {
  return defaultInvigilateApi.handleAnswer(payload);
}

export function handleCandidate(payload: InvigilateWebrtcRequest) {
  return defaultInvigilateApi.handleCandidate(payload);
}

export function handleUserLeave(payload: InvigilateWebrtcRequest) {
  return defaultInvigilateApi.handleUserLeave(payload);
}

export function reportCheat(payload: InvigilateCheatRequest) {
  return defaultInvigilateApi.reportCheat(payload);
}

export function countCheat(payload: InvigilateCheatRequest) {
  return defaultInvigilateApi.countCheat(payload);
}
