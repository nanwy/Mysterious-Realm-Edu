"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Button, EmptyState, Skeleton, SurfaceCard, Textarea } from "@workspace/ui";
import { fetchExamSession, normalizeExamSessionError, persistExamAnswers, reloadExamCache, submitExamAnswers, type CacheState, type ExamAnswerRecord, type ExamQuestion, type ExamSessionPayload } from "./exam-session-data";

function ExamSessionLoadingState() {
  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08} data-testid="exam-session-loading">
      <MotionItem>
        <Skeleton className="h-40 rounded-[32px]" />
      </MotionItem>
      <MotionItem>
        <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_18rem]">
          <Skeleton className="h-[34rem] rounded-[32px]" />
          <Skeleton className="h-[34rem] rounded-[32px]" />
          <Skeleton className="h-[34rem] rounded-[32px]" />
        </div>
      </MotionItem>
    </MotionStagger>
  );
}

function ExamSessionEmptyState({ examId }: { examId: string }) {
  return (
    <MotionReveal data-testid="exam-session-empty" className="rounded-[32px] border border-dashed border-border bg-card/80 px-6 py-14 shadow-sm">
      <EmptyState
        title="当前考试暂无可作答内容"
        description={`考试 ${examId} 没有返回题目列表或关键字段，当前不会伪装成可提交的完成态。`}
      />
    </MotionReveal>
  );
}

function parseBlankAnswer(value?: string) {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return {};
    }

    return parsed.reduce<Record<string, string>>((accumulator, item) => {
      if (!item || typeof item !== "object") {
        return accumulator;
      }

      const record = item as Record<string, unknown>;
      const tag = typeof record.tag === "string" ? record.tag : "";
      const content = typeof record.content === "string" ? record.content : "";
      if (tag) {
        accumulator[tag] = content;
      }

      return accumulator;
    }, {});
  } catch {
    return {};
  }
}

function isQuestionAnswered(question: ExamQuestion, answers: ExamAnswerRecord[]) {
  if (question.type === 6) {
    return answers.some((item) => item.index.startsWith(`${question.index}.`));
  }

  return answers.some((item) => item.index === question.index);
}

function createChoiceAnswer(index: string, questionType: number, answerId: string, optionIndex: number, multiple: boolean, previous?: ExamAnswerRecord) {
  const currentIds = previous?.answers ?? [];
  const currentIndexes = previous?.answerIndex ?? [];

  if (!multiple) {
    return {
      index,
      questionType,
      answers: [answerId],
      answerIndex: [optionIndex],
    } satisfies ExamAnswerRecord;
  }

  const exists = currentIds.includes(answerId);
  const nextIds = exists ? currentIds.filter((item) => item !== answerId) : [...currentIds, answerId];
  const nextIndexes = exists ? currentIndexes.filter((item) => item !== optionIndex) : [...currentIndexes, optionIndex];

  if (nextIds.length === 0) {
    return null;
  }

  return {
    index,
    questionType,
    answers: nextIds,
    answerIndex: nextIndexes,
  } satisfies ExamAnswerRecord;
}

function upsertAnswer(answers: ExamAnswerRecord[], nextAnswer: ExamAnswerRecord | null, index: string) {
  const filtered = answers.filter((item) => item.index !== index);
  return nextAnswer ? [...filtered, nextAnswer] : filtered;
}

function calculateRemainingTime(limitTimeValue: string) {
  if (!limitTimeValue) {
    return null;
  }

  const numeric = Number(limitTimeValue);
  const normalized = Number.isFinite(numeric)
    ? new Date(numeric > 1e12 ? numeric : numeric * 1000)
    : new Date(limitTimeValue.replace(/\//g, "-"));
  if (Number.isNaN(normalized.getTime())) {
    return null;
  }

  return normalized.getTime() - Date.now();
}

function formatCountdown(ms: number | null) {
  if (ms === null) {
    return "未返回倒计时";
  }

  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getCacheTone(state: CacheState) {
  if (state === "error") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  if (state === "saved" || state === "restored") {
    return "border-primary/20 bg-primary/10 text-primary";
  }

  if (state === "dirty") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "border-border/70 bg-background/70 text-muted-foreground";
}

function getCacheLabel(state: CacheState) {
  if (state === "restored") {
    return "已恢复缓存";
  }

  if (state === "dirty") {
    return "正在同步";
  }

  if (state === "saved") {
    return "已同步";
  }

  if (state === "error") {
    return "同步失败";
  }

  return "暂无缓存";
}

function QuestionContent({ question }: { question: ExamQuestion }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/90 text-sm font-semibold text-foreground">
          {question.index}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{question.typeLabel}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{question.scoreText} 分</p>
          </div>
          <div
            className="prose prose-sm max-w-none text-foreground dark:prose-invert [&_p]:my-0"
            dangerouslySetInnerHTML={{ __html: question.contentHtml }}
          />
        </div>
      </div>
    </div>
  );
}

export function ExamSessionPageShell({
  examId,
  initialUserExamId,
}: {
  examId: string;
  initialUserExamId?: string;
}) {
  const router = useRouter();
  const [session, setSession] = useState<ExamSessionPayload | null>(null);
  const [answers, setAnswers] = useState<ExamAnswerRecord[]>([]);
  const [cacheState, setCacheState] = useState<CacheState>("none");
  const [cacheHint, setCacheHint] = useState("当前会话没有可恢复的缓存答案。");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloadingCache, setIsReloadingCache] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const autoSubmitTriggeredRef = useRef(false);
  const saveRevisionRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchExamSession(examId, initialUserExamId)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setSession(result);
        setAnswers(result.cachedAnswers);
        setCacheState(result.cacheState);
        setCacheHint(result.cacheHint);
        setCurrentQuestionIndex(result.questions[0]?.index ?? "1");
        setRemainingMs(calculateRemainingTime(result.limitTimeValue));
        autoSubmitTriggeredRef.current = false;
        saveRevisionRef.current = 0;
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setSession(null);
        setAnswers([]);
        setError(normalizeExamSessionError(requestError));
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examId, initialUserExamId, reloadVersion]);

  useEffect(() => {
    if (remainingMs === null) {
      return;
    }

    if (remainingMs <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingMs((value) => {
        if (value === null) {
          return null;
        }

        return value - 1000;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [remainingMs]);

  async function handleSubmit(reason: "manual" | "timeout") {
    if (!session || isSubmitting) {
      return;
    }

    const unanswered = session.questions.filter((question) => !isQuestionAnswered(question, answers)).length;
    if (reason === "manual" && unanswered > 0) {
      const confirmed = window.confirm(`还有 ${unanswered} 题未作答，确定现在交卷吗？`);
      if (!confirmed) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await submitExamAnswers(session.userExamId, answers);
      setCacheState("saved");
      setCacheHint(reason === "timeout" ? "倒计时结束，试卷已自动提交。" : "试卷已提交，正在跳转到成绩详情页。");
      startTransition(() => {
        router.push(`/scores/${session.examId}`);
      });
    } catch (requestError) {
      setCacheState("error");
      setCacheHint(normalizeExamSessionError(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (remainingMs !== null && remainingMs <= 0 && session && !autoSubmitTriggeredRef.current) {
      autoSubmitTriggeredRef.current = true;
      void handleSubmit("timeout");
    }
  }, [remainingMs, session]);

  useEffect(() => {
    if (!session || saveRevisionRef.current === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCacheState("dirty");
      void persistExamAnswers(session.userExamId, session.limitTimeValue, answers)
        .then(() => {
          setCacheState("saved");
          setCacheHint("答案已同步到缓存，可离开后继续恢复。");
        })
        .catch((requestError) => {
          setCacheState("error");
          setCacheHint(normalizeExamSessionError(requestError));
        });
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [answers, session]);

  const currentQuestion = useMemo(() => {
    return session?.questions.find((question) => question.index === currentQuestionIndex) ?? session?.questions[0] ?? null;
  }, [currentQuestionIndex, session]);

  function updateAnswers(nextAnswers: ExamAnswerRecord[]) {
    saveRevisionRef.current += 1;
    setAnswers(nextAnswers);
  }

  async function handleReloadCache() {
    if (!session) {
      return;
    }

    setIsReloadingCache(true);
    try {
      const restored = await reloadExamCache(session.userExamId);
      setAnswers(restored);
      setCacheState(restored.length > 0 ? "restored" : "none");
      setCacheHint(restored.length > 0 ? `已重新读取 ${restored.length} 条缓存答案。` : "缓存接口返回空结果，当前保持本地答案。");
    } catch (requestError) {
      setCacheState("error");
      setCacheHint(normalizeExamSessionError(requestError));
    } finally {
      setIsReloadingCache(false);
    }
  }

  function renderChoiceQuestion(question: ExamQuestion) {
    const currentAnswer = answers.find((item) => item.index === question.index);
    const selected = new Set(currentAnswer?.answerIndex ?? []);
    const multiple = question.type === 2;

    return (
      <div className="grid gap-3">
        {question.options.map((option, optionIndex) => {
          const isActive = selected.has(optionIndex);
          return (
            <button
              key={option.id}
              type="button"
              className={`grid gap-3 rounded-[24px] border px-4 py-4 text-left transition-colors ${
                isActive
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border/70 bg-background/85 text-foreground hover:border-primary/40 hover:bg-muted/40"
              }`}
              onClick={() => {
                updateAnswers(
                  upsertAnswer(
                    answers,
                    createChoiceAnswer(question.index, question.type, option.id, optionIndex, multiple, currentAnswer),
                    question.index
                  )
                );
              }}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-current/20 text-sm font-semibold">
                  {option.tag}
                </span>
                <p className="text-sm leading-7">{option.content}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  function renderBlankQuestion(question: ExamQuestion) {
    const currentAnswer = answers.find((item) => item.index === question.index);
    const blankMap = parseBlankAnswer(currentAnswer?.blankAnswer);

    return (
      <div className="grid gap-3">
        {question.options.map((option) => (
          <label key={option.id} className="grid gap-2 rounded-[24px] border border-border/70 bg-background/85 p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{option.tag}</span>
            <input
              className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              value={blankMap[option.tag] ?? ""}
              placeholder="输入填空答案"
              onChange={(event) => {
                const nextMap = {
                  ...blankMap,
                  [option.tag]: event.target.value,
                };
                const payload = question.options
                  .map((item) => ({
                    tag: item.tag,
                    content: (nextMap[item.tag] ?? "").trim(),
                  }))
                  .filter((item) => item.content.length > 0);

                updateAnswers(
                  upsertAnswer(
                    answers,
                    payload.length > 0
                      ? {
                          index: question.index,
                          questionType: question.type,
                          blankAnswer: JSON.stringify(payload),
                        }
                      : null,
                    question.index
                  )
                );
              }}
            />
          </label>
        ))}
      </div>
    );
  }

  function renderSubjectiveQuestion(question: ExamQuestion) {
    const currentAnswer = answers.find((item) => item.index === question.index);

    return (
      <Textarea
        placeholder="输入主观题答案"
        value={currentAnswer?.subjectiveAnswer ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          updateAnswers(
            upsertAnswer(
              answers,
              value.trim()
                ? {
                    index: question.index,
                    questionType: question.type,
                    subjectiveAnswer: value,
                  }
                : null,
              question.index
            )
          );
        }}
      />
    );
  }

  function renderQuestionEditor(question: ExamQuestion) {
    if (question.type === 1 || question.type === 2 || question.type === 3) {
      return renderChoiceQuestion(question);
    }

    if (question.type === 4) {
      return renderSubjectiveQuestion(question);
    }

    if (question.type === 5) {
      return renderBlankQuestion(question);
    }

    if (question.type === 6) {
      return (
        <div className="grid gap-4">
          {question.subQuestions.map((subQuestion) => (
            <article key={subQuestion.index} className="rounded-[28px] border border-border/70 bg-background/85 p-5">
              <QuestionContent question={subQuestion} />
              <div className="mt-5">{renderQuestionEditor(subQuestion)}</div>
            </article>
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-[24px] border border-dashed border-border px-4 py-5 text-sm leading-7 text-muted-foreground">
        当前题型暂未完成迁移，接口返回了 `questionType = {question.type}`。页面不会伪造成可作答完成态。
      </div>
    );
  }

  if (isLoading) {
    return <ExamSessionLoadingState />;
  }

  if (error) {
    return (
      <MotionReveal data-testid="exam-session-error" className="rounded-[32px] border border-destructive/30 bg-card/90 px-6 py-10 shadow-sm">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">在线考试暂时不可用</h2>
            <p className="text-sm leading-7 text-muted-foreground">{error}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setReloadVersion((value) => value + 1)}>
              重新加载
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push(`/exams/${examId}/preview`)}>
              返回考试预览
            </Button>
          </div>
        </div>
      </MotionReveal>
    );
  }

  if (!session || session.questions.length === 0 || !currentQuestion) {
    return <ExamSessionEmptyState examId={examId} />;
  }

  const currentPosition = session.questions.findIndex((question) => question.index === currentQuestion.index);
  const previousQuestion = currentPosition > 0 ? session.questions[currentPosition - 1] : null;
  const nextQuestion = currentPosition < session.questions.length - 1 ? session.questions[currentPosition + 1] : null;
  const answeredCount = session.questions.filter((question) => isQuestionAnswered(question, answers)).length;
  const unansweredCount = Math.max(0, session.questions.length - answeredCount);

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Exam Session"
          title={session.examTitle}
          description="承接旧学员端在线考试主作答结构，保留考试头部、倒计时、答题卡、题目区、上一题/下一题、缓存恢复和提交流程。"
        >
          <div className="grid gap-6">
            <section
              data-testid="exam-session-hero"
              className="grid gap-5 rounded-[32px] border border-border bg-[linear-gradient(135deg,color-mix(in_oklab,var(--card)_78%,var(--accent)_22%),color-mix(in_oklab,var(--background)_84%,var(--accent)_16%))] p-6 shadow-[0_28px_90px_rgba(15,23,42,0.12)]"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.9fr)]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Active Session
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Exam ID · {session.examId}</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="max-w-4xl text-3xl font-black tracking-[-0.05em] text-foreground sm:text-[2.6rem]">
                      {session.examTitle}
                    </h2>
                    <p className="max-w-3xl text-sm leading-8 text-muted-foreground sm:text-base">{session.examSummary}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-border/70 bg-background/78 px-4 py-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">考生</p>
                      <p className="mt-3 text-lg font-semibold text-foreground">{session.studentName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{session.studentAccount}</p>
                    </div>
                    <div className="rounded-[24px] border border-border/70 bg-background/78 px-4 py-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">剩余时间</p>
                      <p className="mt-3 text-[1.9rem] font-black tracking-[-0.06em] text-foreground">{formatCountdown(remainingMs)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">截止：{session.limitTimeLabel}</p>
                    </div>
                    <div className="rounded-[24px] border border-border/70 bg-background/78 px-4 py-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">答题进度</p>
                      <p className="mt-3 text-[1.9rem] font-black tracking-[-0.06em] text-foreground">{answeredCount}/{session.questions.length}</p>
                      <p className="mt-1 text-sm text-muted-foreground">未答 {unansweredCount} 题</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[28px] border border-border/70 bg-background/72 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">会话信号</p>
                  {session.sessionSignals.map((item) => (
                    <article key={item.label} className="rounded-[24px] border border-border/70 bg-card/90 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{item.value}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                    </article>
                  ))}
                  <div className={`rounded-[24px] border px-4 py-4 text-sm leading-7 ${getCacheTone(cacheState)}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      {cacheState === "error" ? <AlertTriangle className="size-4" /> : cacheState === "dirty" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                      {getCacheLabel(cacheState)}
                    </div>
                    <p className="mt-2">{cacheHint}</p>
                  </div>
                </div>
              </div>

              {session.issues.length > 0 ? (
                <div className="grid gap-3">
                  {session.issues.map((issue) => (
                    <div key={issue} className="rounded-[24px] border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm leading-7 text-amber-700 dark:text-amber-300">
                      {issue}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_18rem] xl:items-start">
              <aside data-testid="exam-answer-card" className="grid gap-4 rounded-[32px] border border-border bg-card/85 p-5 shadow-sm xl:sticky xl:top-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">答题卡</p>
                  <p className="text-sm text-muted-foreground">按题型查看分组并快速跳题。</p>
                </div>
                <div className="grid gap-4">
                  {session.answerCardGroups.map((group) => (
                    <section key={group.label} className="rounded-[24px] border border-border/70 bg-background/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{group.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {group.questionCount} 题 / {group.questionScore} 分
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {group.indexList.map((index) => {
                          const targetQuestion = session.questions.find((question) => question.index === index);
                          const isActive = currentQuestion.index === index;
                          const isAnswered = targetQuestion ? isQuestionAnswered(targetQuestion, answers) : false;

                          return (
                            <button
                              key={index}
                              type="button"
                              className={`inline-flex size-10 items-center justify-center rounded-2xl border text-sm font-semibold transition-colors ${
                                isActive
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : isAnswered
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                              }`}
                              onClick={() => setCurrentQuestionIndex(index)}
                            >
                              {index}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </aside>

              <div data-testid="exam-question-panel" className="grid gap-4 rounded-[32px] border border-border bg-card/90 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-background/80 px-4 py-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">当前题目</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-semibold text-foreground">
                        第 {currentPosition + 1} 题 · {currentQuestion.typeLabel}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                          isQuestionAnswered(currentQuestion, answers)
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {isQuestionAnswered(currentQuestion, answers) ? "已作答" : "待作答"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      剩余 {formatCountdown(remainingMs)}
                    </div>
                    <Button type="button" disabled={isSubmitting} onClick={() => void handleSubmit("manual")}>
                      {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                      提交试卷
                    </Button>
                  </div>
                </div>
                <div className="rounded-[28px] border border-border/70 bg-muted/25 p-5">
                  <QuestionContent question={currentQuestion} />
                </div>
                <div className="rounded-[28px] border border-border/70 bg-background/85 p-5">
                  {renderQuestionEditor(currentQuestion)}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                  <Button type="button" variant="outline" disabled={!previousQuestion} onClick={() => previousQuestion && setCurrentQuestionIndex(previousQuestion.index)}>
                    <ArrowLeft className="size-4" />
                    上一题
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    当前第 {currentPosition + 1} / {session.questions.length} 题
                  </div>
                  <Button type="button" variant="outline" disabled={!nextQuestion} onClick={() => nextQuestion && setCurrentQuestionIndex(nextQuestion.index)}>
                    下一题
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              <aside className="grid gap-4 rounded-[32px] border border-border bg-card/85 p-5 shadow-sm xl:sticky xl:top-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">当前会话</p>
                  <p className="text-sm text-muted-foreground">{session.startSummary}</p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[24px] border border-border/70 bg-background/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">题目规模</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{session.questionCountText} 题 / {session.totalScoreText} 分</p>
                    <p className="mt-1 text-sm text-muted-foreground">用时 {session.totalTimeText} 分钟</p>
                  </div>
                  <div className="rounded-[24px] border border-border/70 bg-background/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">恢复入口</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      这轮迁移已接入缓存读取与写入。你可以重新从接口拉取缓存答案，确认恢复状态是否正确。
                    </p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Button type="button" variant="outline" disabled={isReloadingCache} onClick={handleReloadCache}>
                    {isReloadingCache ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                    重新读取缓存
                  </Button>
                  <Button type="button" disabled={isSubmitting} onClick={() => void handleSubmit("manual")}>
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    提交试卷
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => router.push(`/exams/${session.examId}/preview`)}>
                    返回考试预览
                  </Button>
                </div>
              </aside>
            </section>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
