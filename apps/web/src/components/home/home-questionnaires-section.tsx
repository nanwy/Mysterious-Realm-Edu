import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { HomeRecord } from "./home-types";
import { toText } from "@/lib/media";

export function HomeQuestionnairesSection({
  questionnaires,
  questionnaireError,
}: {
  questionnaires: HomeRecord[];
  questionnaireError: string | null;
}) {
  const visibleItems = questionnaires.slice(0, 4);

  return (
    <section className="flex flex-col bg-background/50">
      <div className="px-8 py-6 border-b border-border/50 bg-background flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">Ticketing Task</span>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">待办工单队列</h3>
        </div>
        {questionnaireError && (
          <span className="text-[10px] font-mono text-destructive uppercase bg-destructive/10 px-2 py-0.5">
            {questionnaireError}
          </span>
        )}
      </div>

      <div className="flex flex-col p-8 lg:p-10 gap-8">
        {visibleItems.length === 0 && !questionnaireError ? (
          <div className="py-6 flex justify-center">
            <span className="text-[10px] font-mono text-muted-foreground opacity-50 uppercase tracking-widest">
              QUEUE_EMPTY
            </span>
          </div>
        ) : (
          visibleItems.map((item, index) => (
            <Link
              key={index}
              href={`/questionnaire/${String(item.id ?? "")}`}
              className="group cursor-pointer block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-primary opacity-80 uppercase tracking-widest">
                  ## TICKET_{String(index).padStart(2, "0")}
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300" />
              </div>
              <p className="text-[0.95rem] font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors line-clamp-2">
                {toText(item.title ?? item.name, "工单同步预备中...")}
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
