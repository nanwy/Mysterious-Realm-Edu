"use client";

import { queryOptions } from "@tanstack/react-query";
import { api, unwrapEnvelope } from "@workspace/api";
import { MOCK_PRACTICE_RECORDS } from "./config";
import type {
  PracticeRecordItem,
  PracticeRecordsQuery,
  PracticeRecordsResult,
} from "./types";
import { toNumberOrFallback, toRecordOrEmpty, toText } from "@/lib/normalize";

interface PracticeRecordsPayload {
  records: unknown[];
  total: number;
}

const normalizeAccuracy = (value: unknown, rightNumber: number, totalNumber: number) => {
  const raw = toNumberOrFallback(value, Number.NaN);
  const derived = totalNumber > 0 ? (rightNumber / totalNumber) * 100 : 0;
  const numeric = Number.isFinite(raw) ? raw : derived;

  if (numeric <= 1 && numeric > 0) {
    return Math.round(numeric * 100);
  }

  return Math.min(100, Math.max(0, Math.round(numeric)));
};

const formatDuration = (seconds: number) => {
  if (seconds <= 0) {
    return "用时待同步";
  }

  if (seconds < 60) {
    return `${seconds} 秒`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} 分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  return restMinutes > 0 ? `${hours} 小时 ${restMinutes} 分钟` : `${hours} 小时`;
};

const toPracticeRecordsPayload = (value: unknown): PracticeRecordsPayload => {
  if (Array.isArray(value)) {
    return {
      records: value,
      total: value.length,
    };
  }

  const payload = toRecordOrEmpty(value);
  const records = Array.isArray(payload.records)
    ? payload.records
    : Array.isArray(payload.list)
      ? payload.list
      : Array.isArray(payload.rows)
        ? payload.rows
        : Array.isArray(payload.data)
          ? payload.data
          : [];

  return {
    records,
    total: toNumberOrFallback(
      payload.total ?? payload.count ?? payload.totalCount,
      records.length
    ),
  };
};

export const normalizePracticeRecord = (
  item: unknown,
  index: number
): PracticeRecordItem => {
  const record = toRecordOrEmpty(item);
  const id = toText(
    record.id ?? record.userPracticeId,
    `practice-record-${index + 1}`
  );
  const rightNumber = toNumberOrFallback(
    record.rightNumber ?? record.correctNumber ?? record.rightCount,
    0
  );
  const totalNumber = toNumberOrFallback(
    record.totalNumber ?? record.questionNumber ?? record.totalCount,
    0
  );
  const accuracy = normalizeAccuracy(
    record.accuracy ?? record.correctRate,
    rightNumber,
    totalNumber
  );
  const durationSeconds = toNumberOrFallback(
    record.userTime ?? record.useTime ?? record.duration ?? record.practiceTime,
    0
  );
  const statusLabel =
    toText(record.statusName) ||
    toText(record.state_dictText) ||
    toText(record.practiceStatusName) ||
    (totalNumber > 0 ? "已提交" : "记录待补全");

  return {
    id,
    repositoryName:
      toText(record.repositoryName) ||
      toText(record.repositoryTitle) ||
      toText(record.questionBankName) ||
      `题库 ${index + 1}`,
    practiceName:
      toText(record.practiceName) ||
      toText(record.modeName) ||
      toText(record.practiceModeName) ||
      "自由练习",
    rightNumber,
    totalNumber,
    accuracy,
    accuracyLabel: `${accuracy}%`,
    commitTime:
      toText(record.commitTime) ||
      toText(record.submitTime) ||
      toText(record.updateTime) ||
      "提交时间待同步",
    durationLabel: formatDuration(durationSeconds),
    statusLabel,
    resultHref: `/practice/userPracticeResult/${id}`,
  };
};

const hasActiveFilters = (query: Pick<PracticeRecordsQuery, "repositoryName" | "practiceName">) =>
  Boolean(query.repositoryName.trim() || query.practiceName.trim());

export const filterPracticeRecords = (
  records: PracticeRecordItem[],
  query: Pick<PracticeRecordsQuery, "repositoryName" | "practiceName">
) => {
  const repositoryName = query.repositoryName.trim();
  const practiceName = query.practiceName.trim();

  return records.filter((record) => {
    const matchesRepository = repositoryName
      ? record.repositoryName.includes(repositoryName)
      : true;
    const matchesPractice = practiceName
      ? record.practiceName.includes(practiceName)
      : true;

    return matchesRepository && matchesPractice;
  });
};

const paginatePracticeRecords = (
  records: PracticeRecordItem[],
  pageNo: number,
  pageSize: number
): PracticeRecordsResult => {
  const safePageSize = Math.max(pageSize, 1);
  const total = records.length;
  const pageCount = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(pageNo, 1), pageCount);
  const startIndex = (safePage - 1) * safePageSize;

  return {
    records: records.slice(startIndex, startIndex + safePageSize),
    total,
  };
};

export const createMockPracticeRecords = (query: PracticeRecordsQuery) =>
  filterPracticeRecords(MOCK_PRACTICE_RECORDS, query);

const requestPracticeRecordsPage = async (
  query: PracticeRecordsQuery
): Promise<PracticeRecordsResult> => {
  const response = await api.practice.listUserPractices({
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    repositoryName: query.repositoryName.trim(),
    practiceName: query.practiceName.trim(),
  });
  const result = toPracticeRecordsPayload(unwrapEnvelope(response));

  return {
    records: result.records.map(normalizePracticeRecord),
    total: result.total,
  };
};

const fetchHydratedPracticeRecords = async (query: PracticeRecordsQuery) => {
  const collectorPageSize = Math.max(query.pageSize, 20);
  const firstPage = await requestPracticeRecordsPage({
    ...query,
    pageNo: 1,
    pageSize: collectorPageSize,
  });
  const pageCount = Math.max(1, Math.ceil(firstPage.total / collectorPageSize));
  const pageRequests = [];

  for (let page = 2; page <= pageCount; page += 1) {
    pageRequests.push(
      requestPracticeRecordsPage({
        ...query,
        pageNo: page,
        pageSize: collectorPageSize,
      })
    );
  }

  const remainingPages = await Promise.all(pageRequests);
  const records = [firstPage, ...remainingPages].flatMap((page) => page.records);

  return paginatePracticeRecords(
    filterPracticeRecords(records, query),
    query.pageNo,
    query.pageSize
  );
};

export const fetchPracticeRecords = async (query: PracticeRecordsQuery) => {
  if (!hasActiveFilters(query)) {
    return requestPracticeRecordsPage(query);
  }

  return fetchHydratedPracticeRecords(query);
};

export const normalizePracticeRecordsError = (error: unknown) => {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "练习记录数据暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。当前未连接练习记录服务，已切换到示例内容。`;
  }

  if (message === "网络请求失败") {
    return "练习记录数据暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
};

export const practiceRecordKeys = {
  all: ["practice-records"] as const,
  list: (query: PracticeRecordsQuery) =>
    [
      ...practiceRecordKeys.all,
      "list",
      query.repositoryName,
      query.practiceName,
      query.pageNo,
      query.pageSize,
    ] as const,
};

export const practiceRecordQueryOptions = {
  list: (query: PracticeRecordsQuery) =>
    queryOptions({
      queryKey: practiceRecordKeys.list(query),
      queryFn: () => fetchPracticeRecords(query),
    }),
};
