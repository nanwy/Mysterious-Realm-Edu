import { StudentShell } from "@workspace/ui";
import { ScoresPage } from "@/components/scores/page";
import { SCORE_PASS_STATE, SCORES_PAGE_SIZE } from "@/core/scores";

const toPositivePage = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

const toKeyword = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
};

const toPassedFilter = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === SCORE_PASS_STATE.PASSED || raw === SCORE_PASS_STATE.FAILED
    ? raw
    : SCORE_PASS_STATE.ALL;
};

const ScoresPageRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialFilters = {
    examTitle: toKeyword(params.keyword),
    passed: toPassedFilter(params.passed),
    pageNo: toPositivePage(params.page),
    pageSize: SCORES_PAGE_SIZE,
  } as const;

  return (
    <StudentShell>
      <div className="relative -mx-4 -my-10 overflow-hidden bg-background sm:-mx-6 lg:-mx-8">
        <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        <ScoresPage initialFilters={initialFilters} />
      </div>
    </StudentShell>
  );
};

export default ScoresPageRoute;
