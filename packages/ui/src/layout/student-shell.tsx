import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";

export function StudentShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--accent),transparent_30%),linear-gradient(180deg,var(--background)_0%,var(--muted)_100%)]">
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
