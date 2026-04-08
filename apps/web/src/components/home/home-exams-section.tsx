import Link from "next/link";
import { ArrowUpRight, ArrowRight, CalendarClock, ClipboardList } from "lucide-react";
import { MotionItem, MotionStagger } from "@workspace/motion";
import type { HomeRecord } from "./home-types";
import { toText } from "@/lib/media";

export function HomeExamsSection({
  exams,
  examError,
}: {
  exams: HomeRecord[];
  examError: string | null;
}) {
  const visibleExams = exams.slice(0, 6); // API max is 6

  return (
    <section className="flex flex-col">
      <div className="flex items-baseline justify-between border-b border-border/40 pb-5 mb-8">
        <h2 className="text-2xl font-heading font-black tracking-tight text-foreground">
          近期考试
        </h2>
        <Link href="/exams" className="group flex items-center text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors">
          更多安排
          <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {examError && (
        <div className="py-4 text-sm text-destructive">{examError}</div>
      )}

      {visibleExams.length === 0 && !examError ? (
        <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl bg-muted/20 border border-border/30">
          <p className="text-sm font-semibold text-foreground">暂无考试安排</p>
          <p className="text-xs text-muted-foreground mt-1">目前没有需要立即处理的考试场次</p>
        </div>
      ) : (
        <MotionStagger className="grid gap-4" delayChildren={0.05}>
          {visibleExams.map((exam, index) => (
            <MotionItem key={index}>
              <Link
                href={`/exams/${String(exam.id ?? "")}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[1.25rem] border border-border/40 bg-card/40 p-5 transition-all hover:bg-muted/40 hover:border-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ClipboardList className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-[1.05rem] font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {toText(exam.name ?? exam.title, "未命名考试")}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <CalendarClock className="size-3.5 opacity-70" />
                      <span>{toText(exam.startTime ?? exam.time, "时间待定")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-[11px] font-bold uppercase tracking-widest text-primary/80 transition-colors group-hover:text-primary">
                  进入考场 <ArrowUpRight className="ml-1 size-3.5 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
              </Link>
            </MotionItem>
          ))}
        </MotionStagger>
      )}
    </section>
  );
}
