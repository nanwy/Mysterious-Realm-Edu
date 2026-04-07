"use client";

import {
  getNewsList,
  listHotNews,
  listRecommendedNews,
  searchNewsList,
  unwrapEnvelope,
} from "@workspace/api";
import { toNumberOrNull, toRecordOrEmpty, toText } from "@/lib/normalize";
import { NEWS_DETAIL_PLACEHOLDER_PATH, NEWS_PAGE_SIZE, type NewsListItem, type NewsPageData, type NewsQueryState, type NewsSectionCard, type NewsSuggestionItem } from "./news-types";

interface NewsListPayload {
  records?: unknown[];
  total?: number;
  list?: unknown[];
  rows?: unknown[];
  data?: unknown[];
}

function toArray(value: unknown): unknown[] {
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
}

function getTotal(value: unknown, count: number) {
  const record = toRecordOrEmpty(value) as NewsListPayload;
  return typeof record.total === "number" && Number.isFinite(record.total) ? record.total : count;
}

function getDetailHref(identifier: unknown) {
  const id = String(identifier ?? "").trim();
  return id ? `${NEWS_DETAIL_PLACEHOLDER_PATH}/${id}` : NEWS_DETAIL_PLACEHOLDER_PATH;
}

function formatPublishTime(record: Record<string, unknown>) {
  return (
    toText(record.publishTime) ||
    toText(record.createTime) ||
    toText(record.updateTime) ||
    "发布时间待补充"
  );
}

function formatSummary(record: Record<string, unknown>) {
  return (
    toText(record.remark) ||
    toText(record.summary) ||
    toText(record.description) ||
    "摘要待补充，详情页迁移后将继续承接完整正文。"
  );
}

function formatViewCount(value: unknown) {
  const count = toNumberOrNull(value);
  return count !== null && count >= 0 ? `${count} 次浏览` : "热度待同步";
}

function normalizeNewsItem(value: unknown, index: number): NewsListItem {
  const record = toRecordOrEmpty(value);
  const id = record.id ?? record.articleId ?? record.newsId ?? `news-${index + 1}`;
  const title = toText(record.title) || `资讯 ${index + 1}`;

  return {
    id: String(id),
    title,
    summary: formatSummary(record),
    publishTime: formatPublishTime(record),
    coverImg: toText(record.coverImg) || null,
    viewCountLabel: formatViewCount(record.commentNum ?? record.viewCount ?? record.clickNum),
    href: getDetailHref(id),
  };
}

function normalizeSectionCard(value: unknown, index: number, eyebrow: string): NewsSectionCard {
  return {
    ...normalizeNewsItem(value, index),
    eyebrow,
  };
}

export function normalizeNewsError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "新闻接口暂不可用，请确认已登录且 NEXT_PUBLIC_API_BASE_URL 已配置。";
}

export async function fetchNewsPageData(query: NewsQueryState): Promise<NewsPageData> {
  const keyword = query.keyword.trim();
  const recommendedPromise = listRecommendedNews({
    pageNo: 1,
    pageSize: 4,
  });
  const hotPromise = listHotNews({
    pageNo: 1,
    pageSize: 5,
  });
  const listPromise = keyword
    ? searchNewsList(keyword)
    : getNewsList({
        pageNo: query.page,
        pageSize: NEWS_PAGE_SIZE,
      });

  const [recommendedResponse, hotResponse, listResponse] = await Promise.allSettled([
    recommendedPromise,
    hotPromise,
    listPromise,
  ]);
  const recommendedPayload =
    recommendedResponse.status === "fulfilled" ? unwrapEnvelope(recommendedResponse.value) : [];
  const hotPayload = hotResponse.status === "fulfilled" ? unwrapEnvelope(hotResponse.value) : [];

  if (listResponse.status !== "fulfilled") {
    throw listResponse.reason;
  }

  const listPayload = unwrapEnvelope(listResponse.value);

  const recommended = toArray(recommendedPayload)
    .slice(0, 4)
    .map((item, index) => normalizeSectionCard(item, index, "推荐资讯"));
  const hot = toArray(hotPayload)
    .slice(0, 5)
    .map((item, index) => normalizeNewsItem(item, index));
  const recommendedError =
    recommendedResponse.status === "rejected" ? normalizeNewsError(recommendedResponse.reason) : null;
  const hotError = hotResponse.status === "rejected" ? normalizeNewsError(hotResponse.reason) : null;

  if (keyword) {
    const searchItems = toArray(listPayload).map((item, index) => normalizeNewsItem(item, index));
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

  const items = toArray(listPayload).map((item, index) => normalizeNewsItem(item, index));

  return {
    recommended,
    recommendedError,
    hot,
    hotError,
    items,
    total: getTotal(listPayload, items.length),
  };
}

export async function fetchNewsSuggestions(keyword: string): Promise<NewsSuggestionItem[]> {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return [];
  }

  const response = await searchNewsList(trimmed);
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
}
