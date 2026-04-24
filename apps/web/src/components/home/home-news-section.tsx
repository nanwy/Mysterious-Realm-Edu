import { ArrowUpRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import type { HomeRecord } from "./home-types";
import { resolveMediaUrl, toText } from "@/lib/media";

export function HomeNewsSection({
  recommendedNews,
  recommendedNewsError,
}: {
  recommendedNews: HomeRecord[];
  recommendedNewsError: string | null;
}) {
  const visibleNews = recommendedNews.slice(0, 4);

  return (
    <section className="flex flex-col py-2">
      <div className="flex items-end justify-between border-b border-border/40 pb-8 mb-10 group/header">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Content Stream
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            资讯推荐流
          </h2>
        </div>
        <Link
          href="/news"
          className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center mb-1"
        >
          查看更多{" "}
          <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 opacity-50 transition-transform group-hover/header:translate-x-0.5 group-hover/header:-translate-y-0.5" />
        </Link>
      </div>

      {recommendedNewsError && (
        <div className="text-[10px] font-mono text-destructive uppercase bg-destructive/10 px-2 py-1 mb-6 inline-block">
          {recommendedNewsError}
        </div>
      )}

      {visibleNews.length === 0 && !recommendedNewsError ? (
        <div className="py-20 flex flex-col items-center justify-center text-center border-t border-b border-border/40 border-dashed">
          <p className="text-base font-medium tracking-tight text-foreground">
            资讯流待更新
          </p>
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mt-3">
            WAITING_FOR_CONTENT
          </p>
        </div>
      ) : (
        <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {visibleNews.map((news, index) => {
            const coverUrl = resolveMediaUrl(String(news.cover ?? ""));
            return (
              <Link
                key={index}
                href={`/news/${String(news.id ?? "")}`}
                className="group flex flex-col gap-6"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted/20 border border-border/50">
                  {coverUrl ? (
                    <>
                      <img
                        src={coverUrl}
                        alt={toText(news.title, `资讯 ${index + 1}`)}
                        className="object-cover w-full h-full transition-transform duration-[1000ms] ease-out group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.06)_2px,rgba(0,0,0,0.06)_4px)] dark:bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)] pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="flex flex-col bg-background/50 items-center justify-center h-full w-full text-muted-foreground/30">
                      <ImageIcon className="w-6 h-6 mb-2" />
                      <span className="text-[10px] uppercase font-mono tracking-widest">
                        NO_MEDIA
                      </span>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-background/90 backdrop-blur px-3 py-1.5 border-r border-b border-border/50 text-[10px] font-mono text-foreground font-bold">
                    #{String(index + 1).padStart(2, "0")}
                  </div>
                </div>
                <div>
                  <h3 className="line-clamp-2 text-base font-medium tracking-tight leading-relaxed text-foreground transition-colors group-hover:text-primary">
                    {toText(news.title, "系统预备推流内容加载中...")}
                  </h3>
                  <div className="mt-4 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    <span>
                      {toText(news.publishTime ?? news.time, "00:00:00")}
                    </span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
