"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, EmptyState, Skeleton, SurfaceCard } from "@workspace/ui";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { examQueryOptions } from "@/core/exams";

const ExamPreviewLoadingState = () => {
  return (
    <MotionStagger
      className="grid gap-6"
      delayChildren={0.08}
      data-testid="exam-preview-loading"
    >
      <MotionItem>
        <div className="rounded-[28px] border border-border bg-card/90 p-6 shadow-sm">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="mt-4 h-8 w-2/3 rounded-full" />
          <Skeleton className="mt-4 h-16 w-full rounded-3xl" />
        </div>
      </MotionItem>
      <MotionItem>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[24px]" />
          ))}
        </div>
      </MotionItem>
    </MotionStagger>
  );
};

const ExamPreviewEmptyState = () => {
  return (
    <MotionReveal
      data-testid="exam-preview-empty"
      className="rounded-[32px] border border-dashed border-border bg-card/80 px-6 py-14 shadow-sm"
    >
      <EmptyState
        title="未找到考试信息"
        description="当前考试可能已下线，或暂时无法展示预览页所需信息。"
      />
    </MotionReveal>
  );
};

export const ExamPreviewPage = ({ examId }: { examId: string }) => {
  const [actionFeedback, setActionFeedback] = useState<{
    examId: string;
    message: string;
  } | null>(null);
  const previewQuery = useQuery(examQueryOptions.preview(examId));
  const preview = previewQuery.data;
  const isLoading = previewQuery.isLoading;

  const handleStartExam = () => {
    setActionFeedback({
      examId,
      message:
        "在线作答页仍在迁移中，当前版本先承接预览信息与开始入口；请暂时通过旧版作答链路进入考试。",
    });
  };

  if (isLoading) {
    return <ExamPreviewLoadingState />;
  }

  if (!preview) {
    return <ExamPreviewEmptyState />;
  }

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Exam Preview"
          title={preview.title}
          description="承接旧学员端考试预览页，保留考试基础信息、考生须知、开始考试入口，以及接口不可用时的安全不可用状态。"
        >
          <div className="grid gap-6">
            <MotionReveal direction="up">
              <div
                data-testid="exam-preview-hero"
                className="grid gap-4 rounded-[28px] border border-border bg-muted/30 p-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
              >
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {preview.summary}
                  </p>
                  <h2 className="text-3xl font-semibold text-foreground">
                    {preview.title}
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                    {preview.description}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {preview.schedule.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[24px] border border-border bg-background/80 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </MotionReveal>

            <MotionReveal direction="up" delay={0.04}>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {preview.stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-border bg-card/90 p-5 shadow-sm"
                  >
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-3 text-xl font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </section>
            </MotionReveal>

            <MotionReveal direction="up" delay={0.08}>
              <section
                data-testid="exam-preview-instructions"
                className="grid gap-4 rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    考生须知
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    以下说明来自真实考试详情字段与旧预览页结构的只读承接，便于开始作答前快速确认考试要求。
                  </p>
                </div>
                <div className="grid gap-3">
                  {preview.instructions.map((item, index) => (
                    <div
                      key={`${index}-${item}`}
                      className="rounded-[24px] border border-border bg-muted/30 p-4"
                    >
                      <p className="text-sm leading-7 text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            </MotionReveal>

            <MotionReveal direction="up" delay={0.12}>
              <section className="grid gap-4 rounded-[28px] border border-border bg-card/90 p-5 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    开始考试
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {preview.startHint}
                  </p>
                </div>
                {actionFeedback?.examId === examId ? (
                  <div className="rounded-[24px] border border-border bg-muted/30 p-4">
                    <p className="text-sm leading-7 text-foreground">
                      {actionFeedback.message}
                    </p>
                  </div>
                ) : null}
                <div>
                  <Button
                    data-testid="exam-preview-start-action"
                    type="button"
                    disabled={preview.startDisabled}
                    onClick={handleStartExam}
                  >
                    {preview.startLabel}
                  </Button>
                </div>
              </section>
            </MotionReveal>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
};
