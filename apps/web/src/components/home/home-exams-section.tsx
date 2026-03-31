import { MotionItem, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";
import { ArrowRight } from "lucide-react";

export function HomeExamsSection({
  exams,
  examError,
}: {
  exams: HomeRecord[];
  examError: string | null;
}) {
  const visibleExams = (exams.length ? exams : new Array(3).fill({})).slice(
    0,
    3
  );

  const getExamStateLabel = (state?: number) => {
    if (state === 3) return "已结束";
    if (state === 2) return "未开始";
    return "进行中";
  };

  return (
    <HomeSection
      eyebrow="考试安排"
      title="近期考试安排"
      subtitle="保留旧考试列表表现，但首页展示改成更清晰的考试提醒卡。"
      href="/exams"
    >
      <ErrorLine message={examError} />
      <MotionStagger className="flex flex-col gap-4" delayChildren={0.1}>
        {visibleExams.map((item, index) => (
          <MotionItem key={index}>
            <article className="group flex cursor-pointer flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-indigo-300 hover:shadow-md dark:bg-slate-900/75 dark:hover:border-indigo-400 dark:hover:shadow-md">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted dark:border-white/10 dark:bg-slate-800">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">
                      考试
                    </div>
                    <div className="text-xl font-extrabold text-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-extrabold text-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-600 dark:text-white">
                        {toText(item.title, `考试 ${index + 1}`)}
                      </h3>
                      <Badge>{getExamStateLabel(item.state)}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
                      <span>
                        考试时长{" "}
                        <strong className="font-extrabold text-foreground">
                          {String(item.totalTime ?? "--")} 分钟
                        </strong>
                      </span>
                      <span>
                        及格线{" "}
                        <strong className="font-extrabold text-foreground">
                          {String(item.qualifyScore ?? "--")} 分
                        </strong>
                      </span>
                      <span>
                        参考人数{" "}
                        <strong className="font-extrabold text-foreground">
                          {String(item.examNumber ?? 0)} 人
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-400 md:flex dark:bg-slate-800">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </article>
          </MotionItem>
        ))}
      </MotionStagger>
    </HomeSection>
  );
}
