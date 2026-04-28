import { Alert, AlertDescription, AlertTitle } from "@workspace/ui";
import { CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import type {
  ExamOnlineCacheStatus,
  ExamOnlineSubmitStatus,
  OnlineExamController,
} from "@/core/exams";

const cacheStatusLabel: Record<ExamOnlineCacheStatus, string> = {
  idle: "等待作答",
  saving: "同步中",
  saved: "已就绪",
  error: "重试中",
};

const deriveActionMessage = ({
  cacheStatus,
  submitStatus,
  unansweredCount,
}: {
  cacheStatus: ExamOnlineCacheStatus;
  submitStatus: ExamOnlineSubmitStatus;
  unansweredCount: number;
}): string | null => {
  if (submitStatus === "submitted") {
    return "试卷已提交，稍后可在成绩中心查看结果。";
  }
  if (submitStatus === "error") {
    return "提交暂未成功，答案仍保留在当前页面并会继续尝试缓存。";
  }
  if (submitStatus === "submitting") {
    return unansweredCount
      ? `还有 ${unansweredCount} 题未作答，正在按当前答案提交。`
      : "正在提交当前答题结果。";
  }
  if (cacheStatus === "error") {
    return "答案缓存失败，将自动重试。";
  }
  if (cacheStatus === "saving") {
    return "答案同步中，请勿关闭页面。";
  }
  if (cacheStatus === "saved") {
    return "答案已自动保存。";
  }
  return null;
};

export const OnlineStatusPanel = ({
  onlineExam,
}: {
  onlineExam: OnlineExamController;
}) => {
  const {
    answeredCount,
    cacheStatus,
    currentQuestion,
    questions,
    submitStatus,
    unansweredCount,
  } = onlineExam;

  const actionMessage = useMemo(
    () => deriveActionMessage({ cacheStatus, submitStatus, unansweredCount }),
    [cacheStatus, submitStatus, unansweredCount]
  );

  return (
    <aside className="grid gap-4 rounded-[30px] border border-border bg-card/85 p-4 shadow-sm xl:sticky xl:top-24">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">考试状态</p>
        <p className="text-sm leading-6 text-muted-foreground">
          系统会持续提示保存状态。离开页面前请确认答题进度，并优先使用提交按钮完成本次考试。
        </p>
      </div>
      <div className="grid gap-3">
        {[
          ["缓存状态", cacheStatusLabel[cacheStatus]],
          ["答题进度", `${answeredCount}/${questions.length}`],
          ["当前题型", currentQuestion?.typeName ?? "未选择"],
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
  );
};
