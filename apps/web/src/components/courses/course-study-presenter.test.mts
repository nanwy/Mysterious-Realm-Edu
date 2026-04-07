import assert from "node:assert/strict";
import test from "node:test";
import { buildCourseStudyViewModel } from "./course-study-presenter.ts";

test("buildCourseStudyViewModel maps successful payload into study dashboard copy", () => {
  const viewModel = buildCourseStudyViewModel("course-9", {
    detail: {
      courseName: "神秘领域驾驶课",
      teacherName: "苏老师",
      categoryName: "理论强化",
      chapterTotal: 18,
      studyTime: 180,
      examTypeName: "完成后考试",
    },
    process: {
      studyStatusName: "学习中",
      studyProcess: 67,
      finishCatalogNum: 12,
      studyTime: 95,
    },
    latestTask: {
      taskName: "第 13 节 · 夜间驾驶",
      studyStatusName: "可继续",
      updateTime: "2026-04-07 11:40",
    },
    error: null,
    errorType: null,
  });

  assert.equal(viewModel.title, "神秘领域驾驶课");
  assert.equal(viewModel.progressValue, "67%");
  assert.equal(viewModel.completedLessonsValue, "12/18");
  assert.match(viewModel.nextActionLabel, /继续 第 13 节/);
  assert.equal(viewModel.errorTitle, null);
});

test("buildCourseStudyViewModel preserves explicit error guidance for config and auth failures", () => {
  const configViewModel = buildCourseStudyViewModel("course-1", {
    detail: null,
    process: null,
    latestTask: null,
    error: "missing base url",
    errorType: "config_missing",
  });

  const authViewModel = buildCourseStudyViewModel("course-2", {
    detail: null,
    process: null,
    latestTask: null,
    error: "unauthorized",
    errorType: "unauthorized",
  });

  assert.equal(configViewModel.nextActionLabel, "等待环境配置");
  assert.equal(configViewModel.errorTitle, "环境尚未联通");
  assert.equal(authViewModel.nextActionLabel, "重新登录后继续");
  assert.equal(authViewModel.errorTitle, "登录态需要刷新");
});
