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
      eyebrow="问卷任务"
      title="问卷与调研"
      subtitle="保留首页问卷承接能力，改成更适合底部区域的横向任务卡。"
      href="/questionnaire"
      compact
    >
      <ErrorLine message={questionnaireError} />
      <MotionStagger
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        delayChildren={0.1}
      >
        {visibleQuestionnaires.map((item, index) => (
          <MotionItem key={index}>
            <article className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:bg-slate-900/75 dark:hover:border-indigo-00 dark:hover:shadow-md">
              <div className="flex min-w-0 items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ClipboardList className="size-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-extrabold text-foreground dark:text-white dark:group-hover:text-indigo-400">
                    {toText(item.name, `问卷 ${index + 1}`)}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-muted-foreground">
                    {String(item.questionNum ?? 0)} 题 ·{" "}
                    {String(item.answerNum ?? 0)} 份答卷
                  </p>
                </div>
              </div>
              <Badge className="bg-muted text-muted-foreground hover:bg-muted dark:bg-sky-500/15 dark:text-sky-300">
                {toText(item.type_dictText, "调查")}
              </Badge>
            </article>
          </MotionItem>
        ))}
      </MotionStagger>
    </HomeSection>
  );
}
