export const NEWS_PAGE_SIZE = 6;
export const NEWS_DETAIL_PLACEHOLDER_PATH = "/news/detail";

export interface NewsQueryState {
  page: number;
  keyword: string;
}

export interface NewsSuggestionItem {
  id: string;
  title: string;
  summary: string;
  href: string;
}

export interface NewsListItem {
  id: string;
  title: string;
  summary: string;
  publishTime: string;
  coverImg: string | null;
  viewCountLabel: string;
  href: string;
}

export interface NewsSectionCard extends NewsListItem {
  eyebrow: string;
}

export interface NewsPageData {
  recommended: NewsSectionCard[];
  recommendedError: string | null;
  hot: NewsListItem[];
  hotError: string | null;
  items: NewsListItem[];
  total: number;
}
