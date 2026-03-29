import Link from "next/link";
import { MotionItem, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";

export function HomeCoursesSection({
  courses,
  courseError,
}: {
  courses: HomeRecord[];
  courseError: string | null;
}) {
  const visibleCourses = (
    courses.length ? courses : new Array(4).fill({})
  ).slice(0, 4);

  return (
    <HomeSection
      eyebrow="Popular Courses"
      title="热门课程"
      subtitle="保持旧系统课程数据源，但用更清晰的双列课程卡组织首批学习入口。"
      href="/courses"
    >
      <ErrorLine message={courseError} />
      <MotionStagger className="grid gap-5 md:grid-cols-2" delayChildren={0.1}>
        {visibleCourses.map((item, index) => (
          <MotionItem key={index}>
            <article className="group overflow-hidden rounded-[30px] border border-white/80 bg-white/85 shadow-[0_20px_48px_rgba(37,99,235,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(37,99,235,0.14)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_20px_48px_rgba(2,6,23,0.32)] dark:hover:shadow-[0_28px_60px_rgba(2,6,23,0.4)]">
              <div className="relative overflow-hidden bg-[linear-gradient(135deg,#dbeafe,#eff6ff_55%,#e0f2fe)] dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.96)_55%,rgba(8,47,73,0.72))]">
                {resolveMediaUrl(String(item.cover ?? "")) ? (
                  <img
                    src={resolveMediaUrl(String(item.cover)) ?? ""}
                    alt={toText(item.name, `课程 ${index + 1}`)}
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex aspect-4/3 items-end p-5">
                    <div className="rounded-2xl bg-white/75 px-4 py-3 backdrop-blur dark:bg-slate-950/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                        Course
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        课程封面待接入
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute left-4 top-4">
                  <Badge>
                    {toText(item.state_dictText, "课程")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="space-y-2">
                  <h3 className="line-clamp-2 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                    {toText(item.name, `热门课程 ${index + 1}`)}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {String(item.learnerNumber ?? 0)} 人学习
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-white/5">
                  <span className="text-slate-500 dark:text-slate-400">
                    价格
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.isFree ? "免费" : `￥${String(item.price ?? "--")}`}
                  </span>
                </div>

                <Link
                  href={`/courses/${String(item.id ?? "")}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                >
                  进入学习
                  <span className="text-xs uppercase tracking-[0.2em] text-sky-500">
                    Start
                  </span>
                </Link>
              </div>
            </article>
          </MotionItem>
        ))}
      </MotionStagger>
    </HomeSection>
  );
}
