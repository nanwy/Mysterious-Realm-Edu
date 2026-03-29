import { MotionItem, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";

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
      eyebrow="Survey"
      title="问卷调查"
      subtitle="保留旧首页问卷入口，用更轻的清单和状态标签来承接调查任务。"
      href="/questionnaire"
    >
      <ErrorLine message={questionnaireError} />
      <MotionStagger className="grid gap-4" delayChildren={0.1}>
        {visibleQuestionnaires.map((item, index) => (
          <MotionItem key={index}>
            <article className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_42px_rgba(37,99,235,0.06)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_42px_rgba(2,6,23,0.3)]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                  {toText(item.name, `问卷 ${index + 1}`)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {String(item.questionNum ?? 0)} 题 · {String(item.answerNum ?? 0)} 份答卷
                </p>
              </div>
              <Badge>
                {toText(item.type_dictText, "调查")}
              </Badge>
            </div>
            {typeof item.answerAddress === "string" && item.answerAddress ? (
              <a
                href={item.answerAddress}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-300"
              >
                去填写
                <span className="text-xs uppercase tracking-[0.2em] text-sky-500">
                  Form
                </span>
              </a>
            ) : null}
            </article>
          </MotionItem>
        ))}
      </MotionStagger>
    </HomeSection>
  );
}
