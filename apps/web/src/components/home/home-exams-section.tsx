import { MotionItem, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";
import { ArrowRight, Award, Clock3, Users } from "lucide-react";

export function HomeExamsSection({
  exams,
  examError,
}: {
  exams: HomeRecord[];
  examError: string | null;
}) {
  const visibleExams = (exams.length ? exams : new Array(3).fill({})).slice(0, 3);

  const getExamStateLabel = (state?: number) => {
    if (state === 3) return "已结束";
    if (state === 2) return "未开始";
    return "进行中";
  };

  return (
    <HomeSection
      eyebrow="Platform Streams"
      title="近期考试安排"
      subtitle="把考试组织成一条更像任务流的时间带，让用户直接看到接下来该关注什么，而不是先进入独立考试页。"
      href="/exams"
    >
      <ErrorLine message={examError} />
      <MotionStagger className="grid gap-4" delayChildren={0.1}>
        {visibleExams.map((item, index) => (
          <MotionItem key={index}>
            <article className="group grid gap-5 rounded-[1.4rem] border border-border/80 bg-card px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_48px_rgba(15,23,42,0.08)] md:grid-cols-[84px_minmax(0,1fr)_44px] md:items-center">
              <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-[1.3rem] border border-border/60 bg-muted">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Exam
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.06em] text-foreground">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[1.6rem] font-black tracking-[-0.04em] text-foreground transition-colors group-hover:text-primary">
                    {toText(item.title, `考试 ${index + 1}`)}
                  </h3>
                  <Badge className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary hover:bg-primary/10">
                    {getExamStateLabel(item.state)}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                    <Clock3 className="size-3.5 text-primary" />
                    考试时长
                    <strong className="font-extrabold text-foreground">
                      {String(item.totalTime ?? "--")} 分钟
                    </strong>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                    <Award className="size-3.5 text-primary" />
                    及格线
                    <strong className="font-extrabold text-foreground">
                      {String(item.qualifyScore ?? "--")} 分
                    </strong>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                    <Users className="size-3.5 text-primary" />
                    参考人数
                    <strong className="font-extrabold text-foreground">
                      {String(item.examNumber ?? 0)} 人
                    </strong>
                  </div>
                </div>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-muted text-muted-foreground transition-all group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary md:flex">
                <ArrowRight className="size-4" />
              </div>
            </article>
          </MotionItem>
        ))}
      </MotionStagger>
    </HomeSection>
  );
}
