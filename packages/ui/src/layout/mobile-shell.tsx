import type { ReactNode } from "react";
import Link from "next/link";
import { mobileTabs } from "@workspace/shared";

export function MobileShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--background)_0%,var(--muted)_100%)] pb-24">
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-6">
        <section className="rounded-[30px] border border-border/70 bg-[linear-gradient(135deg,var(--card),var(--accent))] px-5 py-6 shadow-[0_24px_80px_rgba(8,47,73,0.18)]">
          <p className="text-primary text-xs uppercase tracking-[0.26em]">Mobile Learning</p>
          <h1 className="text-foreground mt-3 text-3xl font-semibold">{title}</h1>
        </section>
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md items-center justify-around rounded-t-[28px] border border-border/80 bg-card/95 px-4 py-3 shadow-[0_-16px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        {mobileTabs.map((item) => (
          <Link key={item.href} href={item.href} className="text-muted-foreground text-sm font-medium">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
