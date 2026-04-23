import {
  cacheExamAnswer,
  createExam,
  getCacheAnswer,
  getExamDetail,
  listExamIn,
  submitExam,
  unwrapEnvelope,
} from "@workspace/api";
import { stripHtmlTags, toDate, toNumberOrFallback, toRecordOrEmpty, toText } from "@/lib/normalize";

type ExamQuestionType = 1 | 2 | 3 | 4 | 5 | 6;

interface ExamChoiceOption {
  id: string;
  index: number;
  label: string;
  content: string;
}

interface ExamQuestionLeaf {
  id: string;
  index: string;
  displayIndex: string;
  questionType: Exclude<ExamQuestionType, 6>;
  questionTypeName: string;
  questionScoreText: string;
  prompt: string;
  body: string;
  options: ExamChoiceOption[];
  blankCount: number;
}

interface ExamQuestionGroup {
  id: string;
  index: string;
  displayIndex: string;
  questionType: 6;
  questionTypeName: string;
  questionScoreText: string;
  prompt: string;
  body: string;
  subQuestions: ExamQuestionLeaf[];
}

type ExamQuestion = ExamQuestionLeaf | ExamQuestionGroup;

export interface PersistedExamAnswer {
  index: string;
  questionType: number;
  answers?: string[];
  answerIndex?: number[];
  subjectiveAnswer?: string;
  blankAnswer?: string;
}

export interface ExamAnswerDraft {
  answers: string[];
  answerIndex: number[];
  subjectiveAnswer: string;
  blankValues: string[];
}

export interface ExamSessionPayload {
  examId: string;
  userExamId: string;
  title: string;
  summary: string;
  description: string;
  candidateName: string;
  candidateHint: string;
  statusText: string;
  durationText: string;
  limitTimeIso: string | null;
  remainingMs: number | null;
  progressHint: string;
  schedule: Array<{ label: string; value: string }>;
  instructions: string[];
  warnings: string[];
  unsupportedNotes: string[];
  questions: ExamQuestion[];
  answerMap: Record<string, ExamAnswerDraft>;
  hasCachedAnswers: boolean;
}

function formatDateTime(value: unknown) {
  const date = toDate(value);

  if (!date) {
    return "待同步";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDurationText(value: unknown) {
  const text = toText(value);
  if (!text) {
    return "时长待同步";
  }

  if (text.includes("分钟") || text.includes("小时")) {
    return text;
  }

  return `${text} 分钟`;
}

function normalizeOption(item: unknown, index: number): ExamChoiceOption {
  const record = toRecordOrEmpty(item);
  const label = toText(record.tag ?? record.label, String.fromCharCode(65 + index));

  return {
    id: toText(record.id ?? record.answerId, `${label}-${index}`),
    index,
    label,
    content: toText(record.content ?? record.answerContent ?? record.title, "选项内容待同步"),
  };
}

function getQuestionBody(record: Record<string, unknown>) {
  return toText(
    record.content ??
      record.title ??
      record.questionContent ??
      record.questionTitle ??
      record.stem,
    "题干内容待同步"
  );
}

function normalizeLeafQuestion(item: unknown, parentIndex?: string): ExamQuestionLeaf {
  const record = toRecordOrEmpty(item);
  const numericIndex = toNumberOrFallback(record.questionIndex ?? record.index, 0);
  const indexText = parentIndex ? `${parentIndex}.${numericIndex || 1}` : String(numericIndex || 1);
  const questionType = toNumberOrFallback(record.questionType ?? record.type, 4) as Exclude<ExamQuestionType, 6>;
  const question = toRecordOrEmpty(record.question);
  const optionList = Array.isArray(question.answerList) ? question.answerList : [];
  const body = getQuestionBody(question);
  const prompt = stripHtmlTags(body) || body;
  const blankCount = questionType === 5 ? Math.max(optionList.length, 1) : 0;

  return {
    id: toText(record.id ?? record.questionId ?? record.userExamQuestionId, indexText),
    index: indexText,
    displayIndex: indexText,
    questionType,
    questionTypeName: toText(record.questionTypeName ?? record.typeName, "题目"),
    questionScoreText: `${toText(record.questionScore ?? record.score, "--")} 分`,
    prompt,
    body,
    options: optionList.map(normalizeOption),
    blankCount,
  };
}

function normalizeQuestion(item: unknown): ExamQuestion {
  const record = toRecordOrEmpty(item);
  const questionType = toNumberOrFallback(record.questionType ?? record.type, 4) as ExamQuestionType;
  const indexText = toText(record.questionIndex ?? record.index, "1");
  const question = toRecordOrEmpty(record.question);
  const body = getQuestionBody(question);
  const prompt = stripHtmlTags(body) || body;

  if (questionType === 6) {
    const subQuestions = Array.isArray(record.subQuestionList)
      ? record.subQuestionList.map((subItem) => normalizeLeafQuestion(subItem, indexText))
      : [];

    return {
      id: toText(record.id ?? record.questionId ?? record.userExamQuestionId, indexText),
      index: indexText,
      displayIndex: indexText,
      questionType: 6,
      questionTypeName: toText(record.questionTypeName ?? record.typeName, "组合题"),
      questionScoreText: `${toText(record.questionScore ?? record.score, "--")} 分`,
      prompt,
      body,
      subQuestions,
    };
  }

  return normalizeLeafQuestion(item);
}

function normalizePersistedAnswer(item: unknown) {
  const record = toRecordOrEmpty(item);
  return {
    index: toText(record.index),
    questionType: toNumberOrFallback(record.questionType, 0),
    answers: Array.isArray(record.answers) ? record.answers.map((value) => toText(value)).filter(Boolean) : [],
    answerIndex: Array.isArray(record.answerIndex)
      ? record.answerIndex.map((value) => toNumberOrFallback(value, -1)).filter((value) => value >= 0)
      : [],
    subjectiveAnswer: toText(record.subjectiveAnswer),
    blankAnswer: toText(record.blankAnswer),
  } satisfies PersistedExamAnswer;
}

function parseBlankAnswer(value: string, blankCount: number) {
  if (!value) {
    return Array.from({ length: blankCount }, () => "");
  }

  try {
    const parsed = JSON.parse(value) as Array<Record<string, unknown>>;
    const values = parsed.map((item) => toText(item.content));
    return Array.from({ length: Math.max(blankCount, values.length || 1) }, (_, index) => values[index] ?? "");
  } catch {
    return Array.from({ length: blankCount }, () => "");
  }
}

function createEmptyDraft(question: ExamQuestionLeaf): ExamAnswerDraft {
  return {
    answers: [],
    answerIndex: [],
    subjectiveAnswer: "",
    blankValues: question.questionType === 5 ? Array.from({ length: question.blankCount }, () => "") : [],
  };
}

function createAnswerMap(questions: ExamQuestion[], cachePayload: unknown) {
  const questionLookup = new Map<string, ExamQuestionLeaf>();

  questions.forEach((question) => {
    if (question.questionType === 6) {
      question.subQuestions.forEach((subQuestion) => questionLookup.set(subQuestion.index, subQuestion));
      return;
    }

    questionLookup.set(question.index, question);
  });

  const rawAnswers = Array.isArray(cachePayload)
    ? cachePayload
    : Array.isArray(toRecordOrEmpty(cachePayload).examAnswers)
      ? (toRecordOrEmpty(cachePayload).examAnswers as unknown[])
      : [];

  const answerMap: Record<string, ExamAnswerDraft> = {};
  let hasCachedAnswers = false;

  rawAnswers.forEach((item) => {
    const answer = normalizePersistedAnswer(item);
    if (!answer.index) {
      return;
    }

    const question = questionLookup.get(answer.index);
    if (!question) {
      return;
    }

    hasCachedAnswers = true;
    answerMap[answer.index] = {
      answers: answer.answers ?? [],
      answerIndex: answer.answerIndex ?? [],
      subjectiveAnswer: answer.subjectiveAnswer ?? "",
      blankValues: question.questionType === 5 ? parseBlankAnswer(answer.blankAnswer ?? "", question.blankCount) : [],
    };
  });

  questionLookup.forEach((question, index) => {
    answerMap[index] ??= createEmptyDraft(question);
  });

  return { answerMap, hasCachedAnswers };
}

function collectInstructions(record: Record<string, unknown>, questionCount: number) {
  const instructions = [
    `本场考试共 ${questionCount} 道大题，请按题号顺序完成作答并及时检查未答题。`,
    `考试时长 ${formatDurationText(record.totalTime ?? record.examDuration ?? record.duration)}，请在倒计时结束前提交试卷。`,
  ];

  const limitCount = toText(record.limitCount);
  if (limitCount) {
    instructions.push(`本场考试最多可参加 ${limitCount} 次，重新进入会优先恢复正在进行中的考试记录。`);
  }

  return instructions;
}

function collectWarnings(record: Record<string, unknown>) {
  const warnings: string[] = [];
  const leaveOn = toNumberOrFallback(record.leaveOn, 0) === 1;
  const totalLeaveTimes = toText(record.totalLeaveTimes);
  const leaveTime = toText(record.leaveTime);
  const snapOn = toNumberOrFallback(record.snapOn, 0) === 1;

  if (leaveOn) {
    warnings.push(
      `旧站已启用切屏检测${totalLeaveTimes ? `，超过 ${totalLeaveTimes} 次` : ""}${leaveTime ? `，单次离开超过 ${leaveTime} 秒` : ""}可能触发自动交卷。`
    );
  }

  if (snapOn) {
    warnings.push("旧站存在抓拍监考配置；本轮仅保留提示，不在新页面内复刻监考组件。");
  }

  if (toNumberOrFallback(record.faceDetectEnable, 0) === 1) {
    warnings.push("旧站可能要求人脸核身；当前迁移页未内嵌核身流程，如接口强依赖该步骤需后续补齐。");
  }

  return warnings;
}

function collectUnsupportedNotes(record: Record<string, unknown>) {
  const notes: string[] = [];

  if (toNumberOrFallback(record.invigilateEnable, 0) === 1) {
    notes.push("监考大屏联动尚未迁移，本页仅承接正常作答、缓存与提交链路。");
  }

  if (toNumberOrFallback(record.faceDetectEnable, 0) === 1) {
    notes.push("人脸核身弹窗尚未接入；若服务端强校验该流程，需要单独补子任务。");
  }

  return notes;
}

function resolveStatusText(record: Record<string, unknown>) {
  const directText = toText(record.state_dictText ?? record.statusName);
  if (directText) {
    return directText;
  }

  const now = Date.now();
  const startAt = toDate(record.startTime ?? record.beginTime ?? record.examStartTime);
  const endAt = toDate(record.endTime ?? record.finishTime ?? record.examEndTime);

  if (startAt && now < startAt.getTime()) {
    return "未开始";
  }

  if (endAt && now > endAt.getTime()) {
    return "已结束";
  }

  return "进行中";
}

function resolveRemainingMs(record: Record<string, unknown>) {
  const limitTime = toDate(record.limitTime);

  if (!limitTime) {
    return null;
  }

  return Math.max(0, limitTime.getTime() - Date.now());
}

function resolveExamRecordId(payload: unknown) {
  const record = toRecordOrEmpty(payload);
  return toText(record.id ?? record.userExamId ?? record.recordId);
}

function normalizeSessionPayload(examId: string, userExamId: string, detailPayload: unknown, cachePayload: unknown) {
  const record = toRecordOrEmpty(detailPayload);
  const questionList = Array.isArray(record.userExamQuestionList) ? record.userExamQuestionList : [];
  const questions = questionList.map(normalizeQuestion);
  const { answerMap, hasCachedAnswers } = createAnswerMap(questions, cachePayload);
  const title = toText(record.examName ?? record.title ?? record.name, `考试 ${examId}`);
  const description = toText(
    record.examDesc ?? record.remark ?? record.description,
    "当前作答页已承接题目区、答题卡、缓存与提交动作。若接口字段缺失，会在页面内直接暴露问题。"
  );
  const candidateName = toText(record.realname ?? record.username ?? record.userName, "当前考生");
  const candidateHint = toText(record.deptName ?? record.className, "考试身份信息待同步");

  return {
    examId: toText(record.examId ?? examId, examId),
    userExamId,
    title,
    summary: toText(record.paperName ?? record.paperTitle ?? record.examPaperName, "在线考试"),
    description,
    candidateName,
    candidateHint,
    statusText: resolveStatusText(record),
    durationText: formatDurationText(record.totalTime ?? record.examDuration ?? record.duration),
    limitTimeIso: toDate(record.limitTime)?.toISOString() ?? null,
    remainingMs: resolveRemainingMs(record),
    progressHint: hasCachedAnswers ? "已恢复上次缓存答案，可直接继续作答。" : "当前为首次进入，你的答案会在作答过程中自动缓存。",
    schedule: [
      { label: "开始时间", value: formatDateTime(record.startTime ?? record.beginTime ?? record.examStartTime) },
      { label: "截止时间", value: formatDateTime(record.endTime ?? record.finishTime ?? record.examEndTime) },
      { label: "创建记录", value: formatDateTime(record.createTime ?? record.startAnswerTime) },
      { label: "userExamId", value: userExamId },
    ],
    instructions: collectInstructions(record, questions.length),
    warnings: collectWarnings(record),
    unsupportedNotes: collectUnsupportedNotes(record),
    questions,
    answerMap,
    hasCachedAnswers,
  } satisfies ExamSessionPayload;
}

export function getExamSessionErrorMessage(error: unknown) {
  const message = error instanceof Error && error.message ? error.message : "在线考试链路初始化失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前只能展示错误说明。`;
  }

  if (message === "网络请求失败") {
    return "在线考试接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

export function getQuestionCountLabel(questions: ExamQuestion[]) {
  return `${questions.length} 道大题`;
}

export function buildPersistedAnswers(
  questions: ExamSessionPayload["questions"],
  answerMap: Record<string, ExamAnswerDraft>
) {
  const persistedAnswers: PersistedExamAnswer[] = [];

  questions.forEach((question) => {
    const leafQuestions = question.questionType === 6 ? question.subQuestions : [question];

    leafQuestions.forEach((leafQuestion) => {
      const draft = answerMap[leafQuestion.index] ?? createEmptyDraft(leafQuestion);

      if (leafQuestion.questionType === 4) {
        const subjectiveAnswer = draft.subjectiveAnswer.trim();
        if (subjectiveAnswer) {
          persistedAnswers.push({
            index: leafQuestion.index,
            questionType: leafQuestion.questionType,
            subjectiveAnswer,
          });
        }
        return;
      }

      if (leafQuestion.questionType === 5) {
        const blankAnswerPayload = draft.blankValues
          .map((value, index) => ({
            tag: leafQuestion.options[index]?.label ?? String(index + 1),
            content: value.trim(),
          }))
          .filter((item) => item.content);

        if (blankAnswerPayload.length > 0) {
          persistedAnswers.push({
            index: leafQuestion.index,
            questionType: leafQuestion.questionType,
            blankAnswer: JSON.stringify(blankAnswerPayload),
          });
        }
        return;
      }

      if (draft.answers.length > 0) {
        persistedAnswers.push({
          index: leafQuestion.index,
          questionType: leafQuestion.questionType,
          answers: draft.answers,
          answerIndex: draft.answerIndex,
        });
      }
    });
  });

  return persistedAnswers;
}

export async function initializeExamSession(examId: string) {
  const ongoingResult = await listExamIn();
  const ongoingRecordId = resolveExamRecordId(unwrapEnvelope(ongoingResult));

  if (ongoingRecordId) {
    const detailPayload = unwrapEnvelope(await getExamDetail(ongoingRecordId));
    const cachePayload = unwrapEnvelope(await getCacheAnswer(ongoingRecordId));
    return normalizeSessionPayload(examId, ongoingRecordId, detailPayload, cachePayload);
  }

  const createdPayload = unwrapEnvelope(await createExam(examId));
  const userExamId = resolveExamRecordId(createdPayload);

  if (!userExamId) {
    throw new Error("开始考试接口未返回 userExamId，当前无法安全进入作答页。");
  }

  const detailPayload = unwrapEnvelope(await getExamDetail(userExamId));
  const cachePayload = unwrapEnvelope(await getCacheAnswer(userExamId));

  return normalizeSessionPayload(examId, userExamId, detailPayload, cachePayload);
}

export async function persistExamCache(payload: {
  userExamId: string;
  limitTime: string | null;
  questions: ExamSessionPayload["questions"];
  answerMap: Record<string, ExamAnswerDraft>;
}) {
  const examAnswers = buildPersistedAnswers(payload.questions, payload.answerMap);
  await cacheExamAnswer({
    userExamId: payload.userExamId,
    limitTime: payload.limitTime,
    examAnswers,
  });
}

export async function submitExamSession(payload: {
  userExamId: string;
  questions: ExamSessionPayload["questions"];
  answerMap: Record<string, ExamAnswerDraft>;
}) {
  const examAnswers = buildPersistedAnswers(payload.questions, payload.answerMap);
  await submitExam({
    userExamId: payload.userExamId,
    examAnswers,
  });
}

export type { ExamChoiceOption, ExamQuestion, ExamQuestionGroup, ExamQuestionLeaf };
