import {
  api,
  EXAM_OPEN_TYPE,
  EXAM_PAPER_STATE,
  EXAM_QUESTION_TYPE,
  EXAM_QUESTION_TYPE_LABELS,
  EXAM_RESULT_SHOW_TYPE,
  type ExamCacheAnswerResponse,
  type ExamDetailResponse,
  type ExamListRequest,
  type ExamListResponse,
  type ExamPageResponse,
  type ExamPaperState,
  type ExamQuestionType,
  type ExamResultShowType,
  type ExamSessionResponse,
  type ExamSummaryResponse,
  unwrapEnvelope,
} from "@workspace/api";
import { EXAM_STATUS } from "./config";
import type {
  ExamOnlineAnswerDraft,
  ExamOnlineAnswerGroup,
  ExamOnlineQuestion,
  ExamOnlineSession,
} from "./online";
import {
  toBooleanOrNull,
  toDate,
  toNumber,
  toNumberOrNull,
} from "@/lib/normalize";

interface ListPayload {
  records: ExamSummaryResponse[];
  total: number;
}

export interface ExamPreview {
  id: string;
  title: string;
  summary: string;
  description: string;
  schedule: Array<{
    label: string;
    value: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
  }>;
  instructions: string[];
  startDisabled: boolean;
  startLabel: string;
  startHint: string;
}

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

const resolveString = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
};

const toListPayload = (value: ExamListResponse | null): ListPayload => {
  if (Array.isArray(value)) {
    return {
      records: value,
      total: value.length,
    };
  }

  const records =
    value?.records ?? value?.list ?? value?.rows ?? value?.data ?? [];

  const totalValue =
    value?.total ??
    value?.count ??
    value?.totalCount ??
    value?.recordTotal ??
    records.length;
  const total = toNumberOrNull(totalValue) ?? records.length;

  return { records, total };
};

const getOpenTypeLabel = (value: ExamSummaryResponse["openType"]) => {
  if (value === EXAM_OPEN_TYPE.DEPARTMENT) {
    return "部门学员";
  }

  if (value === EXAM_OPEN_TYPE.ASSIGNED_USER) {
    return "指定学员";
  }

  return "全部学员";
};

const isResolvedExamStatus = (value: string) =>
  value === EXAM_STATUS.IN_PROGRESS ||
  value === EXAM_STATUS.NOT_STARTED ||
  value === EXAM_STATUS.ENDED;

const formatCountText = (value: unknown, suffix: string, fallback = "--") => {
  const normalized = resolveString(value);
  return normalized ? `${normalized}${suffix}` : fallback;
};

const resolvePreviewState = (record: ExamSummaryResponse) => {
  const raw = resolveString(record.state, EXAM_STATUS.IN_PROGRESS);
  if (isResolvedExamStatus(raw)) {
    return raw;
  }

  return EXAM_STATUS.IN_PROGRESS;
};

const buildInstructions = (record: ExamSummaryResponse) => {
  const paper = record.paper;
  const questionCount = resolveString(paper?.questionCount, "--");
  const joinType = resolveString(paper?.joinType_dictText, "固定组卷");
  const totalScore = resolveString(paper?.totalScore, "--");
  const qualifyScore = resolveString(record.qualifyScore, "--");
  const totalTime = resolveString(record.totalTime, "--");
  const limitCount = toNumberOrNull(record.limitCount);
  const leaveOn = toBooleanOrNull(record.leaveOn);
  const leaveTimes = resolveString(record.totalLeaveTimes, "--");
  const snapOn = toBooleanOrNull(record.snapOn);
  const snapInterval = resolveString(record.snapIntervalTime, "--");

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
  record: ExamSummaryResponse,
  reachedLimit: boolean
) => {
  const state = resolvePreviewState(record);
  const hasPaper = Boolean(record.paper);

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

const fallbackOnlineQuestions: ExamOnlineQuestion[] = [
  {
    id: "fallback-single",
    index: 1,
    title:
      "考试服务暂未同步正式试题。请先确认当前设备能正常进入作答界面，并选择一个状态。",
    type: EXAM_QUESTION_TYPE.RADIO,
    typeName: EXAM_QUESTION_TYPE_LABELS[EXAM_QUESTION_TYPE.RADIO],
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
    type: EXAM_QUESTION_TYPE.SIMPLE,
    typeName: EXAM_QUESTION_TYPE_LABELS[EXAM_QUESTION_TYPE.SIMPLE],
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

const isExamQuestionType = (value: number): value is ExamQuestionType =>
  value in EXAM_QUESTION_TYPE_LABELS;

const toExamQuestionType = (value: unknown): ExamQuestionType => {
  const type = toNumber(value, EXAM_QUESTION_TYPE.RADIO);

  return isExamQuestionType(type) ? type : EXAM_QUESTION_TYPE.RADIO;
};

const isExamPaperState = (value: number): value is ExamPaperState =>
  Object.values(EXAM_PAPER_STATE).includes(value as ExamPaperState);

const toExamPaperState = (value: unknown): ExamPaperState | null => {
  const state = toNumberOrNull(value);

  return state !== null && isExamPaperState(state) ? state : null;
};

const isExamResultShowType = (value: number): value is ExamResultShowType =>
  Object.values(EXAM_RESULT_SHOW_TYPE).includes(value as ExamResultShowType);

const toExamResultShowType = (value: unknown): ExamResultShowType | null => {
  const showType = toNumberOrNull(value);

  return showType !== null && isExamResultShowType(showType) ? showType : null;
};

const buildOnlineQuestion = (
  userQuestion: NonNullable<ExamDetailResponse["userExamQuestionList"]>[number],
  fallbackIndex: number
): ExamOnlineQuestion => {
  const question = userQuestion.question;
  const index = toNumber(
    userQuestion.questionIndex ?? userQuestion.sort ?? fallbackIndex,
    fallbackIndex
  );
  const type = toExamQuestionType(userQuestion.questionType ?? question?.type);
  const typeName = resolveString(
    userQuestion.questionTypeName,
    EXAM_QUESTION_TYPE_LABELS[type]
  );
  const title = resolveString(question?.content, `第 ${index} 题题干暂未同步`);

  return {
    id: resolveString(
      userQuestion.id ?? question?.id ?? userQuestion.questionId,
      `question-${index}`
    ),
    index,
    title: stripHtml(title),
    type,
    typeName,
    score: toNumber(userQuestion.questionScore ?? question?.score, 0),
    options: (question?.answerList ?? []).map((answer, optionIndex) => {
      const tag = resolveString(
        answer.tag,
        String.fromCharCode(65 + optionIndex)
      );
      const content = resolveString(answer.content, tag);

      return {
        id: resolveString(answer.id, tag),
        tag,
        content: stripHtml(content),
      };
    }),
    subQuestions: (userQuestion.subQuestionList ?? []).map((item, subIndex) =>
      buildOnlineQuestion(item, subIndex + 1)
    ),
  };
};

const buildAnswerGroups = (
  detail: ExamDetailResponse,
  questions: ExamOnlineQuestion[]
): ExamOnlineAnswerGroup[] => {
  const fromPayload = (detail.answerCardList ?? []).flatMap((cardRecord) =>
    Object.entries(cardRecord).map(([typeName, group]) => ({
      typeName,
      questionType: toExamQuestionType(group.questionType),
      questionCount: toNumber(group.questionCount, 0),
      questionScore: toNumber(group.questionScore, 0),
      indexes: (group.indexList ?? [])
        .map((index) => toNumberOrNull(index))
        .filter((index): index is number => index !== null),
    }))
  );

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

const normalizeCacheAnswers = (
  value: ExamCacheAnswerResponse | null
): ExamOnlineAnswerDraft[] =>
  (value?.examAnswers ?? []).flatMap((answer) => {
    const index = resolveString(answer.index);
    const questionType = toExamQuestionType(answer.questionType);

    if (!index) {
      return [];
    }

    const normalized: ExamOnlineAnswerDraft = {
      index,
      questionType,
      answers: (answer.answers ?? []).map((option) => resolveString(option)),
      answerIndex: (answer.answerIndex ?? [])
        .map((optionIndex) => resolveString(optionIndex))
        .filter(Boolean),
      subjectiveAnswer: resolveString(answer.subjectiveAnswer),
      blankAnswer: resolveString(answer.blankAnswer),
    };

    return [normalized];
  });

export const resolveOnlineUserExamId = (
  examId: string,
  value: ExamSessionResponse | null
) => resolveString(value?.userExamId ?? value?.id, examId);

const isOnlineSessionSubmitted = (detail: ExamDetailResponse | null) => {
  const paperState = toExamPaperState(detail?.state);

  return (
    paperState === EXAM_PAPER_STATE.WAIT_REVIEW ||
    paperState === EXAM_PAPER_STATE.FINISHED ||
    Boolean(detail?.commitTime)
  );
};

const diffDays = (start: Date | null, end: Date | null) => {
  if (!start || !end) {
    return 0;
  }

  return Math.floor(
    Math.abs(end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );
};

const canShowOnlineResultDetail = (detail: ExamDetailResponse | null) => {
  const showType = toExamResultShowType(detail?.examResultShowtype);
  if (showType !== EXAM_RESULT_SHOW_TYPE.SCORE_AND_DETAIL) {
    return false;
  }

  const showDeadline = toNumberOrNull(detail?.showDeadline);
  const paperState = toExamPaperState(detail?.state);
  const resultTime = toDate(detail?.previewTime ?? detail?.commitTime);
  const detailExpired =
    showDeadline !== null &&
    showDeadline > 0 &&
    paperState === EXAM_PAPER_STATE.FINISHED &&
    diffDays(resultTime, new Date()) > showDeadline;

  return !detailExpired;
};

const buildFallbackOnlineSession = (
  examId: string,
  warning: string
): ExamOnlineSession => ({
  examId,
  userExamId: examId,
  detail: null,
  submitted: false,
  resultDetailVisible: false,
  limitTime: "",
  remainSeconds: null,
  statusMessage:
    "考试服务暂时无法返回正式试卷，当前可先确认作答界面与保存状态。",
  warning,
  questions: fallbackOnlineQuestions,
  answerGroups: buildAnswerGroups({}, fallbackOnlineQuestions),
  cachedAnswers: [],
});

export const fetchExamList = async (
  filters: ExamListRequest
): Promise<ExamPageResponse<ExamSummaryResponse>> => {
  try {
    const response = await api.exam.listExams({ ...filters });
    const payload = toListPayload(unwrapEnvelope(response));

    return {
      records: payload.records,
      total: payload.total,
    };
  } catch {
    return { records: [], total: 0 };
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

    if (!detail) {
      return null;
    }

    const resolvedId = resolveString(detail.id, examId);
    const title = resolveString(detail.title);

    if (!resolvedId || !title) {
      return null;
    }

    const paper = detail.paper;

    return {
      id: resolvedId,
      title,
      summary: resolveString(paper?.title, "考试预览"),
      description: "请在考试开始前仔细阅读考试说明、时长要求与作答约束。",
      schedule: [
        {
          label: "开始时间",
          value: formatDate(detail.startTime),
        },
        {
          label: "截止时间",
          value: formatDate(detail.endTime),
        },
        {
          label: "开放权限",
          value: getOpenTypeLabel(detail.openType),
        },
      ],
      stats: [
        {
          label: "考试时长",
          value: formatCountText(detail.totalTime, " 分钟"),
        },
        { label: "总分", value: formatCountText(paper?.totalScore, " 分") },
        { label: "及格分", value: formatCountText(detail.qualifyScore, " 分") },
        {
          label: "题目数量",
          value: formatCountText(paper?.questionCount, " 题"),
        },
        { label: "限考次数", value: formatCountText(detail.limitCount, " 次") },
        {
          label: "已考次数",
          value: formatCountText(detail.tryCount, " 次", "0 次"),
        },
        {
          label: "考试记录",
          value: hasRecord ? "已存在记录" : "首次进入",
        },
        { label: "试卷名称", value: resolveString(paper?.title, "待同步") },
      ],
      instructions: buildInstructions(detail),
      ...buildStartState(detail, reachedLimit),
    };
  } catch {
    return null;
  }
};

export const fetchExamOnlineSession = async (
  examId: string,
  initialUserExamId?: string
): Promise<ExamOnlineSession> => {
  let sessionPayload: ExamSessionResponse | null = null;
  let userExamId = initialUserExamId || examId;
  let warning: string | null = null;

  if (!initialUserExamId) {
    try {
      sessionPayload = unwrapEnvelope(
        await api.exam.createExamSession({ examId })
      );
      userExamId = resolveOnlineUserExamId(examId, sessionPayload);
    } catch {
      warning = "考试会话暂时无法自动创建，系统会尝试读取既有考试记录。";
    }
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
    const detail = unwrapEnvelope(detailResult.value);
    const questions = (detail?.userExamQuestionList ?? []).map((item, index) =>
      buildOnlineQuestion(item, index + 1)
    );
    const normalizedQuestions = questions.length
      ? questions
      : fallbackOnlineQuestions;
    const limitTime = resolveString(detail?.limitTime);
    const limitDate = toDate(limitTime);
    const remainSeconds = limitDate
      ? Math.max(0, Math.floor((limitDate.getTime() - Date.now()) / 1000))
      : null;

    return {
      examId: resolveString(detail?.examId, examId),
      userExamId,
      detail,
      submitted: isOnlineSessionSubmitted(detail),
      resultDetailVisible: canShowOnlineResultDetail(detail),
      limitTime,
      remainSeconds,
      statusMessage: questions.length
        ? "考试会话已就绪，作答内容会在切换题目时自动保存。"
        : "正式试题暂未同步，当前显示安全演示题以保持页面可进入。",
      warning:
        cacheResult.status === "rejected"
          ? (warning ?? "缓存答案暂时不可用，本次将从空答题卡开始。")
          : warning,
      questions: normalizedQuestions,
      answerGroups: buildAnswerGroups(detail ?? {}, normalizedQuestions),
      cachedAnswers: normalizeCacheAnswers(cachePayload),
    };
  } catch {
    return buildFallbackOnlineSession(
      examId,
      warning ?? "在线考试服务暂时不可用，当前显示安全演示题。"
    );
  }
};
