import {
  cacheExamAnswer,
  createExam,
  getCacheAnswer,
  getExamDetail,
  listExamIn,
  submitExam,
  unwrapEnvelope,
} from "@workspace/api";
import { stripHtmlTags, toDate, toNumberOrNull, toRecordOrEmpty, toText } from "@/lib/normalize";

type CacheState = "none" | "restored" | "dirty" | "saved" | "error";

interface ExamOption {
  id: string;
  tag: string;
  content: string;
}

interface ExamAnswerRecord {
  index: string;
  questionType: number;
  answers?: string[];
  answerIndex?: number[];
  subjectiveAnswer?: string;
  blankAnswer?: string;
}

interface ExamQuestion {
  id: string;
  index: string;
  type: number;
  typeLabel: string;
  scoreText: string;
  contentHtml: string;
  contentText: string;
  options: ExamOption[];
  subQuestions: ExamQuestion[];
}

interface ExamCardGroup {
  label: string;
  questionCount: string;
  questionScore: string;
  indexList: string[];
}

interface ExamSessionBootstrap {
  examId: string;
  userExamId: string;
  source: "created" | "resumed" | "provided";
  sourceExamTitle: string;
}

interface ExamSessionPayload {
  examId: string;
  userExamId: string;
  examTitle: string;
  examSummary: string;
  studentName: string;
  studentAccount: string;
  questionCountText: string;
  totalScoreText: string;
  totalTimeText: string;
  progressText: string;
  limitTimeValue: string;
  limitTimeLabel: string;
  answerCardGroups: ExamCardGroup[];
  questions: ExamQuestion[];
  cachedAnswers: ExamAnswerRecord[];
  cacheState: CacheState;
  cacheHint: string;
  startSummary: string;
  sessionSignals: Array<{ label: string; value: string; detail: string }>;
  issues: string[];
}

function toRecordArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => toRecordOrEmpty(item)) : [];
}

function toQuestionIndex(value: unknown, fallback: string) {
  const text = toText(value, fallback);
  return text || fallback;
}

function formatDateTime(value: unknown, fallback = "未返回截止时间") {
  const date = toDate(value);
  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toDateValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return toText(value);
}

function normalizeOption(option: Record<string, unknown>, index: number): ExamOption {
  return {
    id: toText(option.id ?? option.answerId, `option-${index + 1}`),
    tag: toText(option.tag, String.fromCharCode(65 + index)),
    content: toText(option.content ?? option.answerContent, "选项内容待同步"),
  };
}

function normalizeQuestion(item: unknown, index: number, parentIndex?: string): ExamQuestion {
  const record = toRecordOrEmpty(item);
  const question = toRecordOrEmpty(record.question);
  const currentIndex = toQuestionIndex(record.questionIndex, String(index + 1));
  const resolvedIndex = parentIndex ? `${parentIndex}.${currentIndex}` : currentIndex;
  const answerList = toRecordArray(question.answerList);
  const subQuestionList = Array.isArray(record.subQuestionList) ? record.subQuestionList : [];
  const contentHtml = toText(question.content ?? record.content, "题目内容待同步");

  return {
    id: toText(record.id ?? question.id, resolvedIndex),
    index: resolvedIndex,
    type: toNumberOrNull(record.questionType) ?? 0,
    typeLabel: toText(record.questionTypeName ?? record.questionTypeText, "题目"),
    scoreText: toText(record.questionScore ?? record.score, "--"),
    contentHtml,
    contentText: stripHtmlTags(contentHtml),
    options: answerList.map(normalizeOption),
    subQuestions: subQuestionList.map((subQuestion, subIndex) =>
      normalizeQuestion(subQuestion, subIndex, currentIndex)
    ),
  };
}

function buildAnswerCardGroups(detail: Record<string, unknown>, questions: ExamQuestion[]) {
  const answerCardList = Array.isArray(detail.answerCardList) ? detail.answerCardList : [];
  if (answerCardList.length > 0) {
    return answerCardList
      .map((group) => {
        const entries = Object.entries(toRecordOrEmpty(group));
        return entries.map(([label, value]) => {
          const record = toRecordOrEmpty(value);
          const indexList = Array.isArray(record.indexList)
            ? record.indexList.map((item, index) => toQuestionIndex(item, String(index + 1)))
            : [];

          return {
            label,
            questionCount: toText(record.questionCount, "--"),
            questionScore: toText(record.questionScore, "--"),
            indexList,
          };
        });
      })
      .flat();
  }

  const groups = new Map<string, { count: number; score: number; indexes: string[] }>();
  for (const question of questions) {
    const current = groups.get(question.typeLabel) ?? {
      count: 0,
      score: 0,
      indexes: [],
    };

    current.count += 1;
    current.score += toNumberOrNull(question.scoreText) ?? 0;
    current.indexes.push(question.index);
    groups.set(question.typeLabel, current);
  }

  return Array.from(groups.entries()).map(([label, group]) => ({
    label,
    questionCount: String(group.count),
    questionScore: group.score > 0 ? String(group.score) : "--",
    indexList: group.indexes,
  }));
}

function normalizeCachedAnswers(value: unknown) {
  const record = toRecordOrEmpty(value);
  const examAnswers = Array.isArray(record.examAnswers) ? record.examAnswers : [];

  return examAnswers
    .map((item) => {
      const answer = toRecordOrEmpty(item);
      const index = toText(answer.index);
      if (!index) {
        return null;
      }

      return {
        index,
        questionType: toNumberOrNull(answer.questionType) ?? 0,
        answers: Array.isArray(answer.answers) ? answer.answers.map((entry) => toText(entry)).filter(Boolean) : [],
        answerIndex: Array.isArray(answer.answerIndex)
          ? answer.answerIndex
              .map((entry) => toNumberOrNull(entry))
              .filter((entry): entry is number => entry !== null)
          : [],
        subjectiveAnswer: toText(answer.subjectiveAnswer),
        blankAnswer: toText(answer.blankAnswer),
      } satisfies ExamAnswerRecord;
    })
    .filter((item): item is ExamAnswerRecord => item !== null);
}

async function resolveBootstrapFromExistingExam(activeRecord: Record<string, unknown>, fallbackExamId: string) {
  const userExamId = toText(activeRecord.id ?? activeRecord.userExamId);
  if (!userExamId) {
    throw new Error("进行中的考试未返回 userExamId，无法继续进入作答页。");
  }

  const detail = unwrapEnvelope(await getExamDetail(userExamId));
  const detailRecord = toRecordOrEmpty(detail);

  return {
    examId: toText(detailRecord.examId ?? detailRecord.id, fallbackExamId),
    userExamId,
    source: "resumed",
    sourceExamTitle: toText(detailRecord.examTitle ?? detailRecord.title ?? detailRecord.examName, "进行中的考试"),
  } satisfies ExamSessionBootstrap;
}

export async function initializeExamSession(examId: string): Promise<ExamSessionBootstrap> {
  const existing = unwrapEnvelope(await listExamIn());
  const existingRecord = toRecordOrEmpty(existing);
  if (Object.keys(existingRecord).length > 0) {
    return resolveBootstrapFromExistingExam(existingRecord, examId);
  }

  const created = unwrapEnvelope(await createExam(examId));
  const createdRecord = toRecordOrEmpty(created);
  const userExamId = toText(createdRecord.id ?? createdRecord.userExamId);

  if (!userExamId) {
    throw new Error("开始考试接口未返回 userExamId，暂时无法建立作答会话。");
  }

  return {
    examId: toText(createdRecord.examId, examId),
    userExamId,
    source: "created",
    sourceExamTitle: toText(createdRecord.examTitle ?? createdRecord.title, "当前考试"),
  };
}

export async function fetchExamSession(examId: string, initialUserExamId?: string) {
  const bootstrap: ExamSessionBootstrap = initialUserExamId
    ? {
        examId,
        userExamId: initialUserExamId,
        source: "provided",
        sourceExamTitle: "当前考试",
      }
    : await initializeExamSession(examId);

  const [detailResult, cacheResult] = await Promise.allSettled([
    getExamDetail(bootstrap.userExamId),
    getCacheAnswer(bootstrap.userExamId),
  ]);

  if (detailResult.status === "rejected") {
    throw detailResult.reason;
  }

  const detail = toRecordOrEmpty(unwrapEnvelope(detailResult.value));
  const questionsSource = Array.isArray(detail.userExamQuestionList) ? detail.userExamQuestionList : [];
  const questions = questionsSource.map((item, index) => normalizeQuestion(item, index));
  const cachedAnswers =
    cacheResult.status === "fulfilled" ? normalizeCachedAnswers(unwrapEnvelope(cacheResult.value)) : [];
  const studentName = toText(
    detail.realname ?? detail.userRealname ?? detail.studentName ?? detail.userName,
    "当前考生"
  );
  const studentAccount = toText(detail.username ?? detail.userName ?? detail.studentCode, "账号待同步");
  const totalTimeText = toText(detail.totalTime ?? detail.examDuration ?? detail.duration, "--");
  const totalScoreText = toText(detail.totalScore ?? toRecordOrEmpty(detail.paper).totalScore, "--");
  const questionCountText = toText(detail.questionCount ?? toRecordOrEmpty(detail.paper).questionCount, "--");
  const progressCount = new Set(
    cachedAnswers.map((item) => (item.index.includes(".") ? item.index.split(".")[0] : item.index))
  ).size;
  const issues = [
    questions.length === 0 ? "考试详情接口未返回题目列表，当前不能安全进入正式作答。" : null,
    !toText(detail.limitTime) ? "接口未返回 limitTime，倒计时已退化为说明文本，不会伪造剩余时间。" : null,
    cacheResult.status === "rejected" ? "缓存答案读取失败，页面会继续承接作答，但无法恢复上次保存内容。" : null,
  ].filter((item): item is string => Boolean(item));

  return {
    examId: toText(detail.examId, bootstrap.examId),
    userExamId: bootstrap.userExamId,
    examTitle: toText(detail.examTitle ?? detail.title ?? detail.examName, bootstrap.sourceExamTitle || `考试 ${examId}`),
    examSummary: `本试卷共 ${questionCountText} 题，满分 ${totalScoreText} 分，考试时长 ${totalTimeText} 分钟。`,
    studentName,
    studentAccount,
    questionCountText,
    totalScoreText,
    totalTimeText,
    progressText: questions.length > 0 ? `${progressCount}/${questions.length}` : "0/0",
    limitTimeValue: toDateValue(detail.limitTime),
    limitTimeLabel: formatDateTime(detail.limitTime),
    answerCardGroups: buildAnswerCardGroups(detail, questions),
    questions,
    cachedAnswers,
    cacheState: cachedAnswers.length > 0 ? "restored" : "none",
    cacheHint:
      cachedAnswers.length > 0
        ? `已恢复 ${cachedAnswers.length} 条缓存答案，可继续当前会话。`
        : "当前会话没有可恢复的缓存答案。",
    startSummary:
      bootstrap.source === "resumed"
        ? "检测到你有进行中的考试，本页已直接续接原作答会话。"
        : bootstrap.source === "created"
          ? "已为你创建新的考试会话，当前可直接开始作答。"
          : "当前页使用路由中的 userExamId 承接考试详情。",
    sessionSignals: [
      {
        label: "会话来源",
        value: bootstrap.source === "resumed" ? "继续作答" : bootstrap.source === "created" ? "新建会话" : "直接进入",
        detail: bootstrap.source === "resumed" ? "优先延续已有进行中考试，避免重复创建记录。" : "保持 examId 与 userExamId 分离。",
      },
      {
        label: "交卷截止",
        value: formatDateTime(detail.limitTime),
        detail: "倒计时以接口返回的 limitTime 为准，未返回时只保留说明。",
      },
      {
        label: "缓存状态",
        value: cachedAnswers.length > 0 ? "已恢复" : "暂无缓存",
        detail: "输入与选项改动会自动走缓存接口同步。",
      },
    ],
    issues,
  } satisfies ExamSessionPayload;
}

export async function reloadExamCache(userExamId: string) {
  const cache = unwrapEnvelope(await getCacheAnswer(userExamId));
  return normalizeCachedAnswers(cache);
}

export async function persistExamAnswers(userExamId: string, limitTimeValue: string, answers: ExamAnswerRecord[]) {
  await cacheExamAnswer({
    userExamId,
    limitTime: limitTimeValue,
    examAnswers: answers,
  });
}

export async function submitExamAnswers(userExamId: string, answers: ExamAnswerRecord[]) {
  await submitExam({
    userExamId,
    examAnswers: answers,
  });
}

export function normalizeExamSessionError(error: unknown) {
  const message = error instanceof Error && error.message ? error.message : "在线考试作答页暂时不可用。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message} 未检测到 NEXT_PUBLIC_API_BASE_URL，当前只能展示错误说明。`;
  }

  if (message === "网络请求失败") {
    return "在线考试接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

export type { CacheState, ExamAnswerRecord, ExamQuestion, ExamSessionPayload };
