import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCourseFiltersFromSearchParams,
  buildCourseStudyViewModel,
  COURSE_ORDER_BY,
} from "./index";

test("buildCourseFiltersFromSearchParams normalizes route search params", () => {
  assert.deepEqual(
    buildCourseFiltersFromSearchParams({
      keyword: "  java  ",
      sort: COURSE_ORDER_BY.COLLECTS,
      category: ["backend"],
      page: "3.8",
    }),
    {
      keyword: "java",
      orderBy: COURSE_ORDER_BY.COLLECTS,
      categoryId: "backend",
      pageNo: 3,
      pageSize: 9,
    }
  );
});

test("buildCourseStudyViewModel prefers Java-backed course study fields", () => {
  const view = buildCourseStudyViewModel("c1", {
    detail: {
      name: "课程",
      summary: "摘要",
      courseStudyProcess: 0.75,
      finishNum: 3,
      taskNum: 4,
      teacherName: "讲师",
      mustLearn: true,
      examId: "e1",
      examTitle: "结课考试",
    },
    process: null,
    latestTask: {
      courseCatalogId: "task-1",
      taskName: "第一章",
      totalLearnTime: 90,
      updateTime: "2026-04-28 10:00:00",
    },
    error: null,
    errorType: null,
  });

  assert.equal(view.courseName, "课程");
  assert.equal(view.statusLabel, "学习中");
  assert.equal(view.metrics[0]?.value, "75%");
  assert.equal(view.metrics[1]?.value, "3/4");
  assert.equal(view.metrics[2]?.value, "1 小时 30 分钟");
  assert.equal(view.examLink, "/scores/e1");
});
