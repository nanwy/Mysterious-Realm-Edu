import { MotionItem, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";
import { ClipboardList } from "lucide-react";

export function HomeQuestionnairesSection({
  questionnaires,
  questionnaireError,
}: {
  questionnaires: HomeRecord[];
  questionnaireError: string | null;
}) {
  const visibleQuestionnaires = (
    questionnaires.length ? questionnaires : new Array(4).fill({})
  ).slice(0, 4);

  return (
    <HomeSection
      eyebrow="Task Queue"
      title="待处理问卷"
      subtitle="把问卷压缩成一个更轻的任务队列，放在侧栏信号层里，只在需要时打断用户。"
      href="/questionnaire"
      compact
    >
      <ErrorLine message={questionnaireError} />
      <MotionStagger
        className="grid gap-3"
        delayChildren={0.1}
      >
        {visibleQuestionnaires.map((item, index) => (
          <MotionItem key={index}>
            <article className="group flex cursor-pointer items-center justify-between gap-4 rounded-[1rem] border border-border/80 bg-card px-4 py-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_14px_30px_rgba(15,23,42,0.07)] dark:bg-slate-900/75 dark:hover:shadow-md">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <ClipboardList className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Task {index + 1}
                  </div>
                  <h3 className="mt-1 truncate text-sm font-extrabold text-foreground dark:text-white dark:group-hover:text-indigo-400">
                    {toText(item.name, `问卷 ${index + 1}`)}
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                    {String(item.questionNum ?? 0)} 题 ·{" "}
                    {String(item.answerNum ?? 0)} 份答卷
                  </p>
                </div>
              </div>
              <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted dark:bg-sky-500/15 dark:text-sky-300">
                {toText(item.type_dictText, "调查")}
              </Badge>
            </article>
          </MotionItem>
        ))}
      </MotionStagger>
    </HomeSection>
  );
}
