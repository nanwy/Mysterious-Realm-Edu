import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";

interface StudentShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const StudentShell = ({
  children,
  title,
  description,
}: StudentShellProps) => {
  const hasHeading = title || description;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--accent),transparent_30%),linear-gradient(180deg,var(--background)_0%,var(--muted)_100%)]">
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {hasHeading ? (
          <header className="grid max-w-3xl gap-3">
            {title ? (
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="text-base leading-7 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </header>
        ) : null}
        {children}
      </main>
    </div>
  );
};
