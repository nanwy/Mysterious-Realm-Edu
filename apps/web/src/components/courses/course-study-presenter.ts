import type { CourseStudyResult } from "@/lib/course-study";

type UnknownRecord = Record<string, unknown>;

export interface CourseStudyViewModel {
  courseId: string;
  title: string;
  statusLabel: string;
  teacherName: string;
  categoryLabel: string;
  progressPercent: number;
  progressValue: string;
  progressHint: string;
  completedLessonsValue: string;
  completedLessonsHint: string;
  accumulatedTimeValue: string;
  accumulatedTimeHint: string;
  latestTaskTitle: string;
  latestTaskHint: string;
  latestTaskMeta: string[];
  nextActionLabel: string;
  nextActionHint: string;
  detailItems: Array<{ label: string; value: string }>;
  processItems: Array<{ label: string; value: string }>;
  errorTitle: string | null;
  errorMessage: string | null;
}

function toRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function readFirst(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function toText(value: unknown, fallback = "待同步") {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatMinutes(value: unknown, fallback = "待同步") {
  const minutes = toNumber(value);
  if (minutes === null) {
    return fallback;
  }

  if (minutes >= 60) {
    const hours = minutes / 60;
    return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)} 小时`;
  }

  return `${minutes} 分钟`;
}

function clampPercent(value: unknown) {
  const raw = toNumber(value);
  if (raw === null) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(raw)));
}

function createErrorCopy(result: CourseStudyResult) {
  if (!result.errorType) {
    return {
      title: null,
      message: null,
    };
  }

  if (result.errorType === "config_missing") {
    return {
      title: "环境尚未联通",
      message: result.error ?? "未检测到课程学习接口的基础配置，当前只能先展示页面结构。",
    };
  }

  if (result.errorType === "unauthorized") {
    return {
      title: "登录态需要刷新",
      message: result.error ?? "课程学习接口返回未登录或无权限，建议重新登录后再继续学习。",
    };
  }

  return {
    title: "课程数据暂时不完整",
    message: result.error ?? "部分接口请求失败，页面会尽量保留已经成功返回的信息。",
  };
}

export function buildCourseStudyViewModel(
  courseId: string,
  result: CourseStudyResult
): CourseStudyViewModel {
  const detail = toRecord(result.detail);
  const process = toRecord(result.process);
  const latestTask = toRecord(result.latestTask);

  const title = toText(
    readFirst(detail, ["courseName", "title", "name", "courseTitle"]),
    `课程 ${courseId}`
  );
  const teacherName = toText(
    readFirst(detail, ["teacherName", "lecturerName", "speakerName"]),
    "教师待同步"
  );
  const categoryLabel = toText(
    readFirst(detail, ["categoryName", "classifyName", "courseTypeName"]),
    "分类待同步"
  );
  const statusLabel = toText(
    readFirst(process, ["studyStatusName", "statusName", "stateText"]) ??
      readFirst(detail, ["studyStatusName", "statusName", "stateText"]),
    result.errorType ? "状态受接口影响" : "尚未开始"
  );
  const progressPercent = clampPercent(
    readFirst(process, ["studyProcess", "progress", "schedule", "percent"])
  );
  const chapterTotal =
    toNumber(readFirst(detail, ["chapterTotal", "catalogCount", "sectionCount", "taskCount"])) ?? 0;
  const chapterCompleted =
    toNumber(
      readFirst(process, ["finishCatalogNum", "completeCount", "finishedCount", "studyCatalogNum"])
    ) ?? 0;
  const latestTaskTitle = toText(
    readFirst(latestTask, ["taskName", "catalogName", "chapterName", "title"]),
    chapterCompleted > 0 ? "继续最近任务" : "等待任务解锁"
  );
  const latestTaskMeta = [
    toText(readFirst(latestTask, ["studyStatusName", "statusName", "taskStatusName"]), "状态待同步"),
    formatMinutes(readFirst(latestTask, ["studyTime", "videoTime", "duration"]), "时长待同步"),
    toText(readFirst(latestTask, ["updateTime", "lastStudyTime", "createTime"]), "更新时间待同步"),
  ];

  const errorCopy = createErrorCopy(result);

  let nextActionLabel = "开始第一节";
  let nextActionHint = "当前还没有可恢复的任务记录，可以从课程导学或第一节目录进入。";

  if (result.errorType === "config_missing") {
    nextActionLabel = "等待环境配置";
    nextActionHint = "先补齐 NEXT_PUBLIC_API_BASE_URL，再接入真实学习链路。";
  } else if (result.errorType === "unauthorized") {
    nextActionLabel = "重新登录后继续";
    nextActionHint = "登录态恢复后，页面会重新请求学习详情、进度和最近任务。";
  } else if (result.errorType === "request_failed") {
    nextActionLabel = "稍后重试";
    nextActionHint = "部分接口失败时，先保留已加载信息，避免整个页面退回空白。";
  } else if (progressPercent >= 100) {
    nextActionLabel = "进入结业环节";
    nextActionHint = "课程进度已完成，下一步应引导到考试、测评或证书领取。";
  } else if (latestTaskTitle !== "等待任务解锁") {
    nextActionLabel = `继续 ${latestTaskTitle}`;
    nextActionHint = "优先恢复最近一次学习任务，减少重新定位目录的成本。";
  }

  return {
    courseId,
    title,
    statusLabel,
    teacherName,
    categoryLabel,
    progressPercent,
    progressValue: `${progressPercent}%`,
    progressHint:
      progressPercent > 0
        ? `已完成 ${chapterCompleted}/${chapterTotal || "?"} 个学习单元`
        : "当前还没有明确的进度反馈",
    completedLessonsValue: chapterTotal > 0 ? `${chapterCompleted}/${chapterTotal}` : String(chapterCompleted),
    completedLessonsHint: "用于判断是否还存在前置任务、未学章节或待解锁目录。",
    accumulatedTimeValue: formatMinutes(
      readFirst(process, ["studyTime", "studyDuration", "totalStudyTime"]),
      "待同步"
    ),
    accumulatedTimeHint: `当前状态：${statusLabel}`,
    latestTaskTitle,
    latestTaskHint: "最近学习任务会决定用户下一步最自然的入口。",
    latestTaskMeta,
    nextActionLabel,
    nextActionHint,
    detailItems: [
      { label: "课程编号", value: toText(readFirst(detail, ["id", "courseId", "goodsId"]), courseId) },
      { label: "授课教师", value: teacherName },
      { label: "课程分类", value: categoryLabel },
      {
        label: "学时要求",
        value: formatMinutes(readFirst(detail, ["studyTime", "totalStudyTime", "duration"]), "待同步"),
      },
      {
        label: "章节规模",
        value: chapterTotal > 0 ? `${chapterTotal} 节` : "待同步",
      },
      {
        label: "结课条件",
        value: toText(readFirst(detail, ["examTypeName", "finishCondition", "courseRule"]), "待同步"),
      },
    ],
    processItems: [
      { label: "学习状态", value: statusLabel },
      { label: "累计进度", value: `${progressPercent}%` },
      { label: "完成章节", value: chapterTotal > 0 ? `${chapterCompleted}/${chapterTotal}` : String(chapterCompleted) },
      {
        label: "最近进入",
        value: toText(readFirst(process, ["lastStudyTime", "updateTime", "createTime"]), "待同步"),
      },
      {
        label: "预计下一步",
        value: nextActionLabel,
      },
      {
        label: "任务状态",
        value: toText(readFirst(latestTask, ["studyStatusName", "statusName", "taskStatusName"]), "待同步"),
      },
    ],
    errorTitle: errorCopy.title,
    errorMessage: errorCopy.message,
  };
}
