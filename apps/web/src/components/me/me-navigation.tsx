import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MotionItem, MotionStagger } from "@workspace/motion";
import type { MeEntryGroup } from "./me-data";

export function MeNavigation({ groups }: { groups: MeEntryGroup[] }) {
  return (
    <nav
      aria-label="个人中心导航"
      className="grid gap-2"
      data-testid="me-navigation"
    >
      <MotionStagger className="grid gap-2.5" delayChildren={0.04}>
        {groups.map((group) => {
          const Icon = group.icon;
          const previewItems = group.items.slice(0, 2);

          return (
            <MotionItem key={group.id}>
              <Link
                href={`#${group.id}`}
                className="group flex flex-col gap-3 rounded-[1.15rem] border border-border/70 bg-background/80 px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-accent/45 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 rounded-[0.95rem] border border-border/70 bg-muted/70 p-2.5 text-foreground transition group-hover:border-primary/30 group-hover:text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.95rem] font-black tracking-[-0.03em] text-foreground">
                        {group.title}
                      </span>
                      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                        {group.items.length} 个入口
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                </span>
                <span className="line-clamp-2 block text-[13px] leading-6 text-muted-foreground">
                  {group.description}
                </span>
                <span className="flex flex-wrap gap-2">
                  {previewItems.map((item) => (
                    <span
                      key={item.href}
                      className="rounded-full border border-border/70 bg-muted/65 px-2.5 py-1 text-[11px] font-medium tracking-[-0.01em] text-foreground/80"
                    >
                      {item.title}
                    </span>
                  ))}
                </span>
                <span className="text-[12px] font-semibold tracking-[-0.01em] text-muted-foreground transition group-hover:text-foreground">
                  进入 {group.title}
                </span>
              </Link>
            </MotionItem>
          );
        })}
      </MotionStagger>
    </nav>
  );
}
