export type HomeRecord = Record<string, unknown>;

export type HomePayload = {
  banners: HomeRecord[];
  announcements: HomeRecord[];
  hotCourses: HomeRecord[];
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
