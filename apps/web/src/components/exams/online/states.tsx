// TODO src/views/exam/ExamDetail.vue
import { EmptyState, Skeleton } from "@workspace/ui";
import { EXAM_PAPER_STATE } from "@workspace/api";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { ExamOnlineSession } from "@/core/exams";

export const OnlineExamLoadingState = () => (
  <div className="grid gap-5">
    <Skeleton className="h-36 rounded-[28px]" />
    <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_17rem]">
      <Skeleton className="h-96 rounded-[28px]" />
      <Skeleton className="h-[32rem] rounded-[28px]" />
      <Skeleton className="h-80 rounded-[28px]" />
    </div>
  </div>
);

export const OnlineExamEmptyState = () => (
  <div className="rounded-[32px] border border-dashed border-border bg-card/80 px-6 py-14">
    <EmptyState
      title="在线考试暂不可进入"
      description="当前路由缺少可用考试 ID，或考试详情没有返回可展示的题目信息。"
    />
  </div>
);

export const OnlineExamSubmittedState = ({
  session,
}: {
  session: ExamOnlineSession;
}) => (
  <section className="grid gap-4 rounded-[32px] border border-border bg-card/90 p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        <CheckCircle2 className="size-5" />
      </div>
      <div className="grid gap-2">
        <h3 className="text-xl font-semibold text-foreground">试卷已提交</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          当前答题结果已提交，答题草稿已从本地状态清理，后续以服务端记录为准。
        </p>
        <div className="mt-2 grid gap-3 rounded-[24px] border border-border bg-background/70 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">本次得分</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {session.userScore ?? "--"} 分
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">试卷总分</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {session.totalScore || "--"} 分
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">及格分数</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {session.qualifyScore ?? "--"} 分
            </p>
          </div>
        </div>
        {session.paperState === EXAM_PAPER_STATE.WAIT_REVIEW ? (
          <p className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            该试卷还有主观题，主观题分数将在阅卷后累计到总成绩。
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/exams"
            className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            返回考试页
          </Link>
          {session.resultDetailVisible ? (
            <Link
              href={`/scores/${session.examId}`}
              className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              查看成绩明细
            </Link>
          ) : (
            <Link
              href="/scores"
              className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              查看成绩中心
            </Link>
          )}
        </div>
      </div>
    </div>
  </section>
);
