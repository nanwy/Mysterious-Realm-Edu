import { Alert, AlertDescription, AlertTitle, Badge } from "@workspace/ui";
import { AlertCircle, Clock3 } from "lucide-react";
import { type ExamOnlineSession, formatExamSeconds } from "@/core/exams";

export const OnlineExamSummary = ({
  session,
  questionTotal,
  remainingSeconds,
}: {
  session: ExamOnlineSession;
  questionTotal: number;
  remainingSeconds: number | null;
}) => {
  const detail = session.detail;

  return (
    <section className="overflow-hidden rounded-[32px] border border-border bg-card/90 shadow-sm">
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>作答中</Badge>
          <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Exam #{session.examId}
          </span>
        </div>
        <div className="grid gap-3">
          <h2 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground">
            {detail?.examTitle ?? "在线考试"}
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            {session.statusMessage}
          </p>
        </div>
        {session.warning ? (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertTitle>考试信息未完全同步</AlertTitle>
            <AlertDescription>{session.warning}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <aside className="grid gap-4 border-t border-border bg-muted/30 p-5 sm:p-6 lg:border-t-0 lg:border-l">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              剩余时间
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
              {formatExamSeconds(remainingSeconds)}
            </p>
          </div>
          <Clock3 className="size-8 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["题目", `${detail?.questionCount || questionTotal}`],
            ["总分", `${detail?.totalScore || "--"}`],
            ["时长", detail?.totalTime ? `${detail.totalTime}m` : "--"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[22px] border border-border/80 bg-background/70 p-3"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
    </section>
  );
};
