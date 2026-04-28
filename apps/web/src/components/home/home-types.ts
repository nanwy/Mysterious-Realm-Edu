import type { CourseDetailResponse } from "@workspace/api";

export type HomeRecord = Record<string, unknown>;
export type HomeCourseRecord = CourseDetailResponse;

export type HomePayload = {
  banners: HomeRecord[];
  announcements: HomeRecord[];
  hotCourses: HomeCourseRecord[];
  latestExams: HomeRecord[];
  questionnaires: HomeRecord[];
  recommendedNews: HomeRecord[];
  hotNews: HomeRecord[];
  bannerError: string | null;
  announcementError: string | null;
  courseError: string | null;
  examError: string | null;
  questionnaireError: string | null;
  recommendedNewsError: string | null;
  hotNewsError: string | null;
};
