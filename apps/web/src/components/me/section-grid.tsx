"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { ArrowUpRight, Hash } from "lucide-react";
import Link from "next/link";
import type { MeEntryGroup } from "@/core/me";

export const MeSectionGrid = ({ groups }: { groups: MeEntryGroup[] }) => {
  return (
    <div className="flex flex-col w-full gap-16" data-testid="me-section-grid">
      <MotionStagger delayChildren={0.05}>
        {groups.map((group, groupIndex) => {
          const Icon = group.icon;

          return (
            <MotionReveal
              key={group.id}
              direction="up"
              delay={groupIndex * 0.04}
              className="scroll-mt-[120px] transition-all"
            >
              <section
                id={group.id}
                className="flex flex-col border border-border/40 bg-background/50 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.02)] transition-shadow"
              >
                <div className="flex flex-col gap-4 p-10 border-b border-border/40 bg-muted/20 relative overflow-hidden group/header">
                  <div className="absolute right-0 top-0 p-8 opacity-5 group-hover/header:opacity-10 transition-opacity">
                    <Icon className="w-24 h-24 rotate-12" />
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="flex items-center justify-center w-8 h-8 bg-foreground text-background">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary/70">
                      SYS_PATH // {group.id.replace(/-/g, "_")}
                    </span>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-bold text-foreground tracking-tighter">
                      {group.title}
                    </h3>
                    <p className="text-xs text-muted-foreground/60 max-w-xl leading-relaxed font-medium">
                      {group.description}
                    </p>
                  </div>
                </div>

                <div className="p-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((item, idx) => (
                    <MotionItem key={item.title}>
                      <Link
                        href={item.href}
                        className="group relative flex flex-col p-6 border border-border/40 bg-background/40 hover:border-primary/50 hover:bg-muted/10 transition-all duration-150 overflow-hidden"
                      >
                        <div className="absolute -bottom-12 -right-12 p-3 opacity-5 group-hover:opacity-20 group-hover:rotate-45 transition-all">
                          <Hash className="size-24" />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                          <span className="text-[9px] font-mono font-black text-muted-foreground/30 group-hover:text-primary/60 transition-colors uppercase tracking-widest">
                            NODE_{group.id.slice(0, 3)}_
                            {idx.toString().padStart(2, "0")}
                          </span>
                          <div className="w-7 h-7 flex items-center justify-center border border-border/60 group-hover:bg-primary group-hover:border-primary transition-all">
                            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-all" />
                          </div>
                        </div>

                        <div className="space-y-1 group-hover:translate-x-1 transition-transform">
                          <h4 className="text-[0.95rem] font-bold text-foreground tracking-tight">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-medium">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    </MotionItem>
                  ))}
                </div>
              </section>
            </MotionReveal>
          );
        })}
      </MotionStagger>
    </div>
  );
};
