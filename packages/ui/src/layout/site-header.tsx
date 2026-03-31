import Link from "next/link";
import { webPrimaryNav } from "@workspace/shared";
import { AppLogo } from "../components/app-logo";
import { ThemeToggle } from "../components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(2,6,23,0.82)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <AppLogo compact />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-7 md:flex">
          {webPrimaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-1 py-1 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-slate-700 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden h-11 min-w-52 items-center rounded-full border border-border bg-card px-4 text-sm text-muted-foreground shadow-[0_8px_24px_rgba(148,163,184,0.12)] lg:flex dark:border-white/10 dark:bg-slate-900/70">
            搜索课程、考试或公告...
          </div>
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(91,75,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#4c3cff] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            登录
          </Link>
        </div>
      </div>
    </header>
  );
}
