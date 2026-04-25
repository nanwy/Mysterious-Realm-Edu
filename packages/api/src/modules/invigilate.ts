import { createApiClient, type ApiHttpClient } from "../client";

export const createInvigilateApi = (client: ApiHttpClient) => ({
  userJoin: (payload: Record<string, unknown>) =>
    client.post<unknown>("/invigilate/userJoin", payload),

  handleOffer: (payload: Record<string, unknown>) =>
    client.post<unknown>("/invigilate/handleOffer", payload),

  handleAnswer: (payload: Record<string, unknown>) =>
    client.post<unknown>("/invigilate/handleAnswer", payload),

  handleCandidate: (payload: Record<string, unknown>) =>
    client.post<unknown>("/invigilate/candidate", payload),

  handleUserLeave: (payload: Record<string, unknown>) =>
    client.post<unknown>("/invigilate/userLeave", payload),

  reportCheat: (payload: Record<string, unknown>) =>
    client.post<unknown>("/invigilate/reportCheat", payload),

  countCheat: (payload: Record<string, unknown>) =>
    client.post<unknown>("/invigilate/countCheat", payload),
});

const defaultInvigilateApi = createInvigilateApi(createApiClient());

export function userJoinInvigilate(payload: Record<string, unknown>) {
  return defaultInvigilateApi.userJoin(payload);
}

export function handleOffer(payload: Record<string, unknown>) {
  return defaultInvigilateApi.handleOffer(payload);
}

export function handleAnswer(payload: Record<string, unknown>) {
  return defaultInvigilateApi.handleAnswer(payload);
}

export function handleCandidate(payload: Record<string, unknown>) {
  return defaultInvigilateApi.handleCandidate(payload);
}

export function handleUserLeave(payload: Record<string, unknown>) {
  return defaultInvigilateApi.handleUserLeave(payload);
}

export function reportCheat(payload: Record<string, unknown>) {
  return defaultInvigilateApi.reportCheat(payload);
}

export function countCheat(payload: Record<string, unknown>) {
  return defaultInvigilateApi.countCheat(payload);
}
