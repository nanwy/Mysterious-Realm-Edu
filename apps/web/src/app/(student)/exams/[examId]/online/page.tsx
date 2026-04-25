"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  EmptyState,
  Input,
  Skeleton,
  StudentShell,
  Textarea,
} from "@workspace/ui";
import { cn } from "@workspace/ui/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Send,
  ShieldCheck,
} from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import {
  examQueryOptions,
  type ExamOnlineAnswerDraft,
  type ExamOnlineQuestion,
  useCacheExamAnswerMutation,
  useSubmitExamMutation,
} from "@/core/exams";

const SELECT_QUESTION_TYPES = new Set([1, 2, 3]);

const formatSeconds = (value: number | null) => {
  if (value === null) {
    return "以考试详情为准";
  }

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  return [hours, minutes, seconds]
    .map((item) => String(item).padStart(2, "0"))
    .join(":");
};

const parseBlankAnswer = (value: string | undefined) => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return {};
    }

    return parsed.reduce<Record<string, string>>((acc, item) => {
      if (item && typeof item === "object" && "tag" in item) {
        acc[String(item.tag)] =
          "content" in item && typeof item.content === "string"
            ? item.content
            : "";
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const makeAnswerKey = (index: number | string) => String(index);

const isQuestionAnswered = (
  question: ExamOnlineQuestion,
  answers: ExamOnlineAnswerDraft[]
) => {
  if (question.type === 6) {
    return answers.some((answer) =>
      makeAnswerKey(answer.index).startsWith(`${question.index}.`)
    );
  }

  return answers.some(
    (answer) => makeAnswerKey(answer.index) === String(question.index)
  );
};

const getAnswerForQuestion = (
  question: ExamOnlineQuestion,
  answers: ExamOnlineAnswerDraft[]
) =>
  answers.find(
    (answer) => makeAnswerKey(answer.index) === String(question.index)
  );

const OnlineExamLoadingState = () => (
  <div className="grid gap-5">
    <Skeleton className="h-36 rounded-[28px]" />
    <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_17rem]">
      <Skeleton className="h-96 rounded-[28px]" />
      <Skeleton className="h-[32rem] rounded-[28px]" />
      <Skeleton className="h-80 rounded-[28px]" />
    </div>
  </div>
);

const OnlineExamEmptyState = () => (
  <div className="rounded-[32px] border border-dashed border-border bg-card/80 px-6 py-14">
    <EmptyState
      title="在线考试暂不可进入"
      description="当前路由缺少可用考试 ID，或考试详情没有返回可展示的题目信息。"
    />
  </div>
);

const OnlineExamRoute = ({
  params,
}: {
  params: Promise<{ examId: string }>;
}) => {
  const routeParams = use(params);
  const examId = routeParams.examId;
  const sessionQuery = useQuery(examQueryOptions.online(examId));
  const cacheMutation = useCacheExamAnswerMutation();
  const submitMutation = useSubmitExamMutation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamOnlineAnswerDraft[]>([]);
  const [hydratedSessionId, setHydratedSessionId] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const session = sessionQuery.data;

  useEffect(() => {
    if (!session || hydratedSessionId === session.userExamId) {
      return;
    }

    setHydratedSessionId(session.userExamId);
    setAnswers(session.cachedAnswers);
    setCurrentIndex(0);
  }, [hydratedSessionId, session]);

  const questions = session?.questions ?? [];
  const currentQuestion = questions[currentIndex] ?? questions[0];
  const answeredCount = useMemo(
    () =>
      questions.filter((question) => isQuestionAnswered(question, answers))
        .length,
    [answers, questions]
  );
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const persistAnswers = (nextAnswers: ExamOnlineAnswerDraft[]) => {
    if (!session) {
      return;
    }

    cacheMutation.mutate({
      limitTime: session.limitTime,
      userExamId: session.userExamId,
      examAnswers: nextAnswers,
    });
  };

  const updateAnswers = (
    updater: (current: ExamOnlineAnswerDraft[]) => ExamOnlineAnswerDraft[]
  ) => {
    setAnswers((current) => {
      const nextAnswers = updater(current);
      persistAnswers(nextAnswers);
      return nextAnswers;
    });
  };

  const replaceAnswer = (nextAnswer: ExamOnlineAnswerDraft | null) => {
    if (!currentQuestion) {
      return;
    }

    updateAnswers((current) => {
      const withoutCurrent = current.filter(
        (answer) =>
          makeAnswerKey(answer.index) !== String(currentQuestion.index)
      );
      return nextAnswer ? [...withoutCurrent, nextAnswer] : withoutCurrent;
    });
  };

  const toggleOption = (optionId: string, optionIndex: number) => {
    if (!currentQuestion) {
      return;
    }

    const currentAnswer = getAnswerForQuestion(currentQuestion, answers);
    const currentIds = currentAnswer?.answers ?? [];
    const currentIndexes = currentAnswer?.answerIndex ?? [];
    const isSelected = currentIds.includes(optionId);
    const isSingle = currentQuestion.type === 1 || currentQuestion.type === 3;
    const nextIds = isSelected
      ? currentIds.filter((item) => item !== optionId)
      : isSingle
        ? [optionId]
        : [...currentIds, optionId];
    const nextIndexes = isSelected
      ? currentIndexes.filter((item) => item !== optionIndex)
      : isSingle
        ? [optionIndex]
        : [...currentIndexes, optionIndex];

    replaceAnswer(
      nextIds.length
        ? {
            index: currentQuestion.index,
            questionType: currentQuestion.type,
            answers: nextIds,
            answerIndex: nextIndexes,
          }
        : null
    );
  };

  const updateSubjectiveAnswer = (value: string) => {
    if (!currentQuestion) {
      return;
    }

    replaceAnswer(
      value.trim()
        ? {
            index: currentQuestion.index,
            questionType: currentQuestion.type,
            subjectiveAnswer: value,
          }
        : null
    );
  };

  const updateBlankAnswer = (tag: string, value: string) => {
    if (!currentQuestion) {
      return;
    }

    const currentAnswer = getAnswerForQuestion(currentQuestion, answers);
    const blankMap = parseBlankAnswer(currentAnswer?.blankAnswer);
    blankMap[tag] = value;
    const filled = Object.entries(blankMap)
      .filter(([, content]) => content.trim())
      .map(([itemTag, content]) => ({ tag: itemTag, content: content.trim() }));

    replaceAnswer(
      filled.length
        ? {
            index: currentQuestion.index,
            questionType: currentQuestion.type,
            blankAnswer: JSON.stringify(filled),
          }
        : null
    );
  };

  const submitExam = () => {
    if (!session) {
      return;
    }

    const unanswered = Math.max(0, questions.length - answeredCount);
    setActionMessage(
      unanswered
        ? `还有 ${unanswered} 题未作答。请确认是否继续提交当前答案。`
        : "正在提交当前答题结果。"
    );
    submitMutation.mutate(
      {
        examId: session.examId,
        userExamId: session.userExamId,
        examAnswers: answers,
      },
      {
        onSuccess: () =>
          setActionMessage("试卷已提交，稍后可在成绩中心查看结果。"),
        onError: () =>
          setActionMessage(
            "提交暂未成功，答案仍保留在当前页面并会继续尝试缓存。"
          ),
      }
    );
  };

  const answerForCurrent = currentQuestion
    ? getAnswerForQuestion(currentQuestion, answers)
    : null;

  return (
    <StudentShell
      title="在线考试"
      description="进入正式作答空间，确认题目、计时、答题进度与保存状态。"
    >
      {sessionQuery.isLoading ? (
        <OnlineExamLoadingState />
      ) : !session || !currentQuestion ? (
        <OnlineExamEmptyState />
      ) : (
        <div className="grid gap-5">
          <section className="overflow-hidden rounded-[32px] border border-border bg-card/90 shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="grid gap-5 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>作答中</Badge>
                  <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Exam #{session.examId}
                  </span>
                </div>
                <div className="grid gap-3">
                  <h2 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground">
                    {session.title}
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                    {session.statusMessage}
                  </p>
                </div>
                {session.warning ? (
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>考试信息未完全同步</AlertTitle>
                    <AlertDescription>{session.warning}</AlertDescription>
                  </Alert>
                ) : null}
              </div>

              <aside className="grid gap-4 border-t border-border bg-muted/30 p-5 sm:p-6 lg:border-t-0 lg:border-l">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      剩余时间
                    </p>
                    <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                      {formatSeconds(session.remainSeconds)}
                    </p>
                  </div>
                  <Clock3 className="size-8 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["题目", `${session.questionCount || questions.length}`],
                    ["总分", `${session.totalScore || "--"}`],
                    [
                      "时长",
                      session.totalTime ? `${session.totalTime}m` : "--",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[22px] border border-border/80 bg-background/70 p-3"
                    >
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_17rem] xl:items-start">
            <aside className="grid gap-4 rounded-[30px] border border-border bg-card/85 p-4 shadow-sm xl:sticky xl:top-24">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">答题卡</p>
                <p className="text-sm text-muted-foreground">
                  {answeredCount}/{questions.length} 已答，当前进度 {progress}%
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid gap-4">
                {session.answerGroups.map((group) => (
                  <div
                    key={`${group.typeName}-${group.questionType}`}
                    className="grid gap-3"
                  >
                    <div className="border-b border-border pb-2">
                      <p className="text-sm font-semibold text-foreground">
                        {group.typeName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.questionCount} 题 / {group.questionScore} 分
                      </p>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {group.indexes.map((index) => {
                        const targetQuestion = questions.find(
                          (question) => question.index === index
                        );
                        const active = currentQuestion.index === index;
                        const answered = targetQuestion
                          ? isQuestionAnswered(targetQuestion, answers)
                          : false;

                        return (
                          <button
                            key={index}
                            type="button"
                            className={cn(
                              "flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : answered
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-border bg-background text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() =>
                              setCurrentIndex(
                                Math.max(
                                  0,
                                  questions.findIndex(
                                    (question) => question.index === index
                                  )
                                )
                              )
                            }
                          >
                            {index}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <main className="grid gap-5 rounded-[32px] border border-border bg-card/90 p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{currentQuestion.typeName}</Badge>
                    <span className="text-sm text-muted-foreground">
                      第 {currentQuestion.index} 题 / {currentQuestion.score} 分
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold leading-snug text-foreground">
                    {currentQuestion.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border bg-muted/35 px-3 py-2 text-sm text-muted-foreground">
                  <ShieldCheck className="size-4" />
                  自动缓存
                </div>
              </div>

              {SELECT_QUESTION_TYPES.has(currentQuestion.type) ? (
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const selected = answerForCurrent?.answers?.includes(
                      option.id
                    );
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={cn(
                          "grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3 rounded-[24px] border p-4 text-left transition",
                          selected
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border bg-background/65 text-foreground hover:border-primary/40"
                        )}
                        onClick={() => toggleOption(option.id, optionIndex)}
                      >
                        <span
                          className={cn(
                            "flex size-9 items-center justify-center rounded-full border text-sm font-semibold",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground"
                          )}
                        >
                          {option.tag}
                        </span>
                        <span className="pt-1 text-sm leading-7">
                          {option.content}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : currentQuestion.type === 5 ? (
                <div className="grid gap-3">
                  {(currentQuestion.options.length
                    ? currentQuestion.options
                    : [{ id: "blank", tag: "1", content: "填空" }]
                  ).map((option) => {
                    const blankMap = parseBlankAnswer(
                      answerForCurrent?.blankAnswer
                    );
                    return (
                      <label
                        key={option.id}
                        className="grid gap-2 rounded-[22px] border border-border bg-background/65 p-4"
                      >
                        <span className="text-sm font-medium text-foreground">
                          空 {option.tag}
                        </span>
                        <Input
                          value={blankMap[option.tag] ?? ""}
                          onChange={(event) =>
                            updateBlankAnswer(option.tag, event.target.value)
                          }
                          placeholder="输入答案"
                        />
                      </label>
                    );
                  })}
                </div>
              ) : currentQuestion.type === 6 ? (
                <div className="rounded-[24px] border border-border bg-muted/30 p-5">
                  <p className="text-sm leading-7 text-muted-foreground">
                    组合题的子题结构已读取到{" "}
                    {currentQuestion.subQuestions.length} 小题。
                    请先确认题干与其他题目，组合题的精细作答控件会在服务返回完整子题结构后开放。
                  </p>
                </div>
              ) : (
                <Textarea
                  minLength={0}
                  value={answerForCurrent?.subjectiveAnswer ?? ""}
                  onChange={(event) =>
                    updateSubjectiveAnswer(event.target.value)
                  }
                  placeholder="输入本题答案"
                />
              )}

              <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() =>
                    setCurrentIndex((value) => Math.max(0, value - 1))
                  }
                >
                  上一题
                </Button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentIndex >= questions.length - 1}
                    onClick={() =>
                      setCurrentIndex((value) =>
                        Math.min(questions.length - 1, value + 1)
                      )
                    }
                  >
                    下一题
                  </Button>
                  <Button
                    type="button"
                    disabled={submitMutation.isPending}
                    onClick={submitExam}
                  >
                    <Send className="size-4" />
                    提交试卷
                  </Button>
                </div>
              </div>
            </main>

            <aside className="grid gap-4 rounded-[30px] border border-border bg-card/85 p-4 shadow-sm xl:sticky xl:top-24">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  考试状态
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  系统会持续提示保存状态。离开页面前请确认答题进度，并优先使用提交按钮完成本次考试。
                </p>
              </div>
              <div className="grid gap-3">
                {[
                  ["缓存状态", cacheMutation.isPending ? "同步中" : "已就绪"],
                  ["答题进度", `${answeredCount}/${questions.length}`],
                  ["当前题型", currentQuestion.typeName],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              {actionMessage ? (
                <Alert>
                  <CheckCircle2 className="size-4" />
                  <AlertTitle>操作反馈</AlertTitle>
                  <AlertDescription>{actionMessage}</AlertDescription>
                </Alert>
              ) : null}
            </aside>
          </div>
        </div>
      )}
    </StudentShell>
  );
};

export default OnlineExamRoute;
