import { createApiClient } from "../client";

const client = createApiClient();

export function userJoinInvigilate(payload: Record<string, unknown>) {
  return client.post("/invigilate/userJoin", payload);
}

export function handleOffer(payload: Record<string, unknown>) {
  return client.post("/invigilate/handleOffer", payload);
}

export function handleAnswer(payload: Record<string, unknown>) {
  return client.post("/invigilate/handleAnswer", payload);
}

export function handleCandidate(payload: Record<string, unknown>) {
  return client.post("/invigilate/candidate", payload);
}

export function handleUserLeave(payload: Record<string, unknown>) {
  return client.post("/invigilate/userLeave", payload);
}

export function reportCheat(payload: Record<string, unknown>) {
  return client.post("/invigilate/reportCheat", payload);
}

export function countCheat(payload: Record<string, unknown>) {
  return client.post("/invigilate/countCheat", payload);
}

