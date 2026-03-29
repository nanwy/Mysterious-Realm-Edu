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
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f7fbff_0%,_#eef5ff_100%)] pb-24">
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-6">
        <section className="rounded-[30px] bg-[linear-gradient(135deg,_#0f172a,_#164e63)] px-5 py-6 text-white shadow-[0_24px_80px_rgba(8,47,73,0.3)]">
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200">Mobile Learning</p>
          <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
        </section>
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md items-center justify-around rounded-t-[28px] border border-white/80 bg-white/95 px-4 py-3 shadow-[0_-16px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        {mobileTabs.map((item) => (
          <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

