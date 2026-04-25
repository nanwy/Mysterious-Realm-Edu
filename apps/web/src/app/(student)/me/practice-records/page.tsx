import { StudentShell } from "@workspace/ui";
import { PracticeRecordsPage } from "@/components/me/practice-records/page";
import {
  DEFAULT_PRACTICE_RECORDS_QUERY,
  PRACTICE_RECORDS_PAGE_SIZE,
} from "@/core/practice-records";

const toPositivePage = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0
    ? Math.floor(page)
    : DEFAULT_PRACTICE_RECORDS_QUERY.pageNo;
};

const toSearchText = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
};

const PracticeRecordsRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialQuery = {
    repositoryName: toSearchText(params.repositoryName),
    practiceName: toSearchText(params.practiceName),
    pageNo: toPositivePage(params.page),
    pageSize: PRACTICE_RECORDS_PAGE_SIZE,
  };

  return (
    <StudentShell>
      <PracticeRecordsPage initialQuery={initialQuery} />
    </StudentShell>
  );
};

export default PracticeRecordsRoute;
