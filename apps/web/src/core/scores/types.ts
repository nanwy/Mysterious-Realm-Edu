import type { ScorePassFilter } from "./config";

export interface ScoreFiltersState {
  examTitle: string;
  passed: ScorePassFilter;
  pageNo: number;
  pageSize: number;
}

export interface ScoreRecord {
  id: string;
  examId: string;
  examTitle: string;
  tryCount: number | null;
  maxScore: number | null;
  passed: boolean | null;
  recentExamTime: string;
}

export interface ScoreListResult {
  records: ScoreRecord[];
  total: number;
}

export interface ScoreDetailsFiltersState {
  passed: ScorePassFilter;
  pageNo: number;
  pageSize: number;
}

export interface ScoreDetailRecord {
  id: string;
  examTitle: string;
  createTime: string;
  commitTime: string;
  userTime: string;
  userScore: string;
  qualifyScore: string;
  stateLabel: string;
  passed: boolean | null;
}

export interface ScoreDetailsResult {
  records: ScoreDetailRecord[];
  total: number;
}

