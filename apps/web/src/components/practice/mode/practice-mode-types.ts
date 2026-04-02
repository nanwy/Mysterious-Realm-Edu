export interface PracticeModeAction {
  id: string;
  title: string;
  description: string;
  query: string;
}

export interface PracticeQuestionType {
  id: string;
  type: number;
  title: string;
  description: string;
  count: number;
}

export interface PracticeRecentRecord {
  id: string;
  title: string;
  accuracy: string;
  committedAt: string;
}

export interface PracticeModeOverview {
  title: string;
  description: string;
  freePracticeActions: PracticeModeAction[];
  questionTypes: PracticeQuestionType[];
}

export interface PracticeModeResult {
  overview: PracticeModeOverview;
  recentRecords: PracticeRecentRecord[];
  overviewError: string | null;
  recentError: string | null;
  isOverviewEmpty: boolean;
}
