import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Card, CardContent } from "@workspace/ui";
import { toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine } from "./home-section-heading";

export function HomeSidebar({
  announcements,
  announcementError,
  examCount,
}: {
  announcements: HomeRecord[];
  announcementError: string | null;
  examCount: number;
}) {
  const visibleAnnouncements = (
    announcements.length
      ? announcements
      : [{ titile: "接口可用后会在这里展示首页公告。" }]
  ).slice(0, 4);

  return (
    <MotionReveal className="grid gap-5" direction="left">
      <Card className="rounded-[32px] border-white/70 bg-white/84 shadow-[0_26px_60px_rgba(59,130,246,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_26px_60px_rgba(2,6,23,0.35)]">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                公告动态
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                今日通知
              </h2>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              Live
            </span>
          </div>
          <ErrorLine message={announcementError} />
          <div className="grid gap-3">
            {visibleAnnouncements.map((item, index) => (
              <div
                key={index}
                className="rounded-[22px] border border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                    {toText(item.titile ?? item.title, `公告 ${index + 1}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <MotionStagger className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1" delayChildren={0.1}>
        {[
          { label: "在线练习", href: "/practice", note: "题库训练" },
          { label: "在线考试", href: "/exams", note: "考试入口" },
          { label: "个人中心", href: "/me", note: "学习档案" },
        ].map((item) => (
          <MotionItem key={item.label}>
            <Link
              href={item.href}
              className="group block rounded-[26px] border border-white/80 bg-white/85 p-5 shadow-[0_14px_36px_rgba(37,99,235,0.08)] transition hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_14px_36px_rgba(2,6,23,0.3)]"
            >
              <p className="text-base font-semibold text-slate-900 dark:text-white">{item.label}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.note}</p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-sky-600 transition group-hover:translate-x-1">
                Open
              </p>
            </Link>
          </MotionItem>
        ))}
      </MotionStagger>

      <MotionStagger className="grid gap-4 sm:grid-cols-2" delayChildren={0.18}>
        <MotionItem>
          <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#ffffff,#eef6ff)] p-5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(8,17,33,0.9))]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              学习进程
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
              84%
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">本周学习任务完成度示意</p>
          </div>
        </MotionItem>
        <MotionItem>
          <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#ffffff,#f2f7ff)] p-5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(8,17,33,0.9))]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              考试提醒
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
              {examCount || 6}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">待关注考试场次</p>
          </div>
        </MotionItem>
      </MotionStagger>
    </MotionReveal>
  );
}
