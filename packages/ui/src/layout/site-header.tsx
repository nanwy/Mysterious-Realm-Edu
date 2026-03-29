import Link from "next/link";
import { webPrimaryNav } from "@workspace/shared";
import { AppLogo } from "../components/app-logo";
import { ThemeToggle } from "../components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-[rgba(245,250,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(2,6,23,0.8)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <AppLogo />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {webPrimaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-sky-500 dark:hover:text-sky-300"
          >
            登录
          </Link>
        </div>
      </div>
    </header>
  );
}
