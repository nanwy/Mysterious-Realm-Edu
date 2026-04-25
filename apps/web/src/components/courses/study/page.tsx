import { Badge, Button, EmptyState, SurfaceCard } from "@workspace/ui";
import { BookOpenText, CircleAlert, Clock3, ListTodo, PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import type { CourseStudyResult } from "@/core/courses";
import { toNumberOrNull, toRecordOrEmpty, toText } from "@/lib/normalize";

const formatPercent = (value: number | null) => {
  if (value === null) {
    return "待同步";
  }

  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
};

const getProgressTone = (value: number | null) => {
  if (value === null) {
    return "border-border/70 bg-background/70 text-muted-foreground";
  }

  if (value >= 80) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (value >= 40) {
    return "border-primary/20 bg-primary/10 text-primary";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
};

const formatDuration = (value: string) => {
  if (!value) {
    return "待同步";
  }

  if (/分钟|小时|天/.test(value)) {
    return value;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return value;
  }

  if (numeric >= 60) {
    const hours = Math.floor(numeric / 60);
    const minutes = numeric % 60;
    return minutes > 0 ? `${hours} 小时 ${minutes} 分钟` : `${hours} 小时`;
  }

  return `${numeric} 分钟`;
};

const buildStudyViewModel = (
  courseId: string,
  result: CourseStudyResult
) => {
  const detail = toRecordOrEmpty(result.detail);
  const process = toRecordOrEmpty(result.process);
  const latestTask = toRecordOrEmpty(result.latestTask);

  const courseName =
    toText(detail.courseName) || toText(detail.title) || toText(detail.goodsName) || `课程 ${courseId}`;
  const subtitle =
    toText(detail.courseIntro) ||
    toText(detail.description) ||
    "当前页已将课程详情、学习进度和最近任务汇总到单一工作台，方便继续学习前快速判断节奏与阻塞点。";
  const statusLabel =
    toText(process.studyStatusName) || toText(detail.studyStatusName) || toText(detail.statusName) || "待开始";
  const progress = toNumberOrNull(
    process.studyProcess ?? process.progress ?? process.studyPercent ?? detail.studyProcess
  );
  const completedTasks = toText(
    process.finishTaskNum ?? process.finishNum ?? process.learnedTaskNum ?? process.completeNum
  );
  const totalTasks = toText(
    process.taskNum ?? process.totalTaskNum ?? detail.taskNum ?? detail.chapterTotal ?? detail.sectionCount
  );
  const lastTaskName =
    toText(latestTask.taskName) || toText(latestTask.catalogName) || toText(latestTask.chapterName) || "暂无最近任务";
  const lastTaskType =
    toText(latestTask.taskTypeName) || toText(latestTask.taskType) || toText(latestTask.catalogTypeName) || "任务";
  const lastTaskDuration = formatDuration(
    toText(latestTask.studyTime) || toText(latestTask.taskStudyTime) || toText(latestTask.duration)
  );
  const lastTaskUpdate =
    toText(latestTask.updateTime) || toText(latestTask.studyTimeText) || toText(latestTask.createTime) || "等待接口回传";
  const teacherName =
    toText(detail.teacherName) || toText(detail.lecturerName) || toText(detail.teacher) || "待补充讲师";
  const difficulty =
    toText(detail.levelName) || toText(detail.difficultyName) || toText(detail.courseLevelName) || "默认难度";
  const examLink = toText(detail.examId) ? `/scores/${toText(detail.examId)}` : "/exams";
  const examLabel =
    toText(detail.examTitle) || toText(detail.examName) || (toText(detail.examId) ? "进入关联考试" : "查看考试列表");

  const metrics = [
    {
      label: "学习进度",
      value: formatPercent(progress),
      note: progress === null ? "接口未返回百分比" : `当前课程状态：${statusLabel}`,
    },
    {
      label: "任务完成",
      value: completedTasks && totalTasks ? `${completedTasks}/${totalTasks}` : totalTasks || completedTasks || "待同步",
      note: "优先判断距离解锁考试还差多少学习任务。",
    },
    {
      label: "最近学习时长",
      value: lastTaskDuration,
      note: "用于判断是否需要立即继续同一章节。",
    },
  ];

  const highlights = [
    {
      title: "课程信息",
      value: teacherName,
      description: `讲师 / 负责人 · ${difficulty}`,
      Icon: BookOpenText,
    },
    {
      title: "最近任务",
      value: lastTaskName,
      description: `${lastTaskType} · ${lastTaskUpdate}`,
      Icon: PlayCircle,
    },
    {
      title: "下一步动作",
      value: progress !== null && progress >= 100 ? "准备进入测评" : "继续当前学习任务",
      description: progress !== null && progress >= 100 ? "课程已接近完成，可进入考试或成绩页确认结果。" : "优先续学最近一次中断的章节，减少重复进入成本。",
      Icon: Sparkles,
    },
  ];

  const signals = [
    {
      label: "状态判断",
      value: statusLabel,
      detail: "先确认当前是待开始、学习中还是已完成，再决定是否跳去考试。",
    },
    {
      label: "最近更新时间",
      value: lastTaskUpdate,
      detail: "如果时间过久，说明学习链路可能已经中断，需要重新进入任务。",
    },
    {
      label: "考试联动",
      value: examLabel,
      detail: "课程完成后通常要衔接测评或成绩回看，这里保留直达入口。",
    },
  ];

  const issues = [
    result.errorType === "config_missing"
      ? "当前环境没有配置 NEXT_PUBLIC_API_BASE_URL，页面已保留结构和状态位，但不会伪造学习数据。"
      : null,
    result.errorType === "unauthorized"
      ? "接口返回了登录态异常，说明课程学习链路已接上真实接口，但当前账号凭证不可用。"
      : null,
    result.errorType === "request_failed"
      ? "部分接口请求失败，页面会保留已成功的模块并显式暴露异常，不把失败伪装成空内容。"
      : null,
  ].filter((value): value is string => Boolean(value));

  return {
    courseName,
    subtitle,
    statusLabel,
    progress,
    lastTaskName,
    lastTaskType,
    metrics,
    highlights,
    signals,
    examLink,
    examLabel,
    issues,
  };
};

export const CourseStudyPage = ({
  courseId,
  studyResult,
}: {
  courseId: string;
  studyResult: CourseStudyResult;
}) => {
  const view = buildStudyViewModel(courseId, studyResult);
  const hasContent = Boolean(studyResult.detail || studyResult.process || studyResult.latestTask);

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
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getProgressTone(
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
              <p className="max-w-3xl text-sm leading-8 text-muted-foreground sm:text-base">{view.subtitle}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3" data-testid="course-study-overview-metrics">
              {view.metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-border/70 bg-background/78 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-3 text-[1.9rem] font-black tracking-[-0.06em] text-foreground">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border/70 bg-background/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">继续学习建议</p>
            <div className="mt-4 grid gap-3" data-testid="course-study-highlight-list">
              {view.highlights.map(({ title, value, description, Icon }) => (
                <article
                  key={title}
                  className="grid gap-3 rounded-[24px] border border-border/70 bg-card/90 p-4 sm:grid-cols-[2.25rem_minmax(0,1fr)]"
                >
                  <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                className="rounded-full px-4"
                render={
                  <Link href={`/courses/${courseId}`}>
                    继续学习
                  </Link>
                }
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
                <p className="text-base font-semibold text-foreground">学习链路状态已显式暴露</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  {studyResult.error ?? "当前未检测到接口错误，但页面仍会保留状态提示区域以承接后续播放器和任务目录接入。"}
                </p>
              </div>
              <div className="grid gap-2">
                {view.issues.map((item) => (
                  <p key={item} className="text-sm leading-7 text-muted-foreground">
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
            <div className="grid gap-4" data-testid="course-study-main-sections">
              <article className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <PlayCircle className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">最近任务</p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">{view.lastTaskName}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  当前优先续接最近中断的学习节点，避免回到课程列表后再次寻找入口。任务类型为
                  {view.lastTaskType}，后续可在这里挂接播放器、目录定位和防挂机校验。
                </p>
              </article>

              <article className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ListTodo className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">任务目录</p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">为目录树与任务解锁预留稳定位置</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  旧站的 `OnlineStudy.vue` 里最关键的是目录、前置任务和学习计时联动。当前工作台先把结构层级固定下来，后续接入目录数据时不需要再推翻版式。
                </p>
              </article>

              <article className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Clock3 className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">节奏判断</p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">把进度、最近时长和考试联动放在同一屏</h3>
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
              <article key={item.label} className="rounded-[24px] border border-border/70 bg-background/80 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};
