import Link from "next/link";
import { webPrimaryNav } from "@workspace/shared";
import { Search } from "lucide-react";
import { AppLogo } from "../components/app-logo";
import { ThemeToggle } from "../components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/88 backdrop-blur-2xl dark:border-white/8 dark:bg-[rgba(2,6,23,0.82)]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <AppLogo compact />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-1 rounded-full border border-border/70 bg-card/70 p-1 md:flex md:max-w-fit md:backdrop-blur dark:border-white/10 dark:bg-white/5">
          {webPrimaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden h-11 min-w-64 items-center gap-3 rounded-[1rem] border border-border/70 bg-card/85 px-4 text-sm text-muted-foreground shadow-[0_10px_30px_rgba(15,23,42,0.05)] lg:flex dark:border-white/10 dark:bg-white/5">
            <Search className="size-4 text-muted-foreground" />
            <span className="flex-1">搜索课程、考试、公告...</span>
            <span className="rounded-md border border-border/70 bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5">
              ⌘K
            </span>
          </div>
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-[1rem] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_14px_30px_rgba(79,70,255,0.2)] transition hover:-translate-y-0.5 hover:bg-primary/90 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            登录
          </Link>
        </div>
      </div>
    </header>
  );
}
