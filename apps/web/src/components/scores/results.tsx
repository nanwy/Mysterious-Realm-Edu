"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Button, EmptyState } from "@workspace/ui";
import { ArrowUpRight, CircleAlert, Clock, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ScoreRecord } from "@/core/scores";

const renderStatusNode = (passed: boolean | null) => {
  if (passed === true) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
          考试通过 // SUCCESS
        </span>
      </div>
    );
  }

  if (passed === false) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-destructive">
          考试未通过 // FAILED
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 opacity-30">
      <div className="h-2 w-2 rounded-full bg-muted-foreground" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        查询中 // RELOADING
      </span>
    </div>
  );
};

const ScoresLoadingState = () => (
  <div className="flex flex-col gap-px bg-border/20">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="h-32 animate-pulse bg-background" />
    ))}
  </div>
);

export const ScoresResults = ({
  records,
  loading,
  error,
  onRetry,
}: {
  records: ScoreRecord[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) => {
  const router = useRouter();

  if (loading) {
    return <ScoresLoadingState />;
  }

  if (error) {
    return (
      <MotionReveal className="flex flex-col items-center gap-6 border border-destructive/20 bg-destructive/5 p-16 text-center lg:p-32">
        <CircleAlert className="h-12 w-12 text-destructive opacity-30" />
        <EmptyState
          title="成绩数据链路异常"
          description={`当前无法加载成绩记录：${error}`}
        />
        <Button
          type="button"
          variant="destructive"
          className="h-12 rounded-none px-10 text-[10px] font-black uppercase tracking-widest"
          onClick={onRetry}
        >
          重新初始化连接
        </Button>
      </MotionReveal>
    );
  }

  if (!records.length) {
    return (
      <MotionReveal className="border border-dashed border-border bg-card/75 px-6 py-16">
        <EmptyState
          title="暂无匹配成绩"
          description="当前筛选条件下没有成绩记录，可以切换关键词或通过状态后重新查询。"
        />
      </MotionReveal>
    );
  }

  return (
    <div className="relative z-10 flex flex-col border-y border-border/40 bg-background">
      <MotionStagger className="divide-y divide-border/10" delayChildren={0.03}>
        {records.map((record) => {
          const scorePercent = Math.min(100, record.maxScore ?? 0);
          const isHighScore = (record.maxScore ?? 0) >= 90;

          return (
            <MotionItem key={record.id}>
              <button
                type="button"
                onClick={() => {
                  if (record.examId) {
                    router.push(`/scores/${record.examId}`);
                  }
                }}
                disabled={!record.examId}
                className="group relative flex w-full cursor-pointer flex-col justify-between gap-12 p-8 text-left transition-all duration-300 hover:bg-muted/[0.02] disabled:cursor-not-allowed disabled:opacity-60 lg:p-14 xl:flex-row xl:items-center"
              >
                <div
                  className={`absolute bottom-1/4 left-0 top-1/4 w-0.5 transition-all group-hover:bottom-0 group-hover:top-0 ${
                    record.passed
                      ? "bg-primary"
                      : record.passed === false
                        ? "bg-destructive"
                        : "bg-muted-foreground/20"
                  }`}
                />

                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-6">
                    <span className="bg-muted/20 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                      编号_{record.id.slice(-4).toUpperCase()}
                    </span>
                    {renderStatusNode(record.passed)}
                  </div>

                  <h3 className="pr-12 text-2xl font-bold leading-tight tracking-tighter transition-colors group-hover:text-primary lg:text-4xl">
                    {record.examTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-10 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      最近考期: {record.recentExamTime || "无记录"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5" />
                      考试次数: {record.tryCount ?? 0}
                    </div>
                  </div>
                </div>

                <div className="flex min-w-[320px] items-center justify-between gap-12 border-t border-border/10 pt-8 xl:justify-end xl:gap-20 xl:border-t-0 xl:pt-0">
                  <div className="hidden max-w-[200px] flex-1 flex-col items-end gap-3 sm:flex">
                    <div className="flex w-full items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.3em] opacity-30">
                      <span>得分占比</span>
                      <span>{record.maxScore ?? 0}%</span>
                    </div>
                    <div className="relative h-1 w-full bg-muted/10">
                      <div
                        className={`absolute inset-y-0 left-0 z-10 transition-all duration-1000 ease-out ${
                          record.passed ? "bg-primary" : "bg-destructive/40"
                        }`}
                        style={{ width: `${scorePercent}%` }}
                      />
                      <div className="absolute inset-0 flex justify-between px-px opacity-20">
                        {[0, 1, 2, 3, 4].map((item) => (
                          <div key={item} className="h-full w-px bg-foreground" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[120px] items-baseline gap-2 text-right">
                    <span
                      className={`font-mono text-6xl font-black leading-none tracking-tighter lg:text-8xl ${
                        record.passed === false
                          ? "text-destructive"
                          : isHighScore
                            ? "text-primary"
                            : "text-foreground"
                      }`}
                    >
                      {record.maxScore ?? "--"}
                    </span>
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-mono text-[12px] font-black leading-none opacity-20">
                        分
                      </span>
                      {isHighScore ? (
                        <div className="rounded-sm bg-primary px-1.5 py-0.5 text-[8px] font-bold text-white">
                          优秀
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="hidden h-16 w-16 items-center justify-center border border-border/10 transition-all group-hover:bg-foreground group-hover:text-background lg:flex">
                    <ArrowUpRight className="h-6 w-6 transition-transform group-hover:rotate-45" />
                  </div>
                </div>
              </button>
            </MotionItem>
          );
        })}
      </MotionStagger>
    </div>
  );
};

