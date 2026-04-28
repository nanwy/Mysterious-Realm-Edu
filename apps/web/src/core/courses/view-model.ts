import type { CourseCategoryDetail, CourseDetailResponse } from "@workspace/api";
import type { fetchCourseStudy } from "./api";
import { COURSE_ORDER_BY, COURSE_ORDER_BY_OPTIONS } from "./config";
import type { CourseFiltersState } from "./types";
import { toNumberOrNull, toText } from "@/lib/normalize";

type CourseStudyData = Awaited<ReturnType<typeof fetchCourseStudy>>;

export type CourseStudyHighlightIcon = "course" | "task" | "next";

export interface CourseStudyHighlight {
  title: string;
  value: string;
  description: string;
  icon: CourseStudyHighlightIcon;
}

const formatPercent = (value: number | null) => {
  if (value === null) {
    return "待同步";
  }

  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
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

const readFiniteNumber = (value: number | string | undefined | null) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const formatPrice = (value: number | string | undefined) => {
  const amount = readFiniteNumber(value);
  if (amount === null) {
    return "价格待更新";
  }

  if (amount <= 0) {
    return "免费学习";
  }

  return `¥${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const formatCourseProgress = (value: number | undefined) => {
  const progress = readFiniteNumber(value);
  if (progress === null) {
    return "进度待同步";
  }

  const percent = progress > 0 && progress <= 1 ? progress * 100 : progress;
  const normalized = Math.min(100, Math.max(0, Math.round(percent)));
  return `已学 ${normalized}%`;
};

const formatLessonCount = (value: number | string | undefined) => {
  const count = readFiniteNumber(value);
  return count && count > 0 ? `${count} 节内容` : "课时待补充";
};

const formatCourseStatus = (courseStudyProcess: number | undefined) => {
  const progress = readFiniteNumber(courseStudyProcess);
  if (progress === null || progress <= 0) {
    return "可开始";
  }

  const percent = progress <= 1 ? progress * 100 : progress;
  return percent >= 100 ? "已完成" : "学习中";
};

const readStudyPercent = (value: unknown) => {
  const progress = toNumberOrNull(value);
  if (progress === null) {
    return null;
  }

  const percent = progress > 0 && progress <= 1 ? progress * 100 : progress;
  return Math.max(0, Math.min(100, percent));
};

export const getCourseStudyProgressTone = (value: number | null) => {
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

export const getCourseStatusCopy = (
  error: string | null,
  loading: boolean,
  total: number
) => {
  if (error) {
    return "接口异常";
  }

  if (loading) {
    return "加载中";
  }

  return `${total} 门课程`;
};

export const getCourseActiveFilterSummary = (
  filters: CourseFiltersState,
  categories: CourseCategoryDetail[]
) => {
  const summary: string[] = [];

  if (filters.keyword) {
    summary.push(`关键词：${filters.keyword}`);
  }

  if (filters.orderBy !== COURSE_ORDER_BY.DEFAULT) {
    const label = COURSE_ORDER_BY_OPTIONS.find(
      (option) => option.value === filters.orderBy
    )?.label;
    summary.push(`排序：${label ?? "已设置"}`);
  }

  if (filters.categoryId) {
    const categoryLabel =
      categories.find((item) => item.id === filters.categoryId)?.name ??
      filters.categoryId;
    summary.push(`分类：${categoryLabel}`);
  }

  return summary;
};

export const buildCourseStudyViewModel = (
  courseId: string,
  result: CourseStudyData
) => {
  const { detail, latestTask } = result;
  const processList = Array.isArray(result.process) ? result.process : [];
  const firstProcess = processList[0];

  const courseName = toText(detail?.name) || `课程 ${courseId}`;
  const subtitle =
    toText(detail?.summary) ||
    toText(detail?.description) ||
    "当前页已将课程详情、学习进度和最近任务汇总到单一工作台，方便继续学习前快速判断节奏与阻塞点。";
  const progress = readStudyPercent(
    detail?.courseStudyProcess ??
      latestTask?.courseStudyProcess ??
      firstProcess?.courseStudyProcess ??
      latestTask?.learnProcess ??
      firstProcess?.learnProcess
  );
  const statusLabel =
    progress === null ? "待开始" : progress >= 100 ? "已完成" : "学习中";
  const completedTasks = toText(detail?.finishNum);
  const totalTasks = toText(detail?.taskNum);
  const lastTaskName = toText(latestTask?.taskName) || "暂无最近任务";
  const lastTaskType = latestTask?.courseCatalogId ? "课程任务" : "任务";
  const lastTaskDuration = formatDuration(toText(latestTask?.totalLearnTime));
  const lastTaskUpdate =
    toText(latestTask?.updateTime) ||
    toText(latestTask?.createTime) ||
    "等待接口回传";
  const teacherName = toText(detail?.teacherName) || "待补充讲师";
  const difficulty = detail?.mustLearn ? "必修" : "选修";
  const examId = toText(detail?.examId);
  const examLink = examId ? `/scores/${examId}` : "/exams";
  const examLabel =
    toText(detail?.examTitle) || (examId ? "进入关联考试" : "查看考试列表");

  const metrics = [
    {
      label: "学习进度",
      value: formatPercent(progress),
      note:
        progress === null ? "接口未返回百分比" : `当前课程状态：${statusLabel}`,
    },
    {
      label: "任务完成",
      value:
        completedTasks && totalTasks
          ? `${completedTasks}/${totalTasks}`
          : totalTasks || completedTasks || "待同步",
      note: "优先判断距离解锁考试还差多少学习任务。",
    },
    {
      label: "最近学习时长",
      value: lastTaskDuration,
      note: "用于判断是否需要立即继续同一章节。",
    },
  ];

  const highlights: CourseStudyHighlight[] = [
    {
      title: "课程信息",
      value: teacherName,
      description: `讲师 / 负责人 · ${difficulty}`,
      icon: "course",
    },
    {
      title: "最近任务",
      value: lastTaskName,
      description: `${lastTaskType} · ${lastTaskUpdate}`,
      icon: "task",
    },
    {
      title: "下一步动作",
      value: progress !== null && progress >= 100 ? "准备进入测评" : "继续当前学习任务",
      description:
        progress !== null && progress >= 100
          ? "课程已接近完成，可进入考试或成绩页确认结果。"
          : "优先续学最近一次中断的章节，减少重复进入成本。",
      icon: "next",
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

export const buildCourseCardView = (
  course: CourseDetailResponse,
  index: number
) => {
  const id = course.id ?? `course-${index + 1}`;
  const title = course.name?.trim() || `课程 ${index + 1}`;
  const categoryName = course.categoryName?.trim() || "未分类";

  return {
    id,
    title,
    teacherName: course.teacherName?.trim() || "讲师待补充",
    categoryName,
    priceLabel: formatPrice(course.price),
    statusLabel: formatCourseStatus(course.courseStudyProcess),
    progressLabel: formatCourseProgress(course.courseStudyProcess),
    progressValue: readStudyPercent(course.courseStudyProcess) ?? 0,
    lessonCountLabel: formatLessonCount(course.classHour),
    coverLabel: title.slice(0, 2).toUpperCase(),
  };
};
