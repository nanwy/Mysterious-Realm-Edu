import type { ApiEnvelope } from "@workspace/shared";

export type { ApiEnvelope };

export const unwrapEnvelope = <T>(payload: ApiEnvelope<T>) =>
  payload.result ?? payload.data ?? null;
