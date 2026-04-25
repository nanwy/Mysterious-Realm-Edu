import { MotionReveal } from "@workspace/motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { HomeRecord } from "./home-types";
import { toText } from "@/lib/media";

export function HomeExamsSection({
  exams,
  examError,
}: {
  exams: HomeRecord[];
  examError: string | null;
}) {
  const visibleExams = (exams.length ? exams : new Array(3).fill({})).slice(
    0,
    4
  );

  const getExamStateLabel = (state?: number) => {
    if (state === 3) return "CLOSED";
    if (state === 2) return "UPCOMING";
    return "PENDING";
  };

  return (
    <section className="flex flex-col bg-background">
      <div className="flex items-end justify-between px-6 py-6 lg:px-10 lg:py-8 border-b border-border/50 bg-background/50">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Exam Engine
          </span>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              考核引擎
            </h2>
            {examError && (
              <span className="text-[10px] text-destructive font-mono uppercase bg-destructive/10 px-2 py-0.5">
                {examError}
              </span>
            )}
          </div>
        </div>
        <Link
          href="/exams"
          className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center group mb-1"
        >
          列出全部{" "}
          <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>

      <MotionReveal direction="up">
        <div className="flex flex-col divide-y divide-border/50">
          {visibleExams.map((item, index) => (
            <Link
              key={index}
              href="/exams"
              className="flex flex-col sm:flex-row sm:items-center px-8 py-6 lg:px-12 lg:py-8 group hover:bg-muted/10 transition-colors duration-75 cursor-pointer"
            >
              <div className="w-25 text-xs font-mono text-muted-foreground/50 transition-all duration-100 group-hover:text-primary group-hover:translate-x-2 hidden sm:block">
                SYS_0{index + 1}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="text-[1.15rem] font-medium tracking-tight text-foreground transition-colors group-hover:text-primary truncate">
                  {toText(item.title, `周期性考核事务预备队列 ${index + 1}`)}
                </h3>
                <div className="mt-4 flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  <span
                    className={
                      item.state === 2
                        ? "text-primary flex items-center gap-1.5"
                        : "flex items-center gap-1.5"
                    }
                  >
                    {item.state === 2 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                    STATUS: {getExamStateLabel(item.state)}
                  </span>
                  <span>
                    DURATION:{" "}
                    <span className="font-mono text-foreground ml-1">
                      {String(item.totalTime ?? "45")}m
                    </span>
                  </span>
                  <span className="hidden md:inline">
                    POOL:{" "}
                    <span className="font-mono text-foreground ml-1">
                      {String(item.examNumber ?? "--")}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center p-2 rounded border border-transparent group-hover:border-border/50 group-hover:bg-background transition-all hidden sm:flex">
                <ArrowUpRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </MotionReveal>
    </section>
  );
}
