import assert from "node:assert/strict";
import test from "node:test";
import { buildCourseCardView } from "./view-model";

test("buildCourseCardView maps Java course fields to list UI fields", () => {
  const item = buildCourseCardView(
    {
      id: "course-1",
      name: "Java 基础",
      teacherName: "张老师",
      categoryName: "后端",
      price: 0,
      classHour: "12",
      courseStudyProcess: 0.5,
    },
    0
  );

  assert.deepEqual(item, {
    id: "course-1",
    title: "Java 基础",
    teacherName: "张老师",
    categoryName: "后端",
    priceLabel: "免费学习",
    statusLabel: "学习中",
    progressLabel: "已学 50%",
    progressValue: 50,
    lessonCountLabel: "12 节内容",
    coverLabel: "JA",
  });
});

test("buildCourseCardView treats decimal 1 as completed progress", () => {
  const item = buildCourseCardView(
    {
      name: "课程",
      courseStudyProcess: 1,
    },
    1
  );

  assert.equal(item.statusLabel, "已完成");
  assert.equal(item.progressLabel, "已学 100%");
});
