import { Badge, EmptyState, StatusCard, SurfaceCard } from "@workspace/ui";
import { BookOpenCheck, CircleAlert, Clock3, Layers3, PlayCircle, Sparkles } from "lucide-react";
import type { CourseStudyResult } from "@/lib/course-study";
import { buildCourseStudyViewModel } from "./course-study-presenter";

function DetailList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h3 className="font-heading text-[1.45rem] font-black tracking-[-0.04em] text-foreground">
          {title}
        </h3>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 border-t border-border/70 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 break-words text-base font-semibold leading-7 text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseStudyPageShell({
  courseId,
  study,
}: {
  courseId: string;
  study: CourseStudyResult;
}) {
  const viewModel = buildCourseStudyViewModel(courseId, study);
  const hasAnyPayload = Boolean(study.detail || study.process || study.latestTask);

  return (
    <div className="grid gap-6">
      <section
        data-testid="course-study-hero"
        className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(237,242,255,0.92))] shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(11,18,32,0.96))]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,255,0.12),transparent_22%),linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:auto,24px_24px,24px_24px]" />
        <div className="relative grid gap-8 p-6 lg:grid-cols-[minmax(0,1.3fr)_21rem] lg:p-8">
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/10">
                Online Study
              </Badge>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                课程主链路 / 学习任务恢复
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="max-w-4xl font-heading text-[clamp(2.3rem,4.8vw,4.4rem)] font-black leading-[0.94] tracking-[-0.07em] text-foreground">
                    {viewModel.title}
                  </h2>
                </div>
                <div className="inline-flex items-center rounded-full border border-border/70 bg-background/85 px-3 py-2 text-sm font-semibold text-foreground">
                  {viewModel.statusLabel}
                </div>
              </div>

              <p className="max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                课程学习页不再只停留在占位说明，而是直接把最近任务、进度判断、结课条件和接口异常说明收敛到同一个学习工作台里。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3" data-testid="course-study-progress">
              <StatusCard title="累计进度" value={viewModel.progressValue} hint={viewModel.progressHint} />
              <StatusCard title="完成章节" value={viewModel.completedLessonsValue} hint={viewModel.completedLessonsHint} />
              <StatusCard title="学习时长" value={viewModel.accumulatedTimeValue} hint={viewModel.accumulatedTimeHint} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#172554_100%)] p-5 text-white shadow-[0_22px_60px_rgba(15,23,42,0.24)]">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-200/90">
                <PlayCircle className="size-4" />
                Next Action
              </div>
              <h3 className="mt-3 text-[1.6rem] font-black tracking-[-0.05em] text-white">
                {viewModel.nextActionLabel}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{viewModel.nextActionHint}</p>

              <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">最近任务</span>
                  <span className="max-w-[11rem] truncate font-semibold">{viewModel.latestTaskTitle}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">课程分类</span>
                  <span className="font-semibold">{viewModel.categoryLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">授课教师</span>
                  <span className="max-w-[11rem] truncate font-semibold">{viewModel.teacherName}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-border/80 bg-card/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="size-4" />
                Recent Task
              </div>
              <p className="mt-3 text-xl font-black tracking-[-0.04em] text-foreground">
                {viewModel.latestTaskTitle}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{viewModel.latestTaskHint}</p>
              <div className="mt-4 grid gap-2">
                {viewModel.latestTaskMeta.map((item) => (
                  <div key={item} className="truncate border-t border-border/60 pt-2 text-sm text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {viewModel.errorTitle && viewModel.errorMessage ? (
        <section
          data-testid="course-study-error"
          className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/8 px-5 py-5 text-amber-950 dark:text-amber-100"
        >
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" />
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                {viewModel.errorTitle}
              </p>
              <p className="mt-2 break-words text-sm leading-7">{viewModel.errorMessage}</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <SurfaceCard
          eyebrow="Study Detail"
          title="学习信息总览"
          description="把课程本体信息和学习过程拆成两个层次，避免旧页里目录、状态和说明混在一起。"
        >
          <div className="grid gap-8">
            <DetailList
              title="课程信息"
              description="用于判断这门课是什么、学完要满足什么条件，以及它在整个学习路径中的位置。"
              items={viewModel.detailItems}
            />
            <DetailList
              title="过程信号"
              description="把最近进入、任务状态和下一步动作单独列出，帮助用户判断现在是否该继续学。"
              items={viewModel.processItems}
            />
          </div>
        </SurfaceCard>

        <div className="grid gap-6" data-testid="course-study-snapshot">
          <SurfaceCard
            eyebrow="Learning Rhythm"
            title="本页解决的关键问题"
            description="先把真正影响学习决策的信号顶到前面，而不是把所有说明堆成一块。"
          >
            <div className="grid gap-4">
              <div className="flex gap-3 border-t border-border/70 pt-4">
                <BookOpenCheck className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">恢复最近任务</p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    让用户一进页就知道该继续哪一节，而不是再从目录里二次定位。
                  </p>
                </div>
              </div>
              <div className="flex gap-3 border-t border-border/70 pt-4">
                <Layers3 className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">拆分课程本体与过程信号</p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    课程资料负责回答“这是什么”，过程信号负责回答“现在该做什么”。
                  </p>
                </div>
              </div>
              <div className="flex gap-3 border-t border-border/70 pt-4">
                <Clock3 className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">对异常保持显式说明</p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    环境未联通、登录态失效或部分请求失败时，不再返回空白骨架页。
                  </p>
                </div>
              </div>
            </div>
          </SurfaceCard>

          {!hasAnyPayload && !viewModel.errorTitle ? (
            <EmptyState
              title="课程数据暂未返回"
              description="当前没有读到课程详情、学习进度或最近任务。页面结构已就绪，待接口补齐后可继续接入播放器、目录树和防挂机逻辑。"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
