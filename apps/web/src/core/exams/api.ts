import { api, unwrapEnvelope } from "@workspace/api";
import {
  EXAM_STATUS,
  EXAM_STATUS_OPTIONS,
  EXAM_TYPE,
  EXAM_TYPE_OPTIONS,
} from "./config";
import type { ExamResolvedStatus, ExamTypeFilter } from "./config";
import type {
  ExamFiltersState,
  ExamListItem,
  ExamListResult,
  ExamOnlineAnswerDraft,
  ExamOnlineAnswerGroup,
  ExamOnlineOption,
  ExamOnlineQuestion,
  ExamOnlineSession,
  ExamPreview,
} from "./types";
import {
  toBooleanOrNull,
  toDate,
  toNumber,
  toNumberOrNull,
  toRecordOrEmpty,
  toText,
} from "@/lib/normalize";

interface ListPayload {
  records: Array<Record<string, unknown>>;
  total: number;
}

const formatShortDate = (date: Date | null) => {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDate = (value: unknown) => {
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
};

const toListPayload = (value: unknown): ListPayload => {
  if (Array.isArray(value)) {
    return {
      records: value.map(toRecordOrEmpty),
      total: value.length,
    };
  }

  const payload = toRecordOrEmpty(value);
  const records = Array.isArray(payload.records)
    ? payload.records.map(toRecordOrEmpty)
    : Array.isArray(payload.list)
      ? payload.list.map(toRecordOrEmpty)
      : Array.isArray(payload.rows)
        ? payload.rows.map(toRecordOrEmpty)
        : Array.isArray(payload.data)
          ? payload.data.map(toRecordOrEmpty)
          : [];

  const totalValue =
    payload.total ??
    payload.count ??
    payload.totalCount ??
    payload.recordTotal ??
    records.length;
  const total = toNumberOrNull(totalValue) ?? records.length;

  return { records, total };
};

const toArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const getExamTypeLabel = (value: ExamTypeFilter) =>
  EXAM_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? "公开考试";

const getExamStatusLabel = (value: ExamResolvedStatus) =>
  EXAM_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? "进行中";

const isResolvedExamStatus = (value: string): value is ExamResolvedStatus =>
  value === EXAM_STATUS.IN_PROGRESS ||
  value === EXAM_STATUS.NOT_STARTED ||
  value === EXAM_STATUS.ENDED;

const resolveStatus = (record: Record<string, unknown>): ExamResolvedStatus => {
  const raw = toText(record.state ?? record.status ?? record.examStatus);
  if (isResolvedExamStatus(raw)) {
    return raw;
  }

  const now = Date.now();
  const startAt = toDate(
    record.startTime ?? record.beginTime ?? record.examStartTime
  );
  const endAt = toDate(
    record.endTime ?? record.finishTime ?? record.examEndTime
  );

  if (startAt && now < startAt.getTime()) {
    return EXAM_STATUS.NOT_STARTED;
  }

  if (endAt && now > endAt.getTime()) {
    return EXAM_STATUS.ENDED;
  }

  return EXAM_STATUS.IN_PROGRESS;
};

const buildTimeText = (record: Record<string, unknown>) => {
  const directText = toText(record.examTime ?? record.timeRange);
  if (directText) {
    return directText;
  }

  const startAt = toDate(
    record.startTime ?? record.beginTime ?? record.examStartTime
  );
  const endAt = toDate(
    record.endTime ?? record.finishTime ?? record.examEndTime
  );
  const startText = formatShortDate(startAt);
  const endText = formatShortDate(endAt);

  if (startText && endText) {
    return `${startText} - ${endText}`;
  }

  if (startText) {
    return `开始时间 ${startText}`;
  }

  if (endText) {
    return `结束时间 ${endText}`;
  }

  return "考试时间待公布";
};

const buildSummary = (record: Record<string, unknown>, statusLabel: string) => {
  const summary = toText(
    record.examDesc ??
      record.description ??
      record.remark ??
      record.introduction
  );
  if (summary) {
    return summary;
  }

  const duration = toText(
    record.examDuration ?? record.duration ?? record.limitTime
  );
  if (duration) {
    return `当前状态：${statusLabel}，考试时长 ${duration}。`;
  }

  return `当前状态：${statusLabel}，请在开放时间内进入考试。`;
};

const buildAttendeeText = (record: Record<string, unknown>) => {
  const attendeeCount = toText(
    record.examNumber ?? record.joinNum ?? record.applyCount ?? record.userCount
  );
  return attendeeCount ? `${attendeeCount} 人参与` : "参与人数待更新";
};

const buildActionLabel = (status: ExamResolvedStatus) => {
  if (status === EXAM_STATUS.NOT_STARTED) {
    return "查看安排";
  }

  if (status === EXAM_STATUS.ENDED) {
    return "查看结果";
  }

  return "进入考试";
};

const toExamListItem = (
  item: Record<string, unknown>,
  index: number
): ExamListItem => {
  const rawExamType = toText(item.examType ?? item.type, EXAM_TYPE.PUBLIC);
  const examType: ExamTypeFilter =
    rawExamType === EXAM_TYPE.MINE ? EXAM_TYPE.MINE : EXAM_TYPE.PUBLIC;
  const status = resolveStatus(item);
  const statusLabel = getExamStatusLabel(status);
  const title = toText(
    item.examName ?? item.title ?? item.name,
    `考试 ${index + 1}`
  );
  const examId = toText(item.examId ?? item.id ?? item.userExamId);

  return {
    id: toText(item.id ?? item.examId ?? item.userExamId, `${title}-${index}`),
    examId,
    title,
    summary: buildSummary(item, statusLabel),
    timeText: buildTimeText(item),
    status,
    statusLabel,
    typeLabel: getExamTypeLabel(examType),
    attendeeText: buildAttendeeText(item),
    actionLabel: buildActionLabel(status),
  };
};

const toCountText = (value: unknown, suffix: string, fallback = "--") => {
  const normalized = toText(value);
  return normalized ? `${normalized}${suffix}` : fallback;
};

const resolvePreviewState = (record: Record<string, unknown>) => {
  const raw = toText(
    record.state ?? record.status ?? record.examStatus,
    EXAM_STATUS.IN_PROGRESS
  );
  if (isResolvedExamStatus(raw)) {
    return raw;
  }

  return EXAM_STATUS.IN_PROGRESS;
};

const buildInstructions = (record: Record<string, unknown>) => {
  const paper = toRecordOrEmpty(record.paper);
  const questionCount = toText(paper.questionCount, "--");
  const joinType = toText(paper.joinType_dictText, "固定组卷");
  const totalScore = toText(paper.totalScore, "--");
  const qualifyScore = toText(record.qualifyScore, "--");
  const totalTime = toText(
    record.totalTime ?? record.examDuration ?? record.duration,
    "--"
  );
  const limitCount = toNumberOrNull(record.limitCount);
  const leaveOn = toBooleanOrNull(record.leaveOn);
  const leaveTimes = toText(record.totalLeaveTimes, "--");
  const snapOn = toBooleanOrNull(record.snapOn);
  const snapInterval = toText(record.snapIntervalTime, "--");

  const instructions = [
    "点击开始考试后将进入正式作答流程，请在稳定网络环境下完成考试。",
    `本场考试共 ${questionCount} 题，采用${joinType}，总分 ${totalScore} 分，${qualifyScore} 分及格。`,
    `考试时长 ${totalTime} 分钟${
      limitCount && limitCount > 0
        ? `，每位考生最多可参加 ${limitCount} 次。`
        : "。"
    }${leaveOn ? ` 切屏超过 ${leaveTimes} 次将触发自动交卷。` : ""}`,
  ];

  if (snapOn) {
    instructions.push(
      `进入考试后系统会每隔 ${snapInterval} 分钟抓拍一次作答照片。`
    );
  }

  return instructions;
};

const buildStartState = (
  record: Record<string, unknown>,
  reachedLimit: boolean
) => {
  const state = resolvePreviewState(record);
  const paper = toRecordOrEmpty(record.paper);
  const hasPaper = Object.keys(paper).length > 0;

  if (!hasPaper) {
    return {
      startDisabled: true,
      startLabel: "暂不可开始",
      startHint: "当前考试缺少试卷信息，无法安全进入考试。",
    };
  }

  if (state === EXAM_STATUS.NOT_STARTED) {
    return {
      startDisabled: true,
      startLabel: "暂未开始",
      startHint: "考试尚未开放，请在开始时间后重新进入。",
    };
  }

  if (state === EXAM_STATUS.ENDED) {
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
    startHint: "进入在线作答页后，系统会初始化考试会话并恢复已缓存答案。",
  };
};

const toExamPreview = (
  examId: string,
  payload: unknown,
  options: { hasRecord: boolean; reachedLimit: boolean }
): ExamPreview | null => {
  const record = toRecordOrEmpty(payload);
  const resolvedId = toText(record.id ?? record.examId, examId);
  const title = toText(record.title ?? record.examName ?? record.name);

  if (!resolvedId || !title) {
    return null;
  }

  const paper = toRecordOrEmpty(record.paper);
  const startState = buildStartState(record, options.reachedLimit);
  const description = toText(
    record.description ??
      record.examDesc ??
      record.remark ??
      record.introduction,
    "请在考试开始前仔细阅读考试说明、时长要求与作答约束。"
  );

  return {
    id: resolvedId,
    title,
    summary: toText(paper.title, "考试预览"),
    description,
    schedule: [
      {
        label: "开始时间",
        value: formatDate(
          record.startTime ?? record.beginTime ?? record.examStartTime
        ),
      },
      {
        label: "截止时间",
        value: formatDate(
          record.endTime ?? record.finishTime ?? record.examEndTime
        ),
      },
      {
        label: "开放权限",
        value: toText(record.openType_dictText, "全部学员"),
      },
    ],
    stats: [
      {
        label: "考试时长",
        value: toCountText(
          record.totalTime ?? record.examDuration ?? record.duration,
          " 分钟"
        ),
      },
      { label: "总分", value: toCountText(paper.totalScore, " 分") },
      { label: "及格分", value: toCountText(record.qualifyScore, " 分") },
      { label: "题目数量", value: toCountText(paper.questionCount, " 题") },
      { label: "限考次数", value: toCountText(record.limitCount, " 次") },
      { label: "已考次数", value: toCountText(record.tryCount, " 次", "0 次") },
      {
        label: "考试记录",
        value: options.hasRecord ? "已存在记录" : "首次进入",
      },
      { label: "试卷名称", value: toText(paper.title, "待同步") },
    ],
    instructions: buildInstructions(record),
    ...startState,
  };
};

const fallbackOnlineQuestions: ExamOnlineQuestion[] = [
  {
    id: "fallback-single",
    index: 1,
    title:
      "考试服务暂未同步正式试题。请先确认当前设备能正常进入作答界面，并选择一个状态。",
    type: 1,
    typeName: "单选题",
    score: 5,
    options: [
      { id: "A", tag: "A", content: "我已看到考试信息、题号与答题控件。" },
      { id: "B", tag: "B", content: "我需要稍后刷新正式试题。" },
      { id: "C", tag: "C", content: "当前网络或接口配置暂不可用。" },
    ],
    subQuestions: [],
  },
  {
    id: "fallback-subjective",
    index: 2,
    title:
      "请记录当前进入考试时遇到的环境情况，服务恢复后此处会显示正式简答题。",
    type: 4,
    typeName: "简答题",
    score: 10,
    options: [],
    subQuestions: [],
  },
];

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toExamOption = (value: unknown, index: number): ExamOnlineOption => {
  const record = toRecordOrEmpty(value);
  const tag = toText(
    record.tag ?? record.label,
    String.fromCharCode(65 + index)
  );
  const content = toText(record.content ?? record.answer ?? record.title, tag);

  return {
    id: toText(record.id ?? record.answerId ?? record.value, tag),
    tag,
    content: stripHtml(content),
  };
};

const toExamQuestion = (
  value: unknown,
  fallbackIndex: number
): ExamOnlineQuestion => {
  const record = toRecordOrEmpty(value);
  const question = toRecordOrEmpty(record.question);
  const index = toNumber(
    record.questionIndex ?? record.index ?? record.sort ?? fallbackIndex,
    fallbackIndex
  );
  const type = toNumber(record.questionType ?? question.questionType, 1);
  const typeName = toText(
    record.questionTypeName ?? question.questionTypeName,
    type === 4
      ? "简答题"
      : type === 5
        ? "填空题"
        : type === 6
          ? "组合题"
          : type === 2
            ? "多选题"
            : type === 3
              ? "判断题"
              : "单选题"
  );
  const title = toText(
    question.content ?? record.content ?? record.title,
    `第 ${index} 题题干暂未同步`
  );

  return {
    id: toText(
      record.id ?? question.id ?? record.questionId,
      `question-${index}`
    ),
    index,
    title: stripHtml(title),
    type,
    typeName,
    score: toNumber(record.questionScore ?? question.score ?? record.score, 0),
    options: toArray(question.answerList ?? record.answerList).map(
      toExamOption
    ),
    subQuestions: toArray(record.subQuestionList).map((item, subIndex) =>
      toExamQuestion(item, subIndex + 1)
    ),
  };
};

const buildAnswerGroups = (
  record: Record<string, unknown>,
  questions: ExamOnlineQuestion[]
): ExamOnlineAnswerGroup[] => {
  const fromPayload = toArray(record.answerCardList).flatMap((item) => {
    const cardRecord = toRecordOrEmpty(item);
    return Object.entries(cardRecord).map(([typeName, value]) => {
      const group = toRecordOrEmpty(value);
      return {
        typeName,
        questionType: toNumber(group.questionType, 0),
        questionCount: toNumber(group.questionCount, 0),
        questionScore: toNumber(group.questionScore, 0),
        indexes: toArray(group.indexList)
          .map((index) => toNumberOrNull(index))
          .filter((index): index is number => index !== null),
      };
    });
  });

  if (fromPayload.length) {
    return fromPayload;
  }

  const grouped = new Map<number, ExamOnlineAnswerGroup>();
  questions.forEach((question) => {
    const current =
      grouped.get(question.type) ??
      ({
        typeName: question.typeName,
        questionType: question.type,
        questionCount: 0,
        questionScore: 0,
        indexes: [],
      } satisfies ExamOnlineAnswerGroup);

    current.questionCount += 1;
    current.questionScore += question.score;
    current.indexes.push(question.index);
    grouped.set(question.type, current);
  });

  return Array.from(grouped.values());
};

const normalizeCacheAnswers = (value: unknown): ExamOnlineAnswerDraft[] => {
  const record = toRecordOrEmpty(value);
  return toArray(record.examAnswers ?? value).flatMap((item) => {
    const answer = toRecordOrEmpty(item);
    const numberIndex = toNumberOrNull(answer.index);
    const index = toText(answer.index) || numberIndex;
    const questionType = toNumber(answer.questionType, 0);

    if (index === "" || index === null || !questionType) {
      return [];
    }

    const normalized: ExamOnlineAnswerDraft = {
      index,
      questionType,
      answers: toArray(answer.answers).map((option) => toText(option)),
      answerIndex: toArray(answer.answerIndex)
        .map((optionIndex) => toNumberOrNull(optionIndex))
        .filter((optionIndex): optionIndex is number => optionIndex !== null),
      subjectiveAnswer: toText(answer.subjectiveAnswer),
      blankAnswer: toText(answer.blankAnswer),
    };

    return [normalized];
  });
};

const getUserExamId = (examId: string, value: unknown) => {
  const record = toRecordOrEmpty(value);
  return toText(
    record.userExamId ??
      record.id ??
      record.userExamDetailId ??
      record.examRecordId ??
      value,
    examId
  );
};

const buildFallbackOnlineSession = (
  examId: string,
  warning: string
): ExamOnlineSession => ({
  examId,
  userExamId: examId,
  title: "在线考试",
  totalScore: 15,
  totalTime: 60,
  questionCount: fallbackOnlineQuestions.length,
  limitTime: "",
  remainSeconds: null,
  statusMessage:
    "考试服务暂时无法返回正式试卷，当前可先确认作答界面与保存状态。",
  warning,
  questions: fallbackOnlineQuestions,
  answerGroups: buildAnswerGroups({}, fallbackOnlineQuestions),
  cachedAnswers: [],
});

const toOnlineSession = (
  examId: string,
  userExamId: string,
  detail: unknown,
  cachedAnswers: unknown,
  warning: string | null
): ExamOnlineSession => {
  const record = toRecordOrEmpty(detail);
  const questions = toArray(record.userExamQuestionList).map((item, index) =>
    toExamQuestion(item, index + 1)
  );
  const normalizedQuestions = questions.length
    ? questions
    : fallbackOnlineQuestions;
  const limitTime = toText(record.limitTime);
  const limitDate = toDate(limitTime);
  const remainSeconds = limitDate
    ? Math.max(0, Math.floor((limitDate.getTime() - Date.now()) / 1000))
    : null;

  return {
    examId: toText(record.examId, examId),
    userExamId,
    title: toText(
      record.examTitle ?? record.title ?? record.examName,
      "在线考试"
    ),
    totalScore: toNumber(record.totalScore, 0),
    totalTime: toNumber(record.totalTime ?? record.examDuration, 0),
    questionCount: toNumber(record.questionCount, normalizedQuestions.length),
    limitTime,
    remainSeconds,
    statusMessage: questions.length
      ? "考试会话已就绪，作答内容会在切换题目时自动保存。"
      : "正式试题暂未同步，当前显示安全演示题以保持页面可进入。",
    warning,
    questions: normalizedQuestions,
    answerGroups: buildAnswerGroups(record, normalizedQuestions),
    cachedAnswers: normalizeCacheAnswers(cachedAnswers),
  };
};

export const fetchExamList = async (
  filters: ExamFiltersState
): Promise<ExamListResult> => {
  try {
    const response = await api.exam.listExams({ ...filters });
    const payload = toListPayload(unwrapEnvelope(response));

    return {
      items: payload.records.map(toExamListItem),
      total: payload.total,
    };
  } catch {
    return { items: [], total: 0 };
  }
};

export const fetchExamPreview = async (
  examId: string
): Promise<ExamPreview | null> => {
  try {
    const [detailResult, recordResult, limitResult] = await Promise.allSettled([
      api.exam.queryExamById({ id: examId }),
      api.exam.examRecordExists({ examId }),
      api.exam.checkExamLimit({ examId }),
    ]);

    if (detailResult.status === "rejected") {
      return null;
    }

    const detail = unwrapEnvelope(detailResult.value);
    const hasRecord =
      recordResult.status === "fulfilled"
        ? Boolean(unwrapEnvelope(recordResult.value))
        : false;
    const reachedLimit =
      limitResult.status === "fulfilled"
        ? Boolean(unwrapEnvelope(limitResult.value))
        : false;

    return toExamPreview(examId, detail, { hasRecord, reachedLimit });
  } catch {
    return null;
  }
};

export const fetchExamOnlineSession = async (
  examId: string
): Promise<ExamOnlineSession> => {
  let sessionPayload: unknown = null;
  let userExamId = examId;
  let warning: string | null = null;

  try {
    sessionPayload = unwrapEnvelope(
      await api.exam.createExamSession({ examId })
    );
    userExamId = getUserExamId(examId, sessionPayload);
  } catch {
    warning = "考试会话暂时无法自动创建，系统会尝试读取既有考试记录。";
  }

  try {
    const [detailResult, cacheResult] = await Promise.allSettled([
      api.exam.getExamDetail({ userExamId }),
      api.exam.getCacheAnswer({ userExamId }),
    ]);

    if (detailResult.status === "rejected") {
      return buildFallbackOnlineSession(
        examId,
        warning ?? "考试详情暂时不可用，当前显示安全演示题。"
      );
    }

    const cachePayload =
      cacheResult.status === "fulfilled"
        ? unwrapEnvelope(cacheResult.value)
        : null;

    return toOnlineSession(
      examId,
      userExamId,
      unwrapEnvelope(detailResult.value),
      cachePayload,
      cacheResult.status === "rejected"
        ? (warning ?? "缓存答案暂时不可用，本次将从空答题卡开始。")
        : warning
    );
  } catch {
    return buildFallbackOnlineSession(
      examId,
      warning ?? "在线考试服务暂时不可用，当前显示安全演示题。"
    );
  }
};
