"use client";

import { useQuery } from "@tanstack/react-query";
import { OnlineAnswerCard } from "./answer-card";
import { OnlineQuestionPanel } from "./question-panel";
import { OnlineExamEmptyState, OnlineExamLoadingState } from "./states";
import { OnlineStatusPanel } from "./status-panel";
import { OnlineExamSummary } from "./summary";
import {
  examQueryOptions,
  useOnlineExamController,
} from "@/core/exams";
import type { ExamOnlineSession } from "@/core/exams";

const OnlineExamWorkspace = ({ session }: { session: ExamOnlineSession }) => {
  const onlineExam = useOnlineExamController(session);

  if (!onlineExam.currentQuestion) {
    return <OnlineExamEmptyState />;
  }

  return (
    <div className="grid gap-5">
      <OnlineExamSummary
        session={session}
        questionTotal={onlineExam.questions.length}
      />

      <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_17rem] xl:items-start">
        <OnlineAnswerCard onlineExam={onlineExam} />

        <OnlineQuestionPanel
          question={onlineExam.currentQuestion}
          answer={onlineExam.answerForCurrent}
          navigation={{
            currentIndex: onlineExam.currentIndex,
            questionTotal: onlineExam.questions.length,
            onPrevious: onlineExam.previousQuestion,
            onNext: onlineExam.nextQuestion,
          }}
          answerActions={{
            onToggleOption: onlineExam.toggleOption,
            onUpdateSubjectiveAnswer: onlineExam.updateSubjectiveAnswer,
            onUpdateBlankAnswer: onlineExam.updateBlankAnswer,
          }}
          submitAction={{
            pending: onlineExam.submitPending,
            onSubmit: onlineExam.submitExam,
          }}
        />

        <OnlineStatusPanel onlineExam={onlineExam} />
      </div>
    </div>
  );
};

export const OnlineExamPage = ({ examId }: { examId: string }) => {
  const sessionQuery = useQuery(examQueryOptions.online(examId));
  const session = sessionQuery.data;

  if (sessionQuery.isLoading) {
    return <OnlineExamLoadingState />;
  }

  if (!session) {
    return <OnlineExamEmptyState />;
  }

  return <OnlineExamWorkspace key={session.userExamId} session={session} />;
};
