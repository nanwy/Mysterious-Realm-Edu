import Link from "next/link";
import { MotionReveal } from "@workspace/motion";

export function HomeCtaSection() {
  return (
    <MotionReveal direction="up">
      <section className="overflow-hidden rounded-[2.5rem] border border-indigo-500 bg-indigo-600 px-6 py-12 text-center text-white shadow-xl shadow-indigo-600/20 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(8,17,33,0.96))] dark:shadow-[0_28px_70px_rgba(2,6,23,0.35)] sm:px-10 sm:py-16">
        <p className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-widest text-white/90 backdrop-blur-sm dark:text-sky-300">
          继续学习
        </p>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white dark:text-white sm:text-4xl">
          准备开始今天的学习任务了吗？
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-indigo-100 dark:text-muted-foreground">
          现在就进入课程中心继续学习，或直接查看近期考试安排，让首页真正承担起学习平台的统一入口。
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-full bg-card px-8 py-4 text-sm font-extrabold text-indigo-600 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-muted dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            进入课程中心
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-indigo-500 bg-indigo-700 px-8 py-4 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-800 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-sky-500 dark:hover:text-sky-300"
          >
            登录并继续
          </Link>
        </div>
      </section>
    </MotionReveal>
  );
}
