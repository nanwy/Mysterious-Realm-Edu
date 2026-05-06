"use client";

import { useQuery } from "@tanstack/react-query";
import { OnlineAnswerCard } from "./answer-card";
import { OnlineInvigilateSnap } from "./invigilate-snap";
import { OnlineQuestionPanel } from "./question-panel";
import {
  OnlineExamEmptyState,
  OnlineExamLoadingState,
  OnlineExamSubmittedState,
} from "./states";
import { OnlineStatusPanel } from "./status-panel";
import { OnlineExamSummary } from "./summary";
import { OnlineExamWatermark, useOnlineInvigilateProfile } from "./watermark";
import { examQueryOptions, useOnlineExamController } from "@/core/exams";
import type { ExamOnlineSession } from "@/core/exams";

const OnlineExamWorkspace = ({ session }: { session: ExamOnlineSession }) => {
  const onlineExam = useOnlineExamController(session);
  const invigilateProfileQuery = useOnlineInvigilateProfile(session);

  if (!onlineExam.currentQuestion) {
    return <OnlineExamEmptyState />;
  }

  return (
    <OnlineExamWatermark
      session={session}
      profile={invigilateProfileQuery.data}
      profileError={invigilateProfileQuery.isError}
    >
      <div className="grid gap-5">
        <OnlineExamSummary
          session={session}
          questionTotal={onlineExam.questions.length}
          remainingSeconds={onlineExam.remainingSeconds}
        />

        {onlineExam.submitStatus === "submitted" ? (
          <OnlineExamSubmittedState session={session} />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_17rem] xl:items-start">
            <OnlineAnswerCard onlineExam={onlineExam} />
            <OnlineQuestionPanel onlineExam={onlineExam} />
            <div className="grid gap-5">
              <OnlineStatusPanel onlineExam={onlineExam} />
              <OnlineInvigilateSnap
                session={session}
                profile={invigilateProfileQuery.data}
                onForceSubmit={onlineExam.submitExam}
              />
            </div>
          </div>
        )}
      </div>
    </OnlineExamWatermark>
  );
};

export const OnlineExamPage = ({
  examId,
  userExamId,
}: {
  examId: string;
  userExamId?: string;
}) => {
  const sessionQuery = useQuery(examQueryOptions.online(examId, userExamId));
  const session = sessionQuery.data;

  if (sessionQuery.isLoading) {
    return <OnlineExamLoadingState />;
  }

  if (!session) {
    return <OnlineExamEmptyState />;
  }

  return <OnlineExamWorkspace session={session} />;
};
