import Link from "next/link";
import { ArrowUpRight, ClipboardPenLine } from "lucide-react";
import type { HomeRecord } from "./home-types";
import { toText } from "@/lib/media";

export function HomeQuestionnairesSection({
  questionnaires,
  questionnaireError,
}: {
  questionnaires: HomeRecord[];
  questionnaireError: string | null;
}) {
  const visibleItems = questionnaires.slice(0, 6);

  return (
    <section className="flex flex-col">
      <div className="flex items-baseline justify-between border-b border-primary/20 pb-3 mb-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
          待处理工作
        </h3>
      </div>

      {questionnaireError && (
        <div className="py-2 text-sm text-destructive">{questionnaireError}</div>
      )}

      {visibleItems.length === 0 && !questionnaireError ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">当前队列清空</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleItems.map((item, index) => (
            <Link
              key={index}
              href={`/questionnaire/${String(item.id ?? "")}`}
              className="group flex flex-col gap-3 rounded-[1.25rem] border border-primary/20 bg-primary/[0.04] p-5 transition-colors hover:bg-primary/10 hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ClipboardPenLine className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="mt-1 line-clamp-2 text-sm font-bold leading-relaxed tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {toText(item.title ?? item.name, "问卷或任务")}
                  </h4>
                  <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary/80">
                    立即填写 <ArrowUpRight className="inline-block size-3 opacity-70" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
