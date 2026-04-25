"use client";

import { useQuery } from "@tanstack/react-query";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, Skeleton } from "@workspace/ui";
import { AlertCircle, Clock3, RefreshCcw, ShieldAlert } from "lucide-react";
import { practiceQueryOptions } from "@/core/practice";

const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
      {eyebrow}
    </p>
    <div className="space-y-1">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  </div>
);

const LoadingState = () => (
  <div data-state="loading" className="grid gap-6">
    <section className="rounded-[32px] border border-border bg-card/90 p-6 shadow-sm">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-9 w-1/2" />
      <Skeleton className="mt-3 h-20 w-full" />
    </section>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6">
        <section className="rounded-[32px] border border-border bg-card/90 p-6 shadow-sm">
          <Skeleton className="h-4 w-28" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <Skeleton key={index} className="h-40 rounded-[28px]" />
            ))}
          </div>
        </section>
        <section className="rounded-[32px] border border-border bg-card/90 p-6 shadow-sm">
          <Skeleton className="h-4 w-28" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-36 rounded-[28px]" />
            ))}
          </div>
        </section>
      </div>
      <section className="rounded-[32px] border border-border bg-card/90 p-6 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <div className="mt-5 grid gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-[24px]" />
          ))}
        </div>
      </section>
    </div>
  </div>
);

const InfoBanner = ({
  title,
  message,
  state,
}: {
  title: string;
  message: string;
  state: "error" | "empty";
}) => (
  <MotionReveal
    data-state={state}
    className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
  >
    <div className="flex items-start gap-4">
      <div
        className={
          state === "error"
            ? "flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            : "flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
        }
      >
        {state === "error" ? (
          <AlertCircle className="size-5" />
        ) : (
          <ShieldAlert className="size-5" />
        )}
      </div>
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-7 text-muted-foreground">{message}</p>
      </div>
    </div>
  </MotionReveal>
);

export const PracticeModePage = ({ repositoryId }: { repositoryId: string }) => {
  const modeQuery = useQuery(practiceQueryOptions.mode(repositoryId));
  const data = modeQuery.data;

  if (modeQuery.isLoading || !data) {
    return <LoadingState />;
  }

  return (
    <div className="grid gap-6" data-testid="practice-mode-page">
      {data.overviewError ? (
        <InfoBanner
          title="题库详情存在兜底内容"
          message={data.overviewError}
          state="error"
        />
      ) : null}

      {data.isOverviewEmpty ? (
        <InfoBanner
          title="题库详情暂为空"
          message="当前接口没有返回完整题库元信息，页面已退回到安全默认值，并继续展示模式结构。"
          state="empty"
        />
      ) : null}

      <MotionReveal direction="up">
        <section
          data-testid="practice-mode-intro"
          className="rounded-[32px] border border-border bg-card/90 p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <Badge>Practice Mode</Badge>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold text-foreground">
                  {data.overview.title}
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  {data.overview.description}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
              {[
                {
                  label: "自由练习",
                  value: `${data.overview.freePracticeActions.length} 种`,
                },
                {
                  label: "题型练习",
                  value: `${data.overview.questionTypes.reduce(
                    (total, item) => total + item.count,
                    0
                  )} 道`,
                },
                {
                  label: "最近记录",
                  value: `${data.recentRecords.length} 条`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-border/70 bg-background/70 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </MotionReveal>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-6">
          <MotionReveal direction="up" delay={0.04}>
            <section
              data-testid="practice-mode-sections"
              className="rounded-[32px] border border-border bg-card/90 p-6 shadow-sm"
            >
              <SectionHeading
                eyebrow="Mode Entry"
                title="自由练习区"
                description="延续旧学员端的顺序练习和随机练习入口，当前先保留模式说明与目标查询参数，等待在线练习页迁移完成后接续。"
              />
              <MotionStagger
                className="mt-5 grid gap-4 md:grid-cols-2"
                delayChildren={0.06}
              >
                {data.overview.freePracticeActions.map((action) => (
                  <MotionItem key={action.id}>
                    <article className="flex h-full flex-col justify-between gap-5 rounded-[28px] border border-border bg-background/75 p-5">
                      <div className="space-y-3">
                        <p className="text-lg font-semibold text-foreground">
                          {action.title}
                        </p>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-dashed border-border px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          预留查询参数
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {action.query}
                        </p>
                      </div>
                    </article>
                  </MotionItem>
                ))}
              </MotionStagger>
            </section>
          </MotionReveal>

          <MotionReveal direction="up" delay={0.08}>
            <section className="rounded-[32px] border border-border bg-card/90 p-6 shadow-sm">
              <SectionHeading
                eyebrow="Question Types"
                title="题型练习区"
                description="至少覆盖单选题、多选题、判断题、填空题四类，接口缺失时安全降级为 0 道。"
              />
              <MotionStagger
                className="mt-5 grid gap-4 md:grid-cols-2"
                delayChildren={0.06}
              >
                {data.overview.questionTypes.map((item) => (
                  <MotionItem key={item.id}>
                    <article className="flex h-full flex-col justify-between gap-5 rounded-[28px] border border-border bg-background/75 p-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {item.title}
                          </h3>
                          <span className="text-2xl font-semibold text-foreground">
                            {item.count}
                          </span>
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-border/70 bg-card px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          当前题量
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {item.count} 道
                        </p>
                      </div>
                    </article>
                  </MotionItem>
                ))}
              </MotionStagger>
            </section>
          </MotionReveal>
        </div>

        <MotionReveal direction="left" delay={0.12}>
          <aside
            data-testid="practice-mode-recent"
            className="rounded-[32px] border border-border bg-card/90 p-6 shadow-sm"
          >
            <SectionHeading
              eyebrow="Recent"
              title="最近练习区"
              description="展示最近一次练习的名称、正确率与提交时间，接口失败时给出明确说明。"
            />

            {data.recentError ? (
              <div className="mt-5 rounded-[24px] border border-dashed border-border px-4 py-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  {data.recentError}
                </p>
              </div>
            ) : null}

            {data.recentRecords.length ? (
              <MotionStagger className="mt-5 grid gap-3" delayChildren={0.05}>
                {data.recentRecords.map((record, index) => (
                  <MotionItem key={record.id}>
                    <article className="rounded-[24px] border border-border bg-background/75 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-semibold text-foreground">
                            {record.title}
                          </p>
                          <div className="grid gap-1 text-xs text-muted-foreground">
                            <p>正确率：{record.accuracy}</p>
                            <p className="flex items-center gap-2">
                              <Clock3 className="size-3.5" />
                              <span>{record.committedAt}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  </MotionItem>
                ))}
              </MotionStagger>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-border px-4 py-6 text-center">
                <p className="text-sm leading-7 text-muted-foreground">
                  暂无最近练习记录，待用户完成一次练习后会在这里展示最近结果。
                </p>
              </div>
            )}

            <div className="mt-5 rounded-[24px] border border-border/70 bg-background/75 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                刷新数据
              </p>
              <button
                type="button"
                onClick={() => {
                  void modeQuery.refetch();
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <RefreshCcw className="size-4" />
                重新读取练习模式
              </button>
            </div>
          </aside>
        </MotionReveal>
      </div>
    </div>
  );
};

