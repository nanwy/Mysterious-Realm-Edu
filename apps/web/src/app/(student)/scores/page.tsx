import type { ExamListRequest } from "@workspace/api";
import { StudentShell } from "@workspace/ui";
import { ScoresPage } from "@/components/scores/page";
import {
  resolveScoreKeywordParam,
  resolveScorePageParam,
  resolveScorePassedParam,
  SCORES_PAGE_SIZE,
} from "@/core/scores";

const ScoresPageRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialFilters: ExamListRequest = {
    examTitle: resolveScoreKeywordParam(params.keyword),
    passed: resolveScorePassedParam(params.passed),
    pageNo: resolveScorePageParam(params.page),
    pageSize: SCORES_PAGE_SIZE,
  };

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
