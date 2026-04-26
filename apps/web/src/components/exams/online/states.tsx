import { EmptyState, Skeleton } from "@workspace/ui";

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
