"use client";

import { useEffect, useRef } from "react";
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
import type { ExamOnlineAnswerDraft, ExamOnlineSession } from "./types";

export const useOnlineExamController = (session: ExamOnlineSession) => {
  const initialCachedAnswersRef = useRef(session.cachedAnswers);
  const cacheMutation = useCacheExamAnswerMutation();
  const submitMutation = useSubmitExamMutation();
  const currentIndex = useExamStore((state) => state.onlineCurrentIndex);
  const answers = useExamStore((state) => state.onlineAnswers);
  const actionMessage = useExamStore((state) => state.onlineActionMessage);
  const hydrateOnlineSession = useExamStore(
    (state) => state.hydrateOnlineSession
  );
  const resetOnlineSession = useExamStore((state) => state.resetOnlineSession);
  const setCurrentIndex = useExamStore((state) => state.setOnlineCurrentIndex);
  const setAnswers = useExamStore((state) => state.setOnlineAnswers);
  const setActionMessage = useExamStore(
    (state) => state.setOnlineActionMessage
  );

  useEffect(() => {
    hydrateOnlineSession(session.userExamId, initialCachedAnswersRef.current);
    return () => resetOnlineSession();
  }, [
    hydrateOnlineSession,
    resetOnlineSession,
    session.userExamId,
  ]);

  const questions = session.questions;
  const currentQuestion = questions[currentIndex] ?? questions[0];
  const answerForCurrent = currentQuestion
    ? getAnswerForQuestion(currentQuestion, answers)
    : undefined;
  const answeredCount = questions.filter((question) =>
    isQuestionAnswered(question, answers)
  ).length;
  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const persistAnswers = (nextAnswers: ExamOnlineAnswerDraft[]) => {
    setAnswers(nextAnswers);
    cacheMutation.mutate({
      limitTime: session.limitTime,
      userExamId: session.userExamId,
      examAnswers: nextAnswers,
    });
    setActionMessage("答案已自动保存");
  };

  const replaceCurrentAnswer = (
    nextAnswer: ExamOnlineAnswerDraft | null
  ) => {
    if (!currentQuestion) {
      return;
    }

    persistAnswers(
      replaceOnlineAnswer(answers, currentQuestion.index, nextAnswer)
    );
  };

  const selectQuestion = (index: number) => {
    const nextIndex = questions.findIndex(
      (question) => question.index === index
    );
    setCurrentIndex(Math.max(0, nextIndex));
  };

  const previousQuestion = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const nextQuestion = () => {
    setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1));
  };

  const toggleOption = (optionId: string, optionIndex: number) => {
    if (!currentQuestion) {
      return;
    }

    replaceCurrentAnswer(
      buildOptionAnswerDraft(
        currentQuestion,
        answerForCurrent,
        optionId,
        optionIndex
      )
    );
  };

  const updateSubjectiveAnswer = (value: string) => {
    if (!currentQuestion) {
      return;
    }

    replaceCurrentAnswer(buildSubjectiveAnswerDraft(currentQuestion, value));
  };

  const updateBlankAnswer = (tag: string, value: string) => {
    if (!currentQuestion) {
      return;
    }

    replaceCurrentAnswer(
      buildBlankAnswerDraft(currentQuestion, answerForCurrent, tag, value)
    );
  };

  const submitExam = () => {
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

  return {
    questions,
    answerGroups: session.answerGroups,
    currentQuestion,
    currentIndex,
    answerForCurrent,
    answers,
    answeredCount,
    progress,
    actionMessage,
    cachePending: cacheMutation.isPending,
    submitPending: submitMutation.isPending,
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
