import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MotionItem, MotionStagger } from "@workspace/motion";
import type { MeEntryGroup } from "./me-data";

export function MeNavigation({ groups }: { groups: MeEntryGroup[] }) {
  return (
    <nav
      aria-label="个人中心导航"
      className="rounded-[30px] border border-border/70 bg-muted/20 p-2.5"
      data-testid="me-navigation"
    >
      <MotionStagger className="grid gap-1.5" delayChildren={0.04}>
        {groups.map((group, index) => {
          const Icon = group.icon;

          return (
            <MotionItem key={group.id}>
              <Link
                href={`#${group.id}`}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-[24px] border border-transparent px-3 py-3 transition duration-300 hover:border-border/80 hover:bg-background/90 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus-visible:border-primary/40 focus-visible:bg-background/95"
              >
                <span className="mt-0.5 flex size-11 items-center justify-center rounded-[18px] border border-border/70 bg-background text-foreground transition group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 space-y-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                      {group.title}
                    </span>
                  </span>
                  <span className="block text-xs leading-6 text-muted-foreground">
                    {group.items.map((item) => item.title).join(" / ")}
                  </span>
                </span>
                <span className="mt-1 flex flex-col items-end gap-2 text-right">
                  <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground">
                    {group.items.length} 项
                  </span>
                  <span className="text-muted-foreground transition group-hover:text-foreground">
                    <ArrowUpRight className="size-4" />
                  </span>
                </span>
              </Link>
            </MotionItem>
          );
        })}
      </MotionStagger>
    </nav>
  );
}
