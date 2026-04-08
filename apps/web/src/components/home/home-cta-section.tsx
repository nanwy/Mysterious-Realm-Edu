import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeCtaSection() {
  return (
    <section className="flex flex-col items-start gap-8 bg-muted/40 border border-border/40 rounded-3xl p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-16">
      <div className="max-w-2xl">
        <h2 className="text-3xl lg:text-4xl font-heading font-black tracking-tight text-foreground">
          主线已清晰，
          <br className="hidden sm:block" />
          立即开始推进当前任务。
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed md:text-base">
          平台首页专注于为你聚合最高优先级的学习主线与内容推荐。现在，进入个人工作区或者直接开始今日课程。
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
        <Link
          href="/courses"
          className="flex h-14 w-full lg:w-auto items-center justify-between gap-6 rounded-xl bg-foreground px-8 text-sm font-bold text-background transition-transform hover:scale-[0.98]"
        >
          继续课程 <ArrowRight className="size-4 opacity-70" />
        </Link>
        <Link
          href="/me"
          className="flex h-14 w-full lg:w-auto items-center justify-between gap-6 rounded-xl border border-border/60 bg-transparent px-8 text-sm font-bold text-foreground transition-colors hover:bg-muted"
        >
          个人档案 <ArrowRight className="size-4 opacity-50" />
        </Link>
      </div>
    </section>
  );
}
