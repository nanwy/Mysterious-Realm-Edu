"use client";

import { INVIGILATE_CHEAT_TYPE } from "@workspace/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useCacheExamAnswerMutation,
  useCountScreenSwitchMutation,
  useReportScreenSwitchMutation,
  useSubmitExamMutation,
} from "./mutations";
import {
  buildBlankAnswerDraft,
  buildOptionAnswerDraft,
  buildSubjectiveAnswerDraft,
  type ExamOnlineSession,
  getAnswerForQuestion,
  getRemainingScreenSwitchTimes,
  isQuestionAnswered,
  replaceOnlineAnswer,
  shouldRecordScreenSwitch,
} from "./online";
import { useExamStore } from "./store";

export const useOnlineExamController = (session: ExamOnlineSession) => {
  const { mutate: cacheMutate, isPending: cachePending } =
    useCacheExamAnswerMutation();
  const { mutate: submitMutate, isPending: submitPending } =
    useSubmitExamMutation(session.examId);
  const { mutate: reportScreenSwitchMutate } = useReportScreenSwitchMutation();
  const { mutate: countScreenSwitchMutate } = useCountScreenSwitchMutation();
  const [screenSwitchTimes, setScreenSwitchTimes] = useState(0);
  const [screenSwitchMessage, setScreenSwitchMessage] = useState<string | null>(
    null
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    session.remainSeconds
  );
  const isScreenAwayRef = useRef(false);
  const screenLeftAtRef = useRef<number | null>(null);

  const currentIndex = useExamStore((state) => state.onlineCurrentIndex);
  const answers = useExamStore((state) => state.onlineAnswers);
  const cacheStatus = useExamStore((state) => state.onlineCacheStatus);
  const submitStatus = useExamStore((state) => state.onlineSubmitStatus);
  const hydrateOnline = useExamStore((state) => state.hydrateOnline);
  const selectOnlineQuestionAt = useExamStore(
    (state) => state.selectOnlineQuestionAt
  );
  const shiftOnlineQuestion = useExamStore(
    (state) => state.shiftOnlineQuestion
  );
  const updateOnlineAnswers = useExamStore(
    (state) => state.updateOnlineAnswers
  );
  const resetOnline = useExamStore((state) => state.resetOnline);
  const beginOnlineCacheRequest = useExamStore(
    (state) => state.beginOnlineCacheRequest
  );
  const finishOnlineCacheRequest = useExamStore(
    (state) => state.finishOnlineCacheRequest
  );
  const setOnlineSubmitStatus = useExamStore(
    (state) => state.setOnlineSubmitStatus
  );

  // Slice lifecycle is event-driven, not mount-driven:
  // - `hydrateOnline` guards on `userExamId`, so refetches for the same session
  //   are no-ops (preserves in-progress draft) and switching sessions resets
  //   with backend recovery data.
  // - A submitted backend session is terminal and must win over any fresh
  //   Zustand default state after reload.
  // - Submit success switches the page to the same terminal state, so the draft
  //   can be reset without showing an emptied answer card.
  useEffect(() => {
    if (session.submitted) {
      resetOnline();
      setOnlineSubmitStatus("submitted");
      return;
    }

    hydrateOnline(session.userExamId, session.cachedAnswers);
  }, [
    hydrateOnline,
    resetOnline,
    session.cachedAnswers,
    session.submitted,
    session.userExamId,
    setOnlineSubmitStatus,
  ]);

  const questions = session.questions;
  const totalQuestions = questions.length;
  const lastQuestionIndex = Math.max(0, totalQuestions - 1);

  const currentQuestion = useMemo(
    () => questions[currentIndex] ?? questions[0],
    [questions, currentIndex]
  );
  const answerForCurrent = useMemo(
    () =>
      currentQuestion
        ? getAnswerForQuestion(currentQuestion, answers)
        : undefined,
    [currentQuestion, answers]
  );
  const answeredCount = useMemo(
    () =>
      questions.filter((question) => isQuestionAnswered(question, answers))
        .length,
    [questions, answers]
  );
  const progress = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const leaveOn = session.detail?.leaveOn ?? false;
  const leaveTime = session.detail?.leaveTime ?? null;
  const totalLeaveTimes = session.detail?.totalLeaveTimes ?? null;

  const persistAnswers = useCallback(() => {
    if (session.submitted) {
      return;
    }

    const requestId = beginOnlineCacheRequest();
    cacheMutate(
      {
        limitTime: session.limitTime,
        userExamId: session.userExamId,
        examAnswers: useExamStore.getState().onlineAnswers,
      },
      {
        onSuccess: () => finishOnlineCacheRequest(requestId, "saved"),
        onError: () => finishOnlineCacheRequest(requestId, "error"),
      }
    );
  }, [
    beginOnlineCacheRequest,
    cacheMutate,
    finishOnlineCacheRequest,
    session.limitTime,
    session.submitted,
    session.userExamId,
  ]);

  const selectQuestion = useCallback(
    (questionIndex: number) => {
      const target = questions.findIndex(
        (question) => question.index === questionIndex
      );
      selectOnlineQuestionAt(Math.max(0, target));
    },
    [questions, selectOnlineQuestionAt]
  );

  const previousQuestion = useCallback(() => {
    shiftOnlineQuestion(-1, lastQuestionIndex);
  }, [shiftOnlineQuestion, lastQuestionIndex]);

  const nextQuestion = useCallback(() => {
    shiftOnlineQuestion(1, lastQuestionIndex);
  }, [shiftOnlineQuestion, lastQuestionIndex]);

  const toggleOption = useCallback(
    (optionId: string, optionIndex: number) => {
      if (!currentQuestion) {
        return;
      }
      updateOnlineAnswers((current) => {
        const draft = getAnswerForQuestion(currentQuestion, current);
        const next = buildOptionAnswerDraft(
          currentQuestion,
          draft,
          optionId,
          optionIndex
        );
        return replaceOnlineAnswer(current, currentQuestion.index, next);
      });
      persistAnswers();
    },
    [currentQuestion, persistAnswers, updateOnlineAnswers]
  );

  const updateSubjectiveAnswer = useCallback(
    (value: string) => {
      if (!currentQuestion) {
        return;
      }
      updateOnlineAnswers((current) =>
        replaceOnlineAnswer(
          current,
          currentQuestion.index,
          buildSubjectiveAnswerDraft(currentQuestion, value)
        )
      );
      persistAnswers();
    },
    [currentQuestion, persistAnswers, updateOnlineAnswers]
  );

  const updateBlankAnswer = useCallback(
    (tag: string, value: string) => {
      if (!currentQuestion) {
        return;
      }
      updateOnlineAnswers((current) => {
        const draft = getAnswerForQuestion(currentQuestion, current);
        const next = buildBlankAnswerDraft(currentQuestion, draft, tag, value);
        return replaceOnlineAnswer(current, currentQuestion.index, next);
      });
      persistAnswers();
    },
    [currentQuestion, persistAnswers, updateOnlineAnswers]
  );

  const submitExam = useCallback(() => {
    if (session.submitted) {
      return;
    }

    setOnlineSubmitStatus("submitting");
    submitMutate(
      {
        userExamId: session.userExamId,
        examAnswers: useExamStore.getState().onlineAnswers,
      },
      {
        onSuccess: () => {
          resetOnline();
          setOnlineSubmitStatus("submitted");
        },
        onError: () => setOnlineSubmitStatus("error"),
      }
    );
  }, [
    resetOnline,
    session.submitted,
    session.userExamId,
    setOnlineSubmitStatus,
    submitMutate,
  ]);

  useEffect(() => {
    setRemainingSeconds(session.remainSeconds);
  }, [session.remainSeconds, session.userExamId]);

  useEffect(() => {
    if (session.submitted || remainingSeconds === null) {
      return;
    }

    if (remainingSeconds <= 0) {
      submitExam();
      return;
    }

    const timer = window.setTimeout(() => {
      setRemainingSeconds((current) =>
        current === null ? null : Math.max(0, current - 1)
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [remainingSeconds, session.submitted, submitExam]);

  useEffect(() => {
    if (session.submitted) {
      return;
    }

    const handleBeforeUnload = () => {
      persistAnswers();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [persistAnswers, session.submitted]);

  useEffect(() => {
    setScreenSwitchTimes(0);
    setScreenSwitchMessage(null);
    isScreenAwayRef.current = false;
    screenLeftAtRef.current = null;

    if (!leaveOn || session.submitted) {
      return;
    }

    countScreenSwitchMutate(
      {
        userExamId: session.userExamId,
        cheatType: INVIGILATE_CHEAT_TYPE.SCREEN_SWITCH,
      },
      {
        onSuccess: (result) => {
          setScreenSwitchTimes(result?.cheatNum ?? 0);
        },
      }
    );
  }, [countScreenSwitchMutate, leaveOn, session.submitted, session.userExamId]);

  useEffect(() => {
    if (!leaveOn || session.submitted) {
      return;
    }

    const markAway = () => {
      if (isScreenAwayRef.current) {
        return;
      }
      isScreenAwayRef.current = true;
      screenLeftAtRef.current = Date.now();
    };

    const markReturned = () => {
      if (
        !shouldRecordScreenSwitch({
          leaveOn,
          leaveTime,
          leftAt: screenLeftAtRef.current,
          returnedAt: Date.now(),
        })
      ) {
        isScreenAwayRef.current = false;
        screenLeftAtRef.current = null;
        return;
      }

      isScreenAwayRef.current = false;
      screenLeftAtRef.current = null;
      reportScreenSwitchMutate({
        examId: session.examId,
        userExamId: session.userExamId,
        cheatType: INVIGILATE_CHEAT_TYPE.SCREEN_SWITCH,
      });

      setScreenSwitchTimes((current) => {
        const next = current + 1;
        const remaining = getRemainingScreenSwitchTimes(totalLeaveTimes, next);

        if (remaining !== null && remaining < 0) {
          setScreenSwitchMessage("已达到最大切屏次数，系统正在自动提交试卷。");
          window.setTimeout(() => {
            submitExam();
          }, 3000);
        } else {
          setScreenSwitchMessage(
            remaining === null
              ? `检测到第 ${next} 次切屏，请保持考试页面在前台。`
              : `检测到第 ${next} 次切屏，还可切换 ${remaining} 次，超过 ${totalLeaveTimes} 次将自动交卷。`
          );
        }

        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markAway();
        return;
      }
      markReturned();
    };

    const handleResize = () => {
      const screenWidth = window.screen.width;
      const windowWidth = window.innerWidth;
      if (screenWidth - windowWidth > 100) {
        markAway();
        return;
      }
      markReturned();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    reportScreenSwitchMutate,
    session.examId,
    leaveOn,
    leaveTime,
    session.submitted,
    totalLeaveTimes,
    session.userExamId,
    submitExam,
  ]);
  const resolvedSubmitStatus = session.submitted ? "submitted" : submitStatus;

  return {
    questions,
    answerGroups: session.answerGroups,
    currentQuestion,
    currentIndex,
    answerForCurrent,
    answers,
    answeredCount,
    unansweredCount,
    progress,
    cacheStatus,
    submitStatus: resolvedSubmitStatus,
    cachePending,
    submitPending,
    remainingSeconds,
    screenSwitchTimes,
    screenSwitchMessage,
    selectQuestion,
    previousQuestion,
    nextQuestion,
    toggleOption,
    updateSubjectiveAnswer,
    updateBlankAnswer,
    submitExam,
  };
};

export type OnlineExamController = ReturnType<typeof useOnlineExamController>;
