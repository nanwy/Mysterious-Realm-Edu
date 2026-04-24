export interface QuestionnaireItem {
  id: string;
  title: string;
  description: string;
  questionCount: string;
  answerCount: string;
  category: string;
  status?: string;
  updatedAt?: string;
}

export interface QuestionnaireResult {
  items: QuestionnaireItem[];
  total: number;
}

export interface QuestionnaireQueryState {
  page: number;
  keyword: string;
}

