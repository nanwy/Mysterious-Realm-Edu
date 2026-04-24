"use client";

import {
  ArrowUpRight,
  Bell,
  BookMarked,
  Clock,
  CreditCard,
  Settings2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ME_ENTRY_GROUPS, ME_OVERVIEW_STATS } from "./me-data";
import { MeSectionGrid } from "./me-section-grid";

// === 增强的数据补全 Mock ===
const MOCK_ONGOING_ITEMS = [
  {
    id: "1",
    name: "高级网络安全攻防实战与 AWD 战术详解",
    progress: 68,
    type: "COURSE",
    tag: "MOST_ACTIVE",
    lastStudy: "12 分钟前",
  },
  {
    id: "2",
    name: "2026年春季 AWD 防御结业水平资格考试",
    time: "今天 14:00 - 16:00",
    type: "EXAM",
    tag: "URGENT",
    desc: "由于系统维护，请提前 15 分钟下载准考证。",
  },
  {
    id: "3",
    name: "企业级 Web 渗透测试全栈核心指南",
    progress: 42,
    type: "COURSE",
    tag: "ON_HOLD",
    lastStudy: "昨天 18:30",
  },
  {
    id: "4",
    name: "题库训练：SQL 注入深度分析与绕过技巧",
    progress: 85,
    type: "PRACTICE",
    tag: "NEAR_COMPLETE",
    lastStudy: "2 小时前",
  },
];

export function MePageShell({ children }: { children?: ReactNode }) {
  return (
    <div className="bg-background min-h-screen selection:bg-primary/10">
      <main className="mx-auto max-w-[1536px]">
        <div className="flex flex-col xl:flex-row min-h-screen">
          {/* 左侧精密导航基座 - 开启独立滚动 */}
          <aside className="w-full xl:w-[320px] xl:sticky xl:top-0 xl:h-screen border-r border-border/40 bg-muted/5 flex flex-col overflow-y-auto scrollbar-none">
            <div className="p-8 lg:p-10 flex flex-col min-h-full">
              <div className="flex items-center gap-3 mb-16 px-3">
                <div className="w-1.5 h-6 bg-primary" />
                <h1 className="text-xl font-bold tracking-tighter uppercase font-mono">
                  Control_Hub
                </h1>
              </div>

              <nav className="flex-1 flex flex-col gap-12">
                {/* 第一顺位：功能导航 */}
                <div className="space-y-4">
                  <span className="px-3 text-[9px] font-mono font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
                    Directory_Root
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {ME_ENTRY_GROUPS.map((group) => {
                      const Icon = group.icon;
                      return (
                        <Link
                          key={group.id}
                          href={`#${group.id}`}
                          className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-muted-foreground/80 hover:text-primary hover:bg-primary/5 border-l-2 border-transparent hover:border-primary transition-all group rounded-r-sm"
                        >
                          <Icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                          {group.title}
                          <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 -translate-x-1 group-hover:opacity-30 group-hover:translate-x-0 transition-all" />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 第二顺位：统计信号 - 强化对比度与缩放量感 */}
                <div className="space-y-6 pt-10 border-t border-border/15">
                  <span className="px-3 text-[9px] font-mono font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
                    Live_Metrics
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-3">
                    {ME_OVERVIEW_STATS.map((stat) => (
                      <div key={stat.label} className="flex flex-col gap-1.5">
                        <span className="text-[8px] text-muted-foreground/40 uppercase font-mono tracking-widest">
                          {stat.label}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-mono font-bold text-foreground leading-none">
                            {stat.value}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </nav>

              <div className="mt-12 pt-8 border-t border-border/30 opacity-40 hover:opacity-100 transition-opacity px-3">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  Session: Secured
                </div>
              </div>
            </div>
          </aside>

          {/* 右侧主作业区 */}
          <section className="flex-1 flex flex-col min-w-0">
            <header className="h-20 border-b border-border/40 px-8 lg:px-12 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4 ml-[-4px]">
                <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em] font-bold">
                  Workspace // v2.0.4
                </span>
              </div>
              <div className="flex items-center gap-6">
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors group">
                  <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-4 ring-background animate-pulse" />
                </button>
                <div className="w-9 h-9 rounded-full bg-muted border border-border/50 flex items-center justify-center text-[10px] font-bold ring-2 ring-primary/5 shadow-inner">
                  MR
                </div>
              </div>
            </header>

            <div className="flex-1 p-8 lg:p-12 max-w-6xl">
              <div className="flex flex-col gap-32">
                {/* 01: 正在运行的任务 - 精雕版 */}
                <section className="border border-border/40 overflow-hidden bg-background shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] dark:shadow-none">
                  <div className="bg-muted/15 border-b border-border/40 p-8 lg:px-12 lg:py-10 flex items-center justify-between">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-primary animate-ping opacity-40" />
                          <span className="absolute w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-primary tracking-[0.4em] uppercase">
                          SYSTEM_FLOW: ACTIVE
                        </span>
                      </div>
                      <h2 className="text-3xl font-medium tracking-tighter">
                        进程任务总览
                      </h2>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-1">
                      <span className="text-[9px] font-mono text-muted-foreground/40 uppercase">
                        Queue_Status
                      </span>
                      <span className="text-xs font-mono font-bold">
                        04 ACTIVE IN PIPELINE
                      </span>
                    </div>
                  </div>

                  <div className="p-8 lg:p-12 grid gap-6">
                    {MOCK_ONGOING_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="relative group p-6 border border-border/40 hover:border-primary/50 bg-muted/5 hover:bg-muted/10 transition-all duration-150"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/10 group-hover:w-1 group-hover:bg-primary transition-all" />
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="space-y-4 flex-1">
                            <div className="flex flex-wrap items-center gap-4">
                              <span className="text-[9px] font-mono px-2 py-0.5 border border-primary/20 text-primary uppercase font-black bg-primary/5">
                                {item.type}
                              </span>
                              <h3 className="text-lg font-medium tracking-tight group-hover:translate-x-1 transition-transform">
                                {item.name}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-8 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                              {item.progress !== undefined ? (
                                <div className="flex items-center gap-4 w-48">
                                  <div className="flex-1 h-[2px] bg-muted relative">
                                    <div
                                      className="absolute inset-0 bg-primary/40 group-hover:bg-primary transition-colors"
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                  <span className="shrink-0">
                                    {item.progress}%
                                  </span>
                                </div>
                              ) : (
                                <span className="flex items-center gap-1.5 text-destructive font-black animate-pulse">
                                  <Clock className="w-3 h-3" /> EVENT_START:{" "}
                                  {item.time}
                                </span>
                              )}
                              {item.lastStudy && (
                                <span className="flex items-center gap-1.5">
                                  <BookMarked className="w-3 h-3" /> SYNC:{" "}
                                  {item.lastStudy}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            href="#"
                            className="h-11 px-8 flex items-center justify-center gap-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all hover:translate-x-1"
                          >
                            进入控制台 <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 02: 功能集群 */}
                <section className="space-y-12">
                  <div className="flex flex-col gap-3 px-2">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary/30" />
                      <span className="text-[10px] font-mono font-bold text-primary tracking-[0.4em] uppercase">
                        REPOSITORY_INDEX
                      </span>
                    </div>
                    <h2 className="text-3xl font-medium tracking-tighter">
                      全系统架构节点
                    </h2>
                  </div>
                  <div className="flex flex-col gap-12">
                    {children || <MeSectionGrid groups={ME_ENTRY_GROUPS} />}
                  </div>
                </section>

                <section className="grid lg:grid-cols-2 gap-12 pt-16 border-t border-border/40 pb-32">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                      Credential_Auth
                    </h4>
                    <div className="flex items-center gap-5 p-6 bg-primary/5 border border-primary/20 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-16 h-16 -rotate-12" />
                      </div>
                      <Zap className="w-7 h-7 text-primary" />
                      <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold tracking-tight">
                            Pro_Scholar_Status
                          </p>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-primary text-white rounded-[2px] font-black">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 opacity-60">
                          Expires: 2027.04.01 // UID: 9283-X
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                      Quick_Links
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "资料同步设置", icon: Settings2 },
                        { label: "订单节点追踪", icon: CreditCard },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          className="flex items-center gap-3 p-4 border border-border/40 hover:border-primary/50 hover:bg-muted/10 transition-all text-[11px] font-bold text-left group"
                        >
                          <btn.icon className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary transition-colors" />
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
