import { api, unwrapEnvelope } from "@workspace/api";
import type {
  NewsArticle,
  NewsDetailData,
  NewsListResponse,
  NewsPageData,
  NewsQueryState,
  NewsSearchResponse,
} from "@workspace/api";
import {
  NEWS_DETAIL_PATH,
  NEWS_HOT_LIMIT,
  NEWS_PAGE_SIZE,
  NEWS_RECOMMENDED_LIMIT,
} from "./config";
import { toNumberOrNull, toText } from "@/lib/normalize";

export const resolveNewsDetailHref = (identifier: unknown) => {
  const id = String(identifier ?? "").trim();
  return id ? `${NEWS_DETAIL_PATH}/${id}` : NEWS_DETAIL_PATH;
};

export const formatNewsViewCount = (value: unknown) => {
  const count = toNumberOrNull(value);
  return count !== null && count >= 0 ? `${count} 次浏览` : "热度待同步";
};

export const buildNewsHtmlContent = (article: NewsArticle | null) => {
  if (!article) {
    return "";
  }

  const text = toText(article.content ?? article.remark);
  if (!text) {
    return "";
  }

  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
};

export const normalizeNewsError = (error: unknown) => {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "新闻接口暂不可用，请确认已登录且 NEXT_PUBLIC_API_BASE_URL 已配置。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message} 未检测到 NEXT_PUBLIC_API_BASE_URL。`;
  }

  if (message === "网络请求失败") {
    return "新闻接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
};

export const fetchNewsPageData = async (
  query: NewsQueryState
): Promise<NewsPageData> => {
  const keyword = query.keyword.trim();
  const recommendedPromise = api.news.listRecommendedNews({
    pageNo: 1,
    pageSize: NEWS_RECOMMENDED_LIMIT,
  });
  const hotPromise = api.news.listHotNews({
    pageNo: 1,
    pageSize: NEWS_HOT_LIMIT,
  });
  const [recommendedResponse, hotResponse] = await Promise.allSettled([
    recommendedPromise,
    hotPromise,
  ]);
  const recommendedPayload =
    recommendedResponse.status === "fulfilled"
      ? unwrapEnvelope(recommendedResponse.value)
      : null;
  const hotPayload =
    hotResponse.status === "fulfilled"
      ? (unwrapEnvelope(hotResponse.value)?.records ?? [])
      : [];

  const recommended = (recommendedPayload?.records ?? []).slice(
    0,
    NEWS_RECOMMENDED_LIMIT
  );
  const hot = hotPayload.slice(0, NEWS_HOT_LIMIT);
  const recommendedError =
    recommendedResponse.status === "rejected"
      ? normalizeNewsError(recommendedResponse.reason)
      : null;
  const hotError =
    hotResponse.status === "rejected"
      ? normalizeNewsError(hotResponse.reason)
      : null;

  if (keyword) {
    const listResponse = await api.news.searchNews({ queryString: keyword });
    const listPayload: NewsSearchResponse = unwrapEnvelope(listResponse) ?? [];
    const start = (query.page - 1) * NEWS_PAGE_SIZE;

    return {
      recommended,
      recommendedError,
      hot,
      hotError,
      items: listPayload.slice(start, start + NEWS_PAGE_SIZE),
      total: listPayload.length,
    };
  }

  const listResponse = await api.news.listNews({
    pageNo: query.page,
    pageSize: NEWS_PAGE_SIZE,
  });
  const listPayload: NewsListResponse = unwrapEnvelope(listResponse) ?? {
    records: [],
    total: 0,
  };
  return {
    recommended,
    recommendedError,
    hot,
    hotError,
    items: listPayload.records,
    total: listPayload.total,
  };
};

export const fetchNewsSuggestions = async (
  keyword: string
): Promise<NewsArticle[]> => {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return [];
  }

  const response = await api.news.searchNews({ queryString: trimmed });
  const payload = unwrapEnvelope(response) ?? [];

  return payload.slice(0, 6);
};

export const fetchNewsDetailData = async (
  newsId: string
): Promise<NewsDetailData> => {
  const [articleResponse, hotResponse] = await Promise.allSettled([
    api.news.getNewsDetail({ path: newsId }),
    api.news.listHotNews({
      pageNo: 1,
      pageSize: NEWS_HOT_LIMIT,
    }),
  ]);

  if (articleResponse.status !== "fulfilled") {
    throw articleResponse.reason;
  }

  return {
    article: unwrapEnvelope(articleResponse.value),
    hotNews:
      hotResponse.status === "fulfilled"
        ? (unwrapEnvelope(hotResponse.value)?.records ?? []).slice(
            0,
            NEWS_HOT_LIMIT
          )
        : [],
  };
};
