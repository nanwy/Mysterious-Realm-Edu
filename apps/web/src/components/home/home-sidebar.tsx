import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
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
      : [{ titile: "接口可用后会在这里展示教务通知与首页公告。" }]
  ).slice(0, 2);

  return (
    <MotionReveal className="grid gap-4" direction="left">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/78">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-sky-300">
              教务动态
            </p>
            <h2 className="text-lg font-extrabold text-foreground">
              教务通知
            </h2>
          </div>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:border-sky-500/20 dark:bg-sky-500/12 dark:text-sky-300">
            实时
          </span>
        </div>
        <div className="mt-4">
          <ErrorLine message={announcementError} />
        </div>
        <div className="mt-4 grid gap-3">
          {visibleAnnouncements.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/60 bg-muted px-4 py-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-foreground/80 dark:text-slate-200">
                  {toText(item.titile ?? item.title, `通知 ${index + 1}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(8,17,33,0.92))]">
          <p className="text-xs font-bold text-muted-foreground">
            学习进度
          </p>
          <p className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">
            84%
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted dark:bg-white/10">
            <div className="h-full w-[84%] rounded-full bg-indigo-600" />
          </div>
        </div>
        <div className="rounded-2xl bg-indigo-600 p-5 text-white shadow-md shadow-indigo-600/20 dark:bg-[linear-gradient(160deg,#2563eb_0%,#1d4ed8_100%)]">
          <p className="text-xs font-bold text-indigo-100">
            近期考试
          </p>
          <p className="mt-4 text-4xl font-extrabold tracking-tight">
            {examCount || 6}
          </p>
          <p className="mt-2 text-[10px] font-bold text-indigo-200">待关注场次</p>
        </div>
      </div>

      <MotionStagger className="grid gap-4 sm:grid-cols-3" delayChildren={0.1}>
        {[
          { label: "在线练习", href: "/practice", note: "题库训练" },
          { label: "在线考试", href: "/exams", note: "考试入口" },
          { label: "个人中心", href: "/me", note: "学习档案" },
        ].map((item) => (
          <MotionItem key={item.label}>
            <Link
              href={item.href}
              className="group block rounded-xl border border-border bg-card p-3 text-center shadow-sm transition hover:bg-muted dark:border-white/10 dark:bg-slate-900/75"
            >
              <p className="text-sm font-extrabold text-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-[10px] font-bold text-muted-foreground">{item.note}</p>
            </Link>
          </MotionItem>
        ))}
      </MotionStagger>
    </MotionReveal>
  );
}
