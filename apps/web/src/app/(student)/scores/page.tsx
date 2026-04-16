import { StudentShell } from "@workspace/ui";
import { ScoresPageShell } from "@/components/scores/scores-page-shell";

function toPositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function toKeyword(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

function toPassedFilter(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1" || raw === "0" ? raw : "";
}

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialFilters = {
    examTitle: toKeyword(params.keyword),
    passed: toPassedFilter(params.passed),
    pageNo: toPositivePage(params.page),
    pageSize: 10,
  } as const;

  return (
    <StudentShell>
      {/* 注入负边距以抵消外层壳的束缚感，实现全宽切面设计 */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-10 bg-background relative overflow-hidden">
         {/* 全站底噪纹理 */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
         <ScoresPageShell initialFilters={initialFilters} />
      </div>
    </StudentShell>
  );
}
