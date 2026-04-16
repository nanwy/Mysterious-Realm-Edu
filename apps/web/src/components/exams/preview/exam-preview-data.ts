import { checkExamLimit, examRecordExist, queryExamById, unwrapEnvelope } from "@workspace/api";
import { toBooleanOrNull, toNumberOrNull, toRecordOrEmpty, toText } from "@/lib/normalize";

interface ExamPreviewPayload {
  id: string;
  title: string;
  summary: string;
  description: string;
  schedule: Array<{ label: string; value: string }>;
  stats: Array<{ label: string; value: string }>;
  instructions: string[];
  startDisabled: boolean;
  startLabel: string;
  startHint: string;
}

function formatDate(value: unknown) {
  if (!value) {
    return "待公布";
  }

  const rawDate =
    typeof value === "number" && Number.isFinite(value)
      ? new Date(value > 1e12 ? value : value * 1000)
      : new Date(String(value));

  if (Number.isNaN(rawDate.getTime())) {
    return "待公布";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(rawDate);
}

function toCountText(value: unknown, suffix: string, fallback = "--") {
  const normalized = toText(value);
  return normalized ? `${normalized}${suffix}` : fallback;
}

function resolveState(record: Record<string, unknown>) {
  const raw = toText(record.state ?? record.status ?? record.examStatus, "0");
  if (raw === "2" || raw === "3") {
    return raw;
  }

  return "0";
}

function buildInstructions(record: Record<string, unknown>) {
  const paper = toRecordOrEmpty(record.paper);
  const questionCount = toText(paper.questionCount, "--");
  const joinType = toText(paper.joinType_dictText, "固定组卷");
  const totalScore = toText(paper.totalScore, "--");
  const qualifyScore = toText(record.qualifyScore, "--");
  const totalTime = toText(record.totalTime ?? record.examDuration ?? record.duration, "--");
  const limitCount = toNumberOrNull(record.limitCount);
  const leaveOn = toBooleanOrNull(record.leaveOn);
  const leaveTimes = toText(record.totalLeaveTimes, "--");
  const snapOn = toBooleanOrNull(record.snapOn);
  const snapInterval = toText(record.snapIntervalTime, "--");

  const instructions = [
    "点击开始考试后将进入正式作答流程，请在稳定网络环境下完成考试。",
    `本场考试共 ${questionCount} 题，采用${joinType}，总分 ${totalScore} 分，${qualifyScore} 分及格。`,
    `考试时长 ${totalTime} 分钟${limitCount && limitCount > 0 ? `，每位考生最多可参加 ${limitCount} 次。` : "。"}${leaveOn ? ` 切屏超过 ${leaveTimes} 次将触发自动交卷。` : ""}`,
  ];

  if (snapOn) {
    instructions.push(`进入考试后系统会每隔 ${snapInterval} 分钟抓拍一次作答照片。`);
  }

  return instructions;
}

function buildStartState(record: Record<string, unknown>, reachedLimit: boolean) {
  const state = resolveState(record);
  const paper = toRecordOrEmpty(record.paper);
  const hasPaper = Object.keys(paper).length > 0;

  if (!hasPaper) {
    return {
      startDisabled: true,
      startLabel: "暂不可开始",
      startHint: "当前考试缺少试卷信息，无法安全进入考试。",
    };
  }

  if (state === "2") {
    return {
      startDisabled: true,
      startLabel: "暂未开始",
      startHint: "考试尚未开放，请在开始时间后重新进入。",
    };
  }

  if (state === "3") {
    return {
      startDisabled: true,
      startLabel: "考试已结束",
      startHint: "本场考试已结束，不能再从预览页进入作答。",
    };
  }

  if (reachedLimit) {
    return {
      startDisabled: true,
      startLabel: "已达限考次数",
      startHint: "你已达到本场考试的限考次数，当前不能继续开始。",
    };
  }

  return {
    startDisabled: false,
    startLabel: "开始考试",
    startHint: "在线作答页尚在迁移中，当前版本先保留入口与说明，点击后会给出明确提示。",
  };
}

function normalizeExamPreview(
  examId: string,
  payload: unknown,
  options: { hasRecord: boolean; reachedLimit: boolean }
): ExamPreviewPayload | null {
  const record = toRecordOrEmpty(payload);
  const resolvedId = toText(record.id ?? record.examId, examId);
  const title = toText(record.title ?? record.examName ?? record.name);

  if (!resolvedId || !title) {
    return null;
  }

  const paper = toRecordOrEmpty(record.paper);
  const startState = buildStartState(record, options.reachedLimit);
  const description = toText(
    record.description ?? record.examDesc ?? record.remark ?? record.introduction,
    "请在考试开始前仔细阅读考试说明、时长要求与作答约束。"
  );

  return {
    id: resolvedId,
    title,
    summary: toText(paper.title, "考试预览"),
    description,
    schedule: [
      { label: "开始时间", value: formatDate(record.startTime ?? record.beginTime ?? record.examStartTime) },
      { label: "截止时间", value: formatDate(record.endTime ?? record.finishTime ?? record.examEndTime) },
      { label: "开放权限", value: toText(record.openType_dictText, "全部学员") },
    ],
    stats: [
      { label: "考试时长", value: toCountText(record.totalTime ?? record.examDuration ?? record.duration, " 分钟") },
      { label: "总分", value: toCountText(paper.totalScore, " 分") },
      { label: "及格分", value: toCountText(record.qualifyScore, " 分") },
      { label: "题目数量", value: toCountText(paper.questionCount, " 题") },
      { label: "限考次数", value: toCountText(record.limitCount, " 次") },
      { label: "已考次数", value: toCountText(record.tryCount, " 次", "0 次") },
      { label: "考试记录", value: options.hasRecord ? "已存在记录" : "首次进入" },
      { label: "试卷名称", value: toText(paper.title, "待同步") },
    ],
    instructions: buildInstructions(record),
    ...startState,
  };
}

export function normalizeExamPreviewError(error: unknown) {
  const message = error instanceof Error && error.message ? error.message : "考试预览加载失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前只能展示错误说明。`;
  }

  if (message === "网络请求失败") {
    return "考试预览接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

export async function fetchExamPreview(examId: string) {
  const [detailResult, recordResult, limitResult] = await Promise.allSettled([
    queryExamById(examId),
    examRecordExist(examId),
    checkExamLimit(examId),
  ]);

  if (detailResult.status === "rejected") {
    throw detailResult.reason;
  }

  const detail = unwrapEnvelope(detailResult.value);
  const hasRecord =
    recordResult.status === "fulfilled" ? Boolean(unwrapEnvelope(recordResult.value)) : false;
  const reachedLimit =
    limitResult.status === "fulfilled" ? Boolean(unwrapEnvelope(limitResult.value)) : false;

  return normalizeExamPreview(examId, detail, { hasRecord, reachedLimit });
}

export type { ExamPreviewPayload };
