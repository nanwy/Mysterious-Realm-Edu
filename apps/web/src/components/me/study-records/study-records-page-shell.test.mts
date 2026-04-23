import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(currentDir, "study-records-page-shell.tsx"), "utf8");

function extractMarkedBlock(startMarker: string, endMarker: string) {
  const startIndex = shellSource.indexOf(startMarker);
  const endIndex = shellSource.indexOf(endMarker);

  assert.notEqual(startIndex, -1, `Missing start marker: ${startMarker}`);
  assert.notEqual(endIndex, -1, `Missing end marker: ${endMarker}`);

  return shellSource.slice(startIndex + startMarker.length, endIndex).trim();
}

function loadStudyRecordsDataUtils() {
  const snippet = extractMarkedBlock(
    "// BEGIN_STUDY_RECORDS_DATA_UTILS",
    "// END_STUDY_RECORDS_DATA_UTILS"
  ).replace(/const studyRecordsDataUtils:\s*[\s\S]*?=\s*/, "const studyRecordsDataUtils = ");

  return Function('"use strict";\n' + snippet + "\nreturn studyRecordsDataUtils;")() as {
    hasActiveFilters(query: { keyword: string; taskKeyword: string }): boolean;
    filterAndPaginate(
      records: Array<{ id: string; courseName: string; taskName: string }>,
      query: { keyword: string; taskKeyword: string; pageNo: number; pageSize: number }
    ): {
      records: Array<{ id: string; courseName: string; taskName: string }>;
      total: number;
    };
  };
}

function loadFetchHydratedStudyRecords(studyRecordsDataUtils: {
  filterAndPaginate(
    records: Array<{ id: string; courseName: string; taskName: string }>,
    query: { keyword: string; taskKeyword: string; pageNo: number; pageSize: number }
  ): {
    records: Array<{ id: string; courseName: string; taskName: string }>;
    total: number;
  };
}) {
  const snippet = extractMarkedBlock(
    "// BEGIN_FETCH_HYDRATED_STUDY_RECORDS",
    "// END_FETCH_HYDRATED_STUDY_RECORDS"
  ).replace(
    /const fetchHydratedStudyRecords:\s*[\s\S]*?=\s*/,
    "const fetchHydratedStudyRecords = "
  );

  return Function(
    "studyRecordsDataUtils",
    '"use strict";\n' + snippet + "\nreturn fetchHydratedStudyRecords;"
  )(studyRecordsDataUtils) as (
    query: { keyword: string; taskKeyword: string; pageNo: number; pageSize: number },
    requestPage: (query: {
      keyword: string;
      taskKeyword: string;
      pageNo: number;
      pageSize: number;
    }) => Promise<{
      records: Array<{ id: string; courseName: string; taskName: string }>;
      total: number;
    }>
  ) => Promise<{
    records: Array<{ id: string; courseName: string; taskName: string }>;
    total: number;
  }>;
}

function createRecord(index: number, overrides: Partial<{ courseName: string; taskName: string }> = {}) {
  return {
    id: `record-${index}`,
    courseName: overrides.courseName ?? `课程 ${index}`,
    taskName: overrides.taskName ?? `任务 ${index}`,
  };
}

test("study records page shell keeps filter, overview, list, and pagination structure", () => {
  assert.match(shellSource, /data-testid="study-records-filter-section"/);
  assert.match(shellSource, /data-testid="study-records-overview"/);
  assert.match(shellSource, /data-testid="study-records-list"|data-testid="study-records-list-region"/);
  assert.match(shellSource, /data-testid="study-records-pagination"/);
});

test("study records client filtering paginates after scanning the full result set", () => {
  const studyRecordsDataUtils = loadStudyRecordsDataUtils();
  const records = Array.from({ length: 12 }, (_, index) =>
    createRecord(index + 1, {
      taskName: index === 10 ? "高频真题复盘" : `普通任务 ${index + 1}`,
    })
  );

  const result = studyRecordsDataUtils.filterAndPaginate(records, {
    keyword: "",
    taskKeyword: "真题",
    pageNo: 1,
    pageSize: 10,
  });

  assert.equal(result.total, 1);
  assert.deepEqual(result.records.map((record) => record.id), ["record-11"]);
});

test("study records hydrates all filtered pages before applying client fallback filters", async () => {
  const studyRecordsDataUtils = loadStudyRecordsDataUtils();
  const fetchHydratedStudyRecords = loadFetchHydratedStudyRecords(studyRecordsDataUtils);
  const calls: Array<{ keyword: string; taskKeyword: string; pageNo: number; pageSize: number }> = [];
  const records = Array.from({ length: 25 }, (_, index) =>
    createRecord(index + 1, {
      courseName: index === 24 ? "申论冲刺课" : `课程 ${index + 1}`,
      taskName: index === 24 ? "综合分析题拆解" : `普通任务 ${index + 1}`,
    })
  );

  const result = await fetchHydratedStudyRecords(
    {
      keyword: "申论",
      taskKeyword: "综合分析",
      pageNo: 1,
      pageSize: 10,
    },
    async (query) => {
      calls.push(query);
      const startIndex = (query.pageNo - 1) * query.pageSize;

      return {
        records: records.slice(startIndex, startIndex + query.pageSize),
        total: records.length,
      };
    }
  );

  assert.deepEqual(
    calls.map((query) => [query.pageNo, query.pageSize]),
    [
      [1, 20],
      [2, 20],
    ]
  );
  assert.equal(result.total, 1);
  assert.deepEqual(result.records.map((record) => record.id), ["record-25"]);
});
