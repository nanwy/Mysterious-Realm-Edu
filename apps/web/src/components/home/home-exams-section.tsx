import { MotionItem, MotionStagger } from "@workspace/motion";
import { Badge, Card, CardContent } from "@workspace/ui";
import { toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";

export function HomeExamsSection({
  exams,
  examError,
}: {
  exams: HomeRecord[];
  examError: string | null;
}) {
  const visibleExams = (exams.length ? exams : new Array(3).fill({})).slice(0, 3);

  const getExamBadgeVariant = (state?: number) => {
    if (state === 3) {
      return "neutral" as const;
    }

    if (state === 2) {
      return "warning" as const;
    }

    return "success" as const;
  };

  return (
    <HomeSection
      eyebrow="Latest Exams"
      title="考试快讯"
      subtitle="把考试信息压缩成更稳的三张信息卡，突出状态、时长、分数线和参与人数。"
      href="/exams"
    >
      <ErrorLine message={examError} />
      <MotionStagger className="grid gap-4 xl:grid-cols-3" delayChildren={0.1}>
        {visibleExams.map((item, index) => (
          <MotionItem key={index}>
            <Card className="rounded-[30px] border-white/80 bg-white/85 shadow-[0_18px_48px_rgba(37,99,235,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(37,99,235,0.12)] dark:border-white/8 dark:bg-slate-900/72 dark:shadow-[0_18px_48px_rgba(2,6,23,0.32)] dark:hover:shadow-[0_24px_56px_rgba(2,6,23,0.42)]">
            <CardContent className="space-y-5 p-6">
              <div className="flex min-h-22 items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                    EXAM {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                    {toText(item.title, `考试 ${index + 1}`)}
                  </h3>
                </div>
                <Badge
                  variant={getExamBadgeVariant(item.state)}
                >
                  {item.state === 3 ? "已结束" : item.state === 2 ? "未开始" : "进行中"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "时长", value: `${String(item.totalTime ?? "--")} min` },
                  { label: "及格", value: `${String(item.qualifyScore ?? "--")} 分` },
                  { label: "人数", value: String(item.examNumber ?? 0) },
                ].map((meta) => (
                  <div
                    key={meta.label}
                    className="flex min-h-24 flex-col justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/6"
                  >
                    <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {meta.label}
                    </p>
                    <p className="text-xl font-semibold leading-tight text-slate-900 dark:text-white">
                      {meta.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            </Card>
          </MotionItem>
        ))}
      </MotionStagger>
    </HomeSection>
  );
}
