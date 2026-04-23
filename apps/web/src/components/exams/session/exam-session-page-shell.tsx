"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  EmptyState,
  Progress,
  Skeleton,
  SurfaceCard,
  Textarea,
} from "@workspace/ui";
import { cn } from "@workspace/ui/lib/utils";
import {
  buildPersistedAnswers,
  getExamSessionErrorMessage,
  getQuestionCountLabel,
  initializeExamSession,
  persistExamCache,
  submitExamSession,
  type ExamAnswerDraft,
  type ExamQuestion,
  type ExamQuestionLeaf,
  type ExamSessionPayload,
} from "./exam-session-data";

function CountdownText({ remainingMs }: { remainingMs: number | null }) {
  if (remainingMs === null) {
    return <span>不限时</span>;
  }

  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <span>
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </span>
  );
}

function ExamSessionLoadingState() {
  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08} data-testid="exam-session-loading">
      <MotionItem>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <Skeleton className="h-[320px] rounded-[32px]" />
          <Skeleton className="h-[320px] rounded-[32px]" />
        </div>
      </MotionItem>
      <MotionItem>
        <Skeleton className="h-[420px] rounded-[32px]" />
      </MotionItem>
    </MotionStagger>
  );
}

function ExamSessionEmptyState() {
  return (
    <MotionReveal data-testid="exam-session-empty" className="rounded-[32px] border border-dashed border-border bg-card/80 px-6 py-14 shadow-sm">
      <EmptyState
        title="当前考试没有可作答题目"
        description="接口已返回考试记录，但未携带 userExamQuestionList，无法继续承接旧站作答链路。"
      />
    </MotionReveal>
  );
}

function renderQuestionTypeLabel(questionType: number) {
  if (questionType === 1) {
    return "单选";
  }

  if (questionType === 2) {
    return "多选";
  }

  if (questionType === 3) {
    return "判断";
  }

  if (questionType === 4) {
    return "简答";
  }

  if (questionType === 5) {
    return "填空";
  }

  return "组合";
}

function renderQuestionBody(body: string) {
  return <div className="text-base leading-8 text-foreground" dangerouslySetInnerHTML={{ __html: body }} />;
}

function countAnsweredQuestions(session: ExamSessionPayload, answerMap: Record<string, ExamAnswerDraft>) {
  let answeredCount = 0;

  session.questions.forEach((question) => {
    const leafQuestions = question.questionType === 6 ? question.subQuestions : [question];
    const isAnswered = leafQuestions.some((leafQuestion) => {
      const draft = answerMap[leafQuestion.index];
      if (!draft) {
        return false;
      }

      if (leafQuestion.questionType === 4) {
        return draft.subjectiveAnswer.trim().length > 0;
      }

      if (leafQuestion.questionType === 5) {
        return draft.blankValues.some((value) => value.trim().length > 0);
      }

      return draft.answers.length > 0;
    });

    if (isAnswered) {
      answeredCount += 1;
    }
  });

  return answeredCount;
}

function getQuestionAnswered(question: ExamQuestion, answerMap: Record<string, ExamAnswerDraft>) {
  const leafQuestions = question.questionType === 6 ? question.subQuestions : [question];
  return leafQuestions.some((leafQuestion) => {
    const draft = answerMap[leafQuestion.index];
    if (!draft) {
      return false;
    }

    if (leafQuestion.questionType === 4) {
      return draft.subjectiveAnswer.trim().length > 0;
    }

    if (leafQuestion.questionType === 5) {
      return draft.blankValues.some((value) => value.trim().length > 0);
    }

    return draft.answers.length > 0;
  });
}

function getPersistedAnswerCount(session: ExamSessionPayload, answerMap: Record<string, ExamAnswerDraft>) {
  return buildPersistedAnswers(session.questions, answerMap).length;
}

function QuestionChoiceList({
  question,
  draft,
  onSelectSingle,
  onToggleMulti,
}: {
  question: ExamQuestionLeaf;
  draft: ExamAnswerDraft;
  onSelectSingle: (question: ExamQuestionLeaf, optionId: string, optionIndex: number) => void;
  onToggleMulti: (question: ExamQuestionLeaf, optionId: string, optionIndex: number) => void;
}) {
  return (
    <div className="grid gap-3">
      {question.options.map((option) => {
        const isChecked = draft.answers.includes(option.id);
        const isMultiple = question.questionType === 2;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              if (isMultiple) {
                onToggleMulti(question, option.id, option.index);
                return;
              }

              onSelectSingle(question, option.id, option.index);
            }}
            className={cn(
              "group grid gap-3 rounded-[26px] border px-4 py-4 text-left transition-colors",
              isChecked
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-muted/20 text-foreground hover:border-foreground/40"
            )}
          >
            <div className="flex items-start gap-3">
              {isMultiple ? (
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-[6px] border",
                    isChecked ? "border-background bg-background/20 text-background" : "border-border text-transparent"
                  )}
                >
                  ✓
                </span>
              ) : (
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-5 shrink-0 rounded-full border",
                    isChecked ? "border-background bg-background/20" : "border-border"
                  )}
                />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">{option.label}</p>
                <div
                  className={cn(
                    "text-sm leading-7",
                    isChecked ? "text-background/85" : "text-muted-foreground"
                  )}
                  dangerouslySetInnerHTML={{ __html: option.content }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LeafQuestionBlock({
  question,
  draft,
  onSelectSingle,
  onToggleMulti,
  onSubjectiveChange,
  onBlankChange,
}: {
  question: ExamQuestionLeaf;
  draft: ExamAnswerDraft;
  onSelectSingle: (question: ExamQuestionLeaf, optionId: string, optionIndex: number) => void;
  onToggleMulti: (question: ExamQuestionLeaf, optionId: string, optionIndex: number) => void;
  onSubjectiveChange: (question: ExamQuestionLeaf, value: string) => void;
  onBlankChange: (question: ExamQuestionLeaf, blankIndex: number, value: string) => void;
}) {
  return (
    <div className="grid gap-5 rounded-[28px] border border-border bg-card/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{question.displayIndex}</Badge>
        <span className="text-sm text-muted-foreground">{question.questionTypeName}</span>
        <span className="text-sm text-muted-foreground">{question.questionScoreText}</span>
      </div>
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{renderQuestionTypeLabel(question.questionType)}</p>
        {renderQuestionBody(question.body)}
      </div>
      {question.questionType === 4 ? (
        <Textarea
          value={draft.subjectiveAnswer}
          onChange={(event) => onSubjectiveChange(question, event.target.value)}
          placeholder="输入本题答案，系统会在作答过程中自动缓存。"
          rows={8}
        />
      ) : null}
      {question.questionType === 5 ? (
        <div className="grid gap-3">
          {Array.from({ length: question.blankCount }).map((_, index) => (
            <label
              key={`${question.index}-blank-${index}`}
              className="grid gap-2 rounded-[24px] border border-border bg-muted/20 px-4 py-4"
            >
              <span className="text-sm text-muted-foreground">填空 {index + 1}</span>
              <input
                value={draft.blankValues[index] ?? ""}
                onChange={(event) => onBlankChange(question, index, event.target.value)}
                placeholder="输入该空的答案"
                className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
          ))}
        </div>
      ) : null}
      {question.questionType === 1 || question.questionType === 2 || question.questionType === 3 ? (
        <QuestionChoiceList
          question={question}
          draft={draft}
          onSelectSingle={onSelectSingle}
          onToggleMulti={onToggleMulti}
        />
      ) : null}
    </div>
  );
}

function QuestionPanel({
  question,
  answerMap,
  onSelectSingle,
  onToggleMulti,
  onSubjectiveChange,
  onBlankChange,
}: {
  question: ExamQuestion;
  answerMap: Record<string, ExamAnswerDraft>;
  onSelectSingle: (question: ExamQuestionLeaf, optionId: string, optionIndex: number) => void;
  onToggleMulti: (question: ExamQuestionLeaf, optionId: string, optionIndex: number) => void;
  onSubjectiveChange: (question: ExamQuestionLeaf, value: string) => void;
  onBlankChange: (question: ExamQuestionLeaf, blankIndex: number, value: string) => void;
}) {
  if (question.questionType === 6) {
    return (
      <div className="grid gap-5">
        <div className="rounded-[32px] border border-border bg-card/95 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{question.displayIndex}</Badge>
            <span className="text-sm text-muted-foreground">{question.questionTypeName}</span>
            <span className="text-sm text-muted-foreground">{question.questionScoreText}</span>
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">组合题</p>
            {renderQuestionBody(question.body)}
          </div>
        </div>
        {question.subQuestions.map((subQuestion) => (
          <LeafQuestionBlock
            key={subQuestion.index}
            question={subQuestion}
            draft={answerMap[subQuestion.index]}
            onSelectSingle={onSelectSingle}
            onToggleMulti={onToggleMulti}
            onSubjectiveChange={onSubjectiveChange}
            onBlankChange={onBlankChange}
          />
        ))}
      </div>
    );
  }

  return (
    <LeafQuestionBlock
      question={question}
      draft={answerMap[question.index]}
      onSelectSingle={onSelectSingle}
      onToggleMulti={onToggleMulti}
      onSubjectiveChange={onSubjectiveChange}
      onBlankChange={onBlankChange}
    />
  );
}

export function ExamSessionPageShell({ examId }: { examId: string }) {
  const [session, setSession] = useState<ExamSessionPayload | null>(null);
  const [answerMap, setAnswerMap] = useState<Record<string, ExamAnswerDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [cacheState, setCacheState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    setCacheState("idle");
    setCacheMessage(null);
    setSubmitState("idle");
    setSubmitMessage(null);

    void initializeExamSession(examId)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setSession(payload);
        setAnswerMap(payload.answerMap);
        setCurrentQuestionIndex(0);
        setRemainingMs(payload.remainingMs);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setSession(null);
        setAnswerMap({});
        setError(getExamSessionErrorMessage(requestError));
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
  }, [examId, reloadVersion]);

  useEffect(() => {
    if (remainingMs === null || remainingMs <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingMs((value) => {
        if (value === null) {
          return value;
        }

        return Math.max(0, value - 1000);
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [remainingMs]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCacheState("saving");
      setCacheMessage("正在同步当前作答缓存...");

      void persistExamCache({
        userExamId: session.userExamId,
        limitTime: session.limitTimeIso,
        questions: session.questions,
        answerMap,
      })
        .then(() => {
          setCacheState("saved");
          setCacheMessage("答案已缓存，可刷新页面后继续作答。");
        })
        .catch((requestError) => {
          setCacheState("error");
          setCacheMessage(getExamSessionErrorMessage(requestError));
        });
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [answerMap, session]);

  const answeredCount = useMemo(() => {
    if (!session) {
      return 0;
    }

    return countAnsweredQuestions(session, answerMap);
  }, [answerMap, session]);

  const currentQuestion = session?.questions[currentQuestionIndex] ?? null;
  const totalQuestions = session?.questions.length ?? 0;
  const progressValue = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const unansweredCount = Math.max(totalQuestions - answeredCount, 0);
  const persistedAnswerCount = session ? getPersistedAnswerCount(session, answerMap) : 0;

  function updateDraft(index: string, updater: (draft: ExamAnswerDraft) => ExamAnswerDraft) {
    setAnswerMap((current) => {
      const existing = current[index] ?? {
        answers: [],
        answerIndex: [],
        subjectiveAnswer: "",
        blankValues: [],
      };

      return {
        ...current,
        [index]: updater(existing),
      };
    });
    setCacheState("idle");
    setCacheMessage(null);
  }

  function handleSelectSingle(question: ExamQuestionLeaf, optionId: string, optionIndex: number) {
    updateDraft(question.index, (draft) => ({
      ...draft,
      answers: [optionId],
      answerIndex: [optionIndex],
    }));
  }

  function handleToggleMultiple(question: ExamQuestionLeaf, optionId: string, optionIndex: number) {
    updateDraft(question.index, (draft) => {
      const hasAnswer = draft.answers.includes(optionId);
      const answers = hasAnswer ? draft.answers.filter((value) => value !== optionId) : [...draft.answers, optionId];
      const answerIndex = hasAnswer
        ? draft.answerIndex.filter((value) => value !== optionIndex)
        : [...draft.answerIndex, optionIndex].sort((left, right) => left - right);

      return {
        ...draft,
        answers,
        answerIndex,
      };
    });
  }

  function handleSubjectiveChange(question: ExamQuestionLeaf, value: string) {
    updateDraft(question.index, (draft) => ({
      ...draft,
      subjectiveAnswer: value,
    }));
  }

  function handleBlankChange(question: ExamQuestionLeaf, blankIndex: number, value: string) {
    updateDraft(question.index, (draft) => {
      const blankValues = Array.from({ length: Math.max(question.blankCount, draft.blankValues.length || 0, blankIndex + 1) }, (_, index) =>
        index === blankIndex ? value : draft.blankValues[index] ?? ""
      );

      return {
        ...draft,
        blankValues,
      };
    });
  }

  function handleSubmit() {
    if (!session) {
      return;
    }

    setSubmitState("submitting");
    setSubmitMessage("正在提交试卷，请不要关闭页面。");

    void submitExamSession({
      userExamId: session.userExamId,
      questions: session.questions,
      answerMap,
    })
      .then(() => {
        setSubmitState("submitted");
        setSubmitMessage("试卷已提交。当前站内成绩结果页仍按 examId 聚合展示，你可以进入成绩明细继续查看。");
      })
      .catch((requestError) => {
        setSubmitState("error");
        setSubmitMessage(getExamSessionErrorMessage(requestError));
      });
  }

  useEffect(() => {
    if (!session || remainingMs === null || remainingMs > 0) {
      return;
    }

    if (submitState !== "idle") {
      return;
    }

    setSubmitState("submitting");
    setSubmitMessage("倒计时已结束，系统正在自动提交试卷。");

    void submitExamSession({
      userExamId: session.userExamId,
      questions: session.questions,
      answerMap,
    })
      .then(() => {
        setSubmitState("submitted");
        setSubmitMessage("倒计时结束后已自动交卷。你可以进入成绩明细继续查看。");
      })
      .catch((requestError) => {
        setSubmitState("error");
        setSubmitMessage(getExamSessionErrorMessage(requestError));
      });
  }, [answerMap, remainingMs, session, submitState]);

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
            <Button asChild type="button">
              <Link href={`/exams/${examId}/preview`}>返回考试预览</Link>
            </Button>
          </div>
        </div>
      </MotionReveal>
    );
  }

  if (!session || session.questions.length === 0 || !currentQuestion) {
    return <ExamSessionEmptyState />;
  }

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Exam Session"
          title={session.title}
          description="沿用旧站主阅读顺序，承接开始考试后的在线作答主链路，并把状态、缓存、提交结果直接留在当前页面。"
        >
          <div className="grid gap-6">
            <MotionReveal direction="up">
              <div
                data-testid="exam-session-hero"
                className="grid gap-5 rounded-[30px] border border-border bg-muted/25 p-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary">{session.summary}</Badge>
                    <span className="text-sm text-muted-foreground">{session.statusText}</span>
                    <span className="text-sm text-muted-foreground">{session.durationText}</span>
                    <span className="text-sm text-muted-foreground">{getQuestionCountLabel(session.questions)}</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-semibold text-foreground">{session.title}</h2>
                    <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{session.description}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {session.schedule.map((item) => (
                      <div key={item.label} className="rounded-[24px] border border-border bg-background/85 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 rounded-[30px] border border-border bg-card/95 p-5 shadow-sm">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">考生与倒计时</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-2xl font-semibold text-foreground">{session.candidateName}</span>
                      <Badge>{session.candidateHint}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{session.progressHint}</p>
                  </div>
                  <div className="rounded-[24px] border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">剩余时间</p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">
                      <CountdownText remainingMs={remainingMs} />
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>大题进度</span>
                      <span>
                        {answeredCount}/{totalQuestions}
                      </span>
                    </div>
                    <Progress value={progressValue} />
                  </div>
                </div>
              </div>
            </MotionReveal>

            <MotionReveal direction="up" delay={0.04}>
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_340px]">
                <div className="grid gap-4">
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">作答提示</p>
                      <div className="mt-4 grid gap-3">
                        {session.instructions.map((item, index) => (
                          <div key={`${index}-${item}`} className="rounded-[22px] border border-border bg-muted/20 p-4">
                            <p className="text-sm leading-7 text-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <div className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">缓存状态</p>
                        <p className="mt-4 text-2xl font-semibold text-foreground">
                          {cacheState === "saving"
                            ? "同步中"
                            : cacheState === "saved"
                              ? "已缓存"
                              : cacheState === "error"
                                ? "缓存失败"
                                : "待同步"}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {cacheMessage ?? `当前已整理 ${persistedAnswerCount} 条可提交答案记录。`}
                        </p>
                      </div>
                      {session.warnings.length > 0 ? (
                        <Alert>
                          <AlertTitle>旧站考试约束</AlertTitle>
                          <AlertDescription>
                            {session.warnings.map((item) => (
                              <p key={item} className="leading-7">
                                {item}
                              </p>
                            ))}
                          </AlertDescription>
                        </Alert>
                      ) : null}
                      {session.unsupportedNotes.length > 0 ? (
                        <Alert>
                          <AlertTitle>尚未迁移的能力</AlertTitle>
                          <AlertDescription>
                            {session.unsupportedNotes.map((item) => (
                              <p key={item} className="leading-7">
                                {item}
                              </p>
                            ))}
                          </AlertDescription>
                        </Alert>
                      ) : null}
                    </div>
                  </div>

                  <QuestionPanel
                    question={currentQuestion}
                    answerMap={answerMap}
                    onSelectSingle={handleSelectSingle}
                    onToggleMulti={handleToggleMultiple}
                    onSubjectiveChange={handleSubjectiveChange}
                    onBlankChange={handleBlankChange}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-border bg-card/90 p-5 shadow-sm">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        当前位于第 {currentQuestionIndex + 1} / {totalQuestions} 题
                      </p>
                      <p className="text-sm text-muted-foreground">
                        已完成 {answeredCount} 道大题，当前提交会带上全部已缓存答案。
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex((value) => Math.max(0, value - 1))}
                      >
                        上一题
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={currentQuestionIndex === totalQuestions - 1}
                        onClick={() => setCurrentQuestionIndex((value) => Math.min(totalQuestions - 1, value + 1))}
                      >
                        下一题
                      </Button>
                      <Button type="button" onClick={handleSubmit} disabled={submitState === "submitting"}>
                        {submitState === "submitting" ? "提交中..." : "提交试卷"}
                      </Button>
                    </div>
                  </div>

                  {submitMessage ? (
                    <Alert variant={submitState === "error" ? "destructive" : "default"}>
                      <AlertTitle>
                        {submitState === "submitted" ? "提交完成" : submitState === "error" ? "提交失败" : "正在提交"}
                      </AlertTitle>
                      <AlertDescription>
                        <p className="leading-7">{submitMessage}</p>
                        {submitState === "submitted" ? (
                          <p className="leading-7">
                            <Link href={`/scores/${session.examId}`} className="underline underline-offset-4">
                              进入成绩明细页
                            </Link>
                          </p>
                        ) : null}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>

                <div className="grid gap-4 xl:sticky xl:top-24 xl:self-start">
                  <div className="rounded-[30px] border border-border bg-card/95 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">答题卡</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">按题号快速跳转</p>
                      </div>
                      <Badge variant="secondary">{progressValue}%</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                      <div className="rounded-[22px] border border-border bg-muted/20 p-4">
                        <p className="text-sm text-muted-foreground">未答大题</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{unansweredCount}</p>
                      </div>
                      <div className="rounded-[22px] border border-border bg-muted/20 p-4">
                        <p className="text-sm text-muted-foreground">当前题号</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{currentQuestion.displayIndex}</p>
                      </div>
                      <div className="rounded-[22px] border border-border bg-muted/20 p-4">
                        <p className="text-sm text-muted-foreground">缓存记录</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{persistedAnswerCount}</p>
                      </div>
                    </div>
                    <div
                      data-testid="exam-session-question-grid"
                      className="mt-5 grid grid-cols-5 gap-3 sm:grid-cols-6 xl:grid-cols-5"
                    >
                      {session.questions.map((question, index) => {
                        const isActive = currentQuestionIndex === index;
                        const isAnswered = getQuestionAnswered(question, answerMap);

                        return (
                          <button
                            key={question.index}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={cn(
                              "rounded-[20px] border px-3 py-3 text-sm font-medium transition-colors",
                              isActive
                                ? "border-foreground bg-foreground text-background"
                                : isAnswered
                                  ? "border-border bg-card text-foreground"
                                  : "border-dashed border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {question.displayIndex}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-[30px] border border-border bg-card/95 p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">链路状态</p>
                    <div className="mt-4 grid gap-4">
                      <div className="rounded-[22px] border border-border bg-muted/20 p-4">
                        <p className="text-sm text-muted-foreground">examId</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{session.examId}</p>
                      </div>
                      <div className="rounded-[22px] border border-border bg-muted/20 p-4">
                        <p className="text-sm text-muted-foreground">userExamId</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{session.userExamId}</p>
                      </div>
                      <div className="rounded-[22px] border border-border bg-muted/20 p-4">
                        <p className="text-sm text-muted-foreground">缓存来源</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {session.hasCachedAnswers ? "已恢复缓存答案" : "首次进入考试"}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-border bg-muted/20 p-4">
                        <p className="text-sm text-muted-foreground">提交出口</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Button type="button" onClick={handleSubmit} disabled={submitState === "submitting"}>
                            {submitState === "submitting" ? "提交中..." : "立即交卷"}
                          </Button>
                          <Button asChild type="button" variant="outline">
                            <Link href={`/exams/${examId}/preview`}>返回预览页</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
}
