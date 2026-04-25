import { api, unwrapEnvelope } from "@workspace/api";
import {
  NEWS_DETAIL_PATH,
  NEWS_HOT_LIMIT,
  NEWS_PAGE_SIZE,
  NEWS_RECOMMENDED_LIMIT,
} from "./config";
import type {
  NewsDetailData,
  NewsDetailRecord,
  NewsHotRecord,
  NewsListItem,
  NewsPageData,
  NewsQueryState,
  NewsSectionCard,
  NewsSuggestionItem,
} from "./types";
import { resolveMediaUrl } from "@/lib/media";
import { toNumberOrNull, toRecordOrEmpty, toText } from "@/lib/normalize";

interface NewsListPayload {
  records?: unknown[];
  total?: number;
  list?: unknown[];
  rows?: unknown[];
  data?: unknown[];
}

const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  const record = toRecordOrEmpty(value) as NewsListPayload;

  if (Array.isArray(record.records)) {
    return record.records;
  }

  if (Array.isArray(record.list)) {
    return record.list;
  }

  if (Array.isArray(record.rows)) {
    return record.rows;
  }

  if (Array.isArray(record.data)) {
    return record.data;
  }

  return [];
};

const getTotal = (value: unknown, count: number) => {
  const record = toRecordOrEmpty(value) as NewsListPayload;
  return typeof record.total === "number" && Number.isFinite(record.total)
    ? record.total
    : count;
};

const getDetailHref = (identifier: unknown) => {
  const id = String(identifier ?? "").trim();
  return id ? `${NEWS_DETAIL_PATH}/${id}` : NEWS_DETAIL_PATH;
};

const formatPublishTime = (record: Record<string, unknown>) =>
  toText(record.publishTime) ||
  toText(record.createTime) ||
  toText(record.updateTime) ||
  "发布时间待补充";

const formatSummary = (record: Record<string, unknown>) =>
  toText(record.remark) ||
  toText(record.summary) ||
  toText(record.description) ||
  "摘要待补充，详情页迁移后将继续承接完整正文。";

const formatViewCount = (value: unknown) => {
  const count = toNumberOrNull(value);
  return count !== null && count >= 0 ? `${count} 次浏览` : "热度待同步";
};

const toHtml = (value: unknown) => {
  const text = toText(value);
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

export const normalizeNewsItem = (
  value: unknown,
  index: number
): NewsListItem => {
  const record = toRecordOrEmpty(value);
  const id = record.id ?? record.articleId ?? record.newsId ?? `news-${index + 1}`;
  const title = toText(record.title) || `资讯 ${index + 1}`;

  return {
    id: String(id),
    title,
    summary: formatSummary(record),
    publishTime: formatPublishTime(record),
    coverImg: toText(record.coverImg) || null,
    viewCountLabel: formatViewCount(
      record.commentNum ?? record.viewCount ?? record.clickNum
    ),
    href: getDetailHref(id),
  };
};

export const normalizeSectionCard = (
  value: unknown,
  index: number,
  eyebrow: string
): NewsSectionCard => ({
  ...normalizeNewsItem(value, index),
  eyebrow,
});

export const normalizeNewsDetail = (
  payload: unknown,
  newsId: string
): NewsDetailRecord | null => {
  const record = toRecordOrEmpty(payload);
  const title = toText(record.title);
  const content = toHtml(record.content ?? record.articleContent ?? record.remark);

  if (!title && !content) {
    return null;
  }

  return {
    id: toText(record.id, newsId),
    title: title || "未命名资讯",
    content,
    summary: toText(record.remark ?? record.summary, "当前资讯暂无摘要说明。"),
    authorName: toText(
      record.createByName ?? record.publishByName ?? record.author,
      "平台资讯"
    ),
    authorAvatar:
      resolveMediaUrl(toText(record.avatar ?? record.authorAvatar)) ?? null,
    publishTime: toText(
      record.publishTime ?? record.createTime ?? record.updateTime,
      "发布时间待同步"
    ),
    viewCountText: toText(
      record.commentNum ?? record.viewCount ?? record.readCount,
      "0"
    ),
    source: toText(record.source ?? record.newsSource, "神秘领域教育"),
  };
};

export const normalizeHotNews = (payload: unknown): NewsHotRecord[] => {
  const normalizedPayload = toRecordOrEmpty(payload);
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(normalizedPayload.records)
      ? (normalizedPayload.records as unknown[])
      : [];

  return records.slice(0, NEWS_HOT_LIMIT).map((item, index) => {
    const record = toRecordOrEmpty(item);

    return {
      id: toText(record.id, `hot-news-${index + 1}`),
      title: toText(record.title, `热门资讯 ${index + 1}`),
      viewCountText: toText(
        record.commentNum ?? record.viewCount ?? record.readCount,
        "0"
      ),
    };
  });
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
  const listPromise = keyword
    ? api.news.searchNews({ queryString: keyword })
    : api.news.listNews({
        pageNo: query.page,
        pageSize: NEWS_PAGE_SIZE,
      });

  const [recommendedResponse, hotResponse, listResponse] =
    await Promise.allSettled([recommendedPromise, hotPromise, listPromise]);
  const recommendedPayload =
    recommendedResponse.status === "fulfilled"
      ? unwrapEnvelope(recommendedResponse.value)
      : [];
  const hotPayload =
    hotResponse.status === "fulfilled" ? unwrapEnvelope(hotResponse.value) : [];

  if (listResponse.status !== "fulfilled") {
    throw listResponse.reason;
  }

  const listPayload = unwrapEnvelope(listResponse.value);
  const recommended = toArray(recommendedPayload)
    .slice(0, NEWS_RECOMMENDED_LIMIT)
    .map((item, index) => normalizeSectionCard(item, index, "推荐资讯"));
  const hot = toArray(hotPayload)
    .slice(0, NEWS_HOT_LIMIT)
    .map((item, index) => normalizeNewsItem(item, index));
  const recommendedError =
    recommendedResponse.status === "rejected"
      ? normalizeNewsError(recommendedResponse.reason)
      : null;
  const hotError =
    hotResponse.status === "rejected"
      ? normalizeNewsError(hotResponse.reason)
      : null;

  if (keyword) {
    const searchItems = toArray(listPayload).map((item, index) =>
      normalizeNewsItem(item, index)
    );
    const start = (query.page - 1) * NEWS_PAGE_SIZE;

    return {
      recommended,
      recommendedError,
      hot,
      hotError,
      items: searchItems.slice(start, start + NEWS_PAGE_SIZE),
      total: searchItems.length,
    };
  }

  const items = toArray(listPayload).map((item, index) =>
    normalizeNewsItem(item, index)
  );

  return {
    recommended,
    recommendedError,
    hot,
    hotError,
    items,
    total: getTotal(listPayload, items.length),
  };
};

export const fetchNewsSuggestions = async (
  keyword: string
): Promise<NewsSuggestionItem[]> => {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return [];
  }

  const response = await api.news.searchNews({ queryString: trimmed });
  const payload = unwrapEnvelope(response);

  return toArray(payload)
    .slice(0, 6)
    .map((item, index) => {
      const normalized = normalizeNewsItem(item, index);
      return {
        id: normalized.id,
        title: normalized.title,
        summary: normalized.summary,
        href: normalized.href,
      };
    });
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
    article: normalizeNewsDetail(unwrapEnvelope(articleResponse.value), newsId),
    hotNews:
      hotResponse.status === "fulfilled"
        ? normalizeHotNews(unwrapEnvelope(hotResponse.value))
        : [],
  };
};
