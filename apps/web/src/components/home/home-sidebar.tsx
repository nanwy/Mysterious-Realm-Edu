import Link from "next/link";
import type { HomeRecord } from "./home-types";
import { toText } from "@/lib/media";

export function HomeSidebar({
  announcements,
  announcementError,
  examCount,
}: {
  announcements: HomeRecord[];
  announcementError: string | null;
  examCount: number;
}) {
  const visibleAnnouncements = (
    announcements.length
      ? announcements
      : [{ titile: "教务信号连接同步预备中..." }]
  ).slice(0, 4);

  return (
    <>
      <section className="flex flex-col flex-1 bg-background/50">
        <div className="px-8 py-6 border-b border-border/50 bg-background flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> 
              Dashboard
            </span>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">数据罗盘</h3>
          </div>
        </div>
        <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-border/50">
          <div className="flex-1 p-8 lg:p-10 hover:bg-muted/10 transition-colors cursor-default">
            <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">学习进度</div>
            <div className="text-4xl lg:text-5xl font-semibold tracking-tighter text-foreground font-mono">
              84<span className="text-lg text-muted-foreground">%</span>
            </div>
          </div>
          <div className="flex-1 p-8 lg:p-10 hover:bg-muted/10 transition-colors cursor-default">
            <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">待办考试</div>
            <div className="text-4xl lg:text-5xl font-semibold tracking-tighter text-foreground font-mono">
              {examCount || 6}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col bg-background/50">
        <div className="px-8 py-6 border-b border-border/50 bg-background flex items-center">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">Radio</span>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">教务广播</h3>
          </div>
        </div>
        <div className="flex flex-col p-8 lg:p-10 gap-8">
          {announcementError && <p className="text-[10px] font-mono text-destructive uppercase bg-destructive/10 px-2 py-1 mb-2">{announcementError}</p>}
          {visibleAnnouncements.map((item, index) => (
            <div key={index} className="group cursor-pointer">
              <span className="text-[10px] font-mono text-muted-foreground block mb-2 opacity-50">#_ANNOUNCE_{String(index).padStart(2, '0')}</span>
              <p className="text-[0.95rem] font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors line-clamp-2">
                {toText(item.titile ?? item.title, "系统服务连线请求中，通道保留状态...")}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="flex flex-col bg-background/50">
        <div className="px-8 py-6 border-b border-border/50 bg-background flex items-center">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">Shortcuts</span>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">快速穿梭</h3>
          </div>
        </div>
        <div className="flex flex-col divide-y divide-border/50">
          {[
            { label: "在线练习 / PRACTICE", href: "/practice" },
            { label: "考务大厅 / EXAMS", href: "/exams" },
            { label: "控制中心 / PROFILE", href: "/me" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="px-8 py-6 lg:py-8 text-[0.95rem] font-medium hover:bg-muted/10 hover:text-primary transition-colors flex justify-between items-center group">
              <span className="text-sm uppercase tracking-widest">{item.label}</span>
              <span className="text-muted-foreground/30 group-hover:text-primary transition-colors font-mono tracking-widest">{'//'} GO</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
