import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { HomeRecord } from "./home-types";
import { toText } from "@/lib/media";

export function HomeHotNewsSection({
  hotNews,
  hotNewsError,
}: {
  hotNews: HomeRecord[];
  hotNewsError: string | null;
}) {
  const visibleItems = hotNews.slice(0, 5);

  return (
    <section className="flex flex-col bg-background/50">
      <div className="px-8 py-6 border-b border-border/50 bg-background flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
            Broadcast
          </span>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            全站简讯快报
          </h3>
        </div>
        {hotNewsError && (
          <span className="text-[10px] font-mono text-destructive uppercase bg-destructive/10 px-2 py-0.5">
            {hotNewsError}
          </span>
        )}
      </div>

      <div className="flex flex-col divide-y divide-border/50">
        {visibleItems.length === 0 && !hotNewsError ? (
          <div className="p-8 lg:p-10 flex justify-center">
            <span className="text-[10px] font-mono text-muted-foreground opacity-50 uppercase tracking-widest">
              WAITING_BROADCAST
            </span>
          </div>
        ) : (
          visibleItems.map((item, index) => (
            <Link
              key={index}
              href={`/news/${String(item.id ?? "")}`}
              className="flex flex-col px-8 lg:px-10 py-6 lg:py-8 group hover:bg-muted/10 transition-colors cursor-pointer"
            >
              <p className="text-[0.95rem] font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors line-clamp-2">
                {toText(item.title, "速报同步预备中...")}
              </p>
              <div className="mt-4 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-muted-foreground/50">
                <span>{toText(item.publishTime ?? item.time, "00:00:00")}</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300" />
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
