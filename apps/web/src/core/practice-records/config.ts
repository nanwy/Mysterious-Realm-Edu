import type { PracticeRecordItem, PracticeRecordsQuery } from "./types";

export const PRACTICE_RECORDS_PAGE_SIZE = 10;

export const DEFAULT_PRACTICE_RECORDS_QUERY: PracticeRecordsQuery = {
  repositoryName: "",
  practiceName: "",
  pageNo: 1,
  pageSize: PRACTICE_RECORDS_PAGE_SIZE,
};

export const MOCK_PRACTICE_RECORDS: PracticeRecordItem[] = [
  {
    id: "mock-practice-record-1",
    repositoryName: "综合能力高频题库",
    practiceName: "自由练习",
    rightNumber: 42,
    totalNumber: 50,
    accuracy: 84,
    accuracyLabel: "84%",
    commitTime: "2026-04-24 20:16",
    durationLabel: "38 分钟",
    statusLabel: "示例数据",
    resultHref: "/practice/userPracticeResult/mock-practice-record-1",
  },
  {
    id: "mock-practice-record-2",
    repositoryName: "行政法专项训练",
    practiceName: "单选题强化",
    rightNumber: 31,
    totalNumber: 40,
    accuracy: 78,
    accuracyLabel: "78%",
    commitTime: "2026-04-22 19:42",
    durationLabel: "27 分钟",
    statusLabel: "示例数据",
    resultHref: "/practice/userPracticeResult/mock-practice-record-2",
  },
  {
    id: "mock-practice-record-3",
    repositoryName: "申论基础题库",
    practiceName: "材料分析练习",
    rightNumber: 18,
    totalNumber: 20,
    accuracy: 90,
    accuracyLabel: "90%",
    commitTime: "2026-04-20 08:30",
    durationLabel: "46 分钟",
    statusLabel: "示例数据",
    resultHref: "/practice/userPracticeResult/mock-practice-record-3",
  },
];
