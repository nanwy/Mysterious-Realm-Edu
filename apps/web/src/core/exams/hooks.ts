"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  useCacheExamAnswerMutation,
  useSubmitExamMutation,
} from "./mutations";
import {
  buildBlankAnswerDraft,
  buildOptionAnswerDraft,
  buildSubjectiveAnswerDraft,
  getAnswerForQuestion,
  isQuestionAnswered,
  replaceOnlineAnswer,
} from "./online";
import { useExamStore } from "./store";
import type { ExamOnlineSession } from "./types";

export const useOnlineExamController = (session: ExamOnlineSession) => {
  const { mutate: cacheMutate, isPending: cachePending } =
    useCacheExamAnswerMutation();
  const { mutate: submitMutate, isPending: submitPending } =
    useSubmitExamMutation();

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
        examId: session.examId,
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
    session.examId,
    session.submitted,
    session.userExamId,
    setOnlineSubmitStatus,
    submitMutate,
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
