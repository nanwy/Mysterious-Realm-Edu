import Link from "next/link";
import { MotionItem, MotionStagger } from "@workspace/motion";
import type { MeEntryGroup } from "./me-data";

export function MeNavigation({ groups }: { groups: MeEntryGroup[] }) {
  return (
    <nav aria-label="个人中心导航" className="grid gap-3" data-testid="me-navigation">
      <MotionStagger className="grid gap-3" delayChildren={0.04}>
        {groups.map((group) => {
          const Icon = group.icon;

          return (
            <MotionItem key={group.id}>
              <Link
                href={`#${group.id}`}
                className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 transition hover:border-primary/40 hover:bg-accent/60"
              >
                <span className="mt-0.5 rounded-xl border border-border/70 bg-muted/70 p-2 text-foreground transition group-hover:border-primary/30 group-hover:text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{group.title}</span>
                  <span className="mt-1 block text-xs leading-6 text-muted-foreground">
                    {group.items.map((item) => item.title).join(" / ")}
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
