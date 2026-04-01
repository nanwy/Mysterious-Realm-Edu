export const PRACTICE_PAGE_SIZE = 9;

export interface PracticeRepositoryItem {
  id: string;
  title: string;
  description: string;
  questionCount?: string;
  updatedAt?: string;
}

export interface PracticeRepositoryResult {
  items: PracticeRepositoryItem[];
  total: number;
}

export interface PracticeQueryState {
  page: number;
  keyword: string;
}
