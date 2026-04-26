import { Alert, AlertDescription, AlertTitle } from "@workspace/ui";
import { CheckCircle2 } from "lucide-react";
import type { OnlineExamController } from "@/core/exams";

export const OnlineStatusPanel = ({
  onlineExam,
}: {
  onlineExam: OnlineExamController;
}) => {
  const {
    actionMessage,
    answeredCount,
    cachePending,
    currentQuestion,
    questions,
  } = onlineExam;

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
          ["缓存状态", cachePending ? "同步中" : "已就绪"],
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
