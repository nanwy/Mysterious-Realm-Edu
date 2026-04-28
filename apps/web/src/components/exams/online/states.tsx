import { EmptyState, Skeleton } from "@workspace/ui";
import { CheckCircle2 } from "lucide-react";

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

export const OnlineExamSubmittedState = () => (
  <section className="grid gap-4 rounded-[32px] border border-border bg-card/90 p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        <CheckCircle2 className="size-5" />
      </div>
      <div className="grid gap-2">
        <h3 className="text-xl font-semibold text-foreground">试卷已提交</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          当前答题结果已提交，稍后可在成绩中心查看结果。答题草稿已从本地状态清理，后续以服务端记录为准。
        </p>
      </div>
    </div>
  </section>
);
