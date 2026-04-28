import { Badge, Button, EmptyState, SurfaceCard } from "@workspace/ui";
import {
  BookOpenText,
  CircleAlert,
  Clock3,
  ListTodo,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  buildCourseStudyViewModel,
  type CourseStudyHighlightIcon,
  type fetchCourseStudy,
  getCourseStudyProgressTone,
} from "@/core/courses";

type CourseStudyData = Awaited<ReturnType<typeof fetchCourseStudy>>;

const highlightIcons = {
  course: BookOpenText,
  task: PlayCircle,
  next: Sparkles,
} satisfies Record<CourseStudyHighlightIcon, typeof BookOpenText>;

export const CourseStudyPage = ({
  courseId,
  studyResult,
}: {
  courseId: string;
  studyResult: CourseStudyData;
}) => {
  const view = buildCourseStudyViewModel(courseId, studyResult);
  const hasContent = Boolean(
    studyResult.detail || studyResult.process || studyResult.latestTask
  );

  return (
    <div className="grid gap-6" data-testid="course-study-page">
      <section
        data-testid="course-study-hero"
        className="overflow-hidden rounded-[32px] border border-border/80 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--card)_84%,var(--accent)_16%),color-mix(in_oklab,var(--background)_78%,var(--accent)_22%))] p-6 shadow-[0_28px_90px_rgba(15,23,42,0.12)] sm:p-7"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.85fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full">Online Study</Badge>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getCourseStudyProgressTone(
                  view.progress
                )}`}
              >
                {view.statusLabel}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Course ID · {courseId}
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="max-w-4xl text-3xl font-black tracking-[-0.05em] text-foreground sm:text-[2.6rem]">
                {view.courseName}
              </h2>
              <p className="max-w-3xl text-sm leading-8 text-muted-foreground sm:text-base">
                {view.subtitle}
              </p>
            </div>

            <div
              className="grid gap-3 sm:grid-cols-3"
              data-testid="course-study-overview-metrics"
            >
              {view.metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-border/70 bg-background/78 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-3 text-[1.9rem] font-black tracking-[-0.06em] text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border/70 bg-background/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              继续学习建议
            </p>
            <div
              className="mt-4 grid gap-3"
              data-testid="course-study-highlight-list"
            >
              {view.highlights.map(({ title, value, description, icon }) => {
                const Icon = highlightIcons[icon];

                return (
                  <article
                    key={title}
                    className="grid gap-3 rounded-[24px] border border-border/70 bg-card/90 p-4 sm:grid-cols-[2.25rem_minmax(0,1fr)]"
                  >
                    <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {title}
                      </p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {value}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                className="rounded-full px-4"
                render={<Link href={`/courses/${courseId}`}>继续学习</Link>}
              />
              <Button
                variant="outline"
                className="rounded-full px-4"
                render={<Link href={view.examLink}>{view.examLabel}</Link>}
              />
            </div>
          </div>
        </div>
      </section>

      {view.issues.length > 0 || studyResult.error ? (
        <section
          data-testid="course-study-state-banner"
          className="rounded-[28px] border border-border/80 bg-card/92 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <CircleAlert className="size-5" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-base font-semibold text-foreground">
                  学习链路状态已显式暴露
                </p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  {studyResult.error ??
                    "当前未检测到接口错误，但页面仍会保留状态提示区域以承接后续播放器和任务目录接入。"}
                </p>
              </div>
              <div className="grid gap-2">
                {view.issues.map((item) => (
                  <p
                    key={item}
                    className="text-sm leading-7 text-muted-foreground"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <SurfaceCard
          eyebrow="Study Workbench"
          title="继续学习前先看三件事"
          description="学习页不再只是占位说明，而是把继续学习、查看任务和判断是否能进入考试整合成一条主路径。"
        >
          {hasContent ? (
            <div
              className="grid gap-4"
              data-testid="course-study-main-sections"
            >
              <article className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <PlayCircle className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      最近任务
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">
                      {view.lastTaskName}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  当前优先续接最近中断的学习节点，避免回到课程列表后再次寻找入口。任务类型为
                  {view.lastTaskType}
                  ，后续可在这里挂接播放器、目录定位和防挂机校验。
                </p>
              </article>

              <article className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ListTodo className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      任务目录
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">
                      为目录树与任务解锁预留稳定位置
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  旧站的 `OnlineStudy.vue`
                  里最关键的是目录、前置任务和学习计时联动。当前工作台先把结构层级固定下来，后续接入目录数据时不需要再推翻版式。
                </p>
              </article>

              <article className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Clock3 className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      节奏判断
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">
                      把进度、最近时长和考试联动放在同一屏
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  用户不需要在课程列表、考试列表和成绩页之间来回跳转判断当前该做什么，这里已经把最关键的决策信息拉到一个工作台内。
                </p>
              </article>
            </div>
          ) : (
            <EmptyState
              title="课程学习数据暂未返回"
              description="当前没有拿到课程详情、学习进度或最近任务。页面保留了正式工作台结构，等接口恢复后即可承载真实学习内容。"
            />
          )}
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Signals"
          title="学习信号面板"
          description="右侧面板专门承接高频判断信息，保证桌面端能在一眼内完成状态确认，移动端则自动折叠到主内容后方。"
        >
          <div className="grid gap-3" data-testid="course-study-signal-list">
            {view.signals.map((item) => (
              <article
                key={item.label}
                className="rounded-[24px] border border-border/70 bg-background/80 p-4"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};
