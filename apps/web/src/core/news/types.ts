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

export interface NewsDetailRecord {
  id: string;
  title: string;
  content: string;
  summary: string;
  authorName: string;
  authorAvatar: string | null;
  publishTime: string;
  viewCountText: string;
  source: string;
}

export interface NewsHotRecord {
  id: string;
  title: string;
  viewCountText: string;
}

export interface NewsDetailData {
  article: NewsDetailRecord | null;
  hotNews: NewsHotRecord[];
}

