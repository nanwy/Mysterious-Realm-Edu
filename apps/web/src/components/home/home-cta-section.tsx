import Link from "next/link";
import { MotionReveal } from "@workspace/motion";
import { ArrowRight } from "lucide-react";

export function HomeCtaSection() {
  return (
    <MotionReveal direction="up">
      <section className="overflow-hidden rounded-[1.8rem] border border-border/80 bg-[linear-gradient(180deg,#0e1630_0%,#121a3a_100%)] text-white shadow-[0_28px_80px_rgba(15,23,42,0.26)]">
        <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12 lg:px-10 lg:py-10">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-300/90">
              Return Loop
            </div>
            <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.06em] text-white">
              今天的主线已经排好，
              <br />
              现在回到真正的任务。
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 md:text-base">
              平台首页负责聚焦重点，不负责占用你的时间。继续课程、查看考试，或者回到自己的学习档案。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px] lg:grid-cols-1">
            <Link
              href="/courses"
              className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white px-5 py-4 text-sm font-extrabold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-slate-100"
            >
              继续课程
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/exams"
              className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-5 py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/12"
            >
              查看考试安排
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/18 px-5 py-4 text-sm font-bold text-sky-200 transition-all hover:-translate-y-0.5 hover:bg-primary/24"
            >
              登录并继续
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </MotionReveal>
  );
}
