import { createApi, unwrapEnvelope } from "@workspace/api";
import type {
  ExamDetailResponse,
  InvigilateJsonObject,
  InvigilateSocketMessage,
} from "@workspace/api";
import type { ExamOnlineSession } from "./online";
import {
  toBooleanOrNull,
  toNumberOrFallback,
  toRecord,
} from "@/lib/normalize";

export interface OnlineInvigilateUserProfile {
  id: string;
  username: string;
  realname: string;
}

export interface OnlineInvigilateConfig {
  snapOn: boolean;
  invigilateEnable: boolean;
  snapIntervalMs: number;
}

export const ONLINE_INVIGILATE_DEFAULT_SNAP_INTERVAL_MS = 60_000;

export const createOnlineExamBrowserApi = () =>
  createApi({
    getToken: () =>
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem("token"),
  });

export const getBrowserExamToken = () =>
  typeof window === "undefined"
    ? ""
    : (window.localStorage.getItem("token") ?? "");

export const getOnlineInvigilateConfig = (
  detail: ExamDetailResponse | null
): OnlineInvigilateConfig => ({
  snapOn: toBooleanOrNull(detail?.snapOn) ?? false,
  invigilateEnable: toBooleanOrNull(detail?.invigilateEnable) ?? false,
  snapIntervalMs: getInvigilateSnapIntervalMs(detail?.snapIntervalTime),
});

export const getInvigilateSnapIntervalMs = (minutes: unknown) => {
  const value = toNumberOrFallback(minutes, 1);

  return Math.max(1, value) * ONLINE_INVIGILATE_DEFAULT_SNAP_INTERVAL_MS;
};

export const getExamWatermarkContent = ({
  enabled,
  profile,
}: {
  enabled: boolean;
  profile: OnlineInvigilateUserProfile | null | undefined;
}) => {
  if (!enabled || !profile) {
    return "";
  }

  return `${profile.realname}${profile.username}`.trim();
};

export const getOnlineInvigilateEnabled = (session: ExamOnlineSession) => {
  const config = getOnlineInvigilateConfig(session.detail);

  return (
    config.snapOn ||
    config.invigilateEnable ||
    Boolean(session.detail?.watermarkEnable)
  );
};

export const fetchOnlineInvigilateUserProfile = async (
  examApi = createOnlineExamBrowserApi()
): Promise<OnlineInvigilateUserProfile | null> => {
  const payload = unwrapEnvelope(await examApi.user.queryUserInfo());
  const record = toRecord(payload);

  if (!record) {
    return null;
  }

  return {
    id: String(record.id ?? "").trim(),
    username: String(record.username ?? "").trim(),
    realname: String(record.realname ?? "").trim(),
  };
};

export const parseInvigilateSocketMessage = (
  payload: string
): InvigilateSocketMessage | null => {
  if (!payload || payload === "ping") {
    return null;
  }

  try {
    const parsed = JSON.parse(payload);
    return toRecord(parsed) as InvigilateSocketMessage | null;
  } catch {
    return null;
  }
};

export const parseInvigilatePeerList = (
  value: InvigilateSocketMessage["msgTxt"]
) => {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const parseInvigilateJsonObject = (
  value: InvigilateSocketMessage["msgTxt"]
): InvigilateJsonObject | null => {
  if (toRecord(value)) {
    return value as InvigilateJsonObject;
  }

  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return toRecord(parsed) as InvigilateJsonObject | null;
  } catch {
    return null;
  }
};

export const normalizeInvigilateAnswer = (
  value: InvigilateSocketMessage["msgTxt"]
) => {
  const answer = parseInvigilateJsonObject(value);
  const sdp = typeof answer?.sdp === "string" ? answer.sdp : null;

  if (!answer || !sdp) {
    return answer;
  }

  return {
    ...answer,
    sdp: sdp.endsWith("\n") ? sdp : `${sdp}\n`,
  };
};

export const buildInvigilateWebSocketBaseUrl = (
  explicitBaseUrl: string | undefined,
  apiBaseUrl: string | undefined
) => {
  const rawBaseUrl = explicitBaseUrl || apiBaseUrl || "";

  if (!rawBaseUrl) {
    return "";
  }

  try {
    const url = new URL(rawBaseUrl);
    url.protocol =
      url.protocol === "https:" || url.protocol === "wss:" ? "wss:" : "ws:";
    url.pathname = url.pathname.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return rawBaseUrl.replace(/^http/, "ws").replace(/\/$/, "");
  }
};

export const buildInvigilateWebSocketUrl = ({
  baseUrl,
  userId,
  token,
}: {
  baseUrl: string;
  userId: string;
  token: string;
}) => {
  if (!baseUrl || !userId) {
    return "";
  }

  const tokenSegment = token.replace(/[^\w-]/g, "").slice(0, 32) || "anonymous";

  return `${baseUrl}/websocket/${userId}_${tokenSegment}_1`;
};
