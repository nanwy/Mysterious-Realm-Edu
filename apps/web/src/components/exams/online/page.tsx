"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { OnlineAnswerCard } from "./answer-card";
import { OnlineQuestionPanel } from "./question-panel";
import { OnlineStatusPanel } from "./status-panel";
import { OnlineExamEmptyState, OnlineExamLoadingState } from "./states";
import { OnlineExamSummary } from "./summary";
import {
  examQueryOptions,
  getAnswerForQuestion,
  isQuestionAnswered,
  makeAnswerKey,
  parseBlankAnswer,
  type ExamOnlineAnswerDraft,
  useCacheExamAnswerMutation,
  useSubmitExamMutation,
} from "@/core/exams";

export const OnlineExamPage = ({ examId }: { examId: string }) => {
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

  const selectQuestion = (index: number) => {
    const nextIndex = questions.findIndex(
      (question) => question.index === index
    );
    setCurrentIndex(Math.max(0, nextIndex));
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

  if (sessionQuery.isLoading) {
    return <OnlineExamLoadingState />;
  }

  if (!session || !currentQuestion) {
    return <OnlineExamEmptyState />;
  }

  const answerForCurrent = getAnswerForQuestion(currentQuestion, answers);

  return (
    <div className="grid gap-5">
      <OnlineExamSummary session={session} questionTotal={questions.length} />

      <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_17rem] xl:items-start">
        <OnlineAnswerCard
          groups={session.answerGroups}
          questions={questions}
          answers={answers}
          currentQuestion={currentQuestion}
          answeredCount={answeredCount}
          progress={progress}
          onSelectQuestion={selectQuestion}
        />

        <OnlineQuestionPanel
          currentQuestion={currentQuestion}
          answerForCurrent={answerForCurrent}
          currentIndex={currentIndex}
          questionTotal={questions.length}
          submitPending={submitMutation.isPending}
          onToggleOption={toggleOption}
          onUpdateSubjectiveAnswer={updateSubjectiveAnswer}
          onUpdateBlankAnswer={updateBlankAnswer}
          onPrevious={() => setCurrentIndex((value) => Math.max(0, value - 1))}
          onNext={() =>
            setCurrentIndex((value) =>
              Math.min(questions.length - 1, value + 1)
            )
          }
          onSubmit={submitExam}
        />

        <OnlineStatusPanel
          cachePending={cacheMutation.isPending}
          answeredCount={answeredCount}
          questionTotal={questions.length}
          currentTypeName={currentQuestion.typeName}
          actionMessage={actionMessage}
        />
      </div>
    </div>
  );
};
