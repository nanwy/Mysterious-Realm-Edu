"use client";

import { MotionItem, MotionStagger } from "@workspace/motion";
import { ArrowUpRight, Clock, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface ScoreRecord {
  id: string;
  examId: string;
  examTitle: string;
  tryCount: number | null;
  maxScore: number | null;
  passed: boolean | null;
  recentExamTime: string;
}

function renderStatusNode(passed: boolean | null) {
  if (passed === true) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
          考试通过 // SUCCESS
        </span>
      </div>
    );
  }
  if (passed === false) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-[11px] font-bold text-destructive uppercase tracking-widest">
          考试未通过 // FAILED
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 opacity-30">
      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
        查询中 // RELOADING
      </span>
    </div>
  );
}

export function ScoresResults({ records }: { records: ScoreRecord[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col border-y border-border/40 bg-background relative z-10">
      <MotionStagger className="divide-y divide-border/10" delayChildren={0.03}>
        {records.map((record, index) => {
          const scorePercent = Math.min(100, record.maxScore || 0);
          const isHighAlpha = (record.maxScore ?? 0) >= 90;

          return (
            <MotionItem key={record.id}>
              <div
                onClick={() =>
                  record.examId && router.push(`/scores/${record.examId}`)
                }
                className="group relative flex flex-col xl:flex-row xl:items-center justify-between gap-12 p-8 lg:p-14 cursor-pointer hover:bg-muted/[0.02] transition-all duration-300"
              >
                {/* 侧面高光感应条 */}
                <div
                  className={`absolute left-0 top-1/4 bottom-1/4 w-0.5 transition-all group-hover:top-0 group-hover:bottom-0 ${record.passed ? "bg-primary" : record.passed === false ? "bg-destructive" : "bg-muted-foreground/20"}`}
                />

                {/* 01 // 索引 & 标题 */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-6">
                    <span className="px-2 py-0.5 bg-muted/20 text-[9px] font-mono font-black text-muted-foreground/40 uppercase tracking-widest">
                      编号_{record.id.slice(-4).toUpperCase()}
                    </span>
                    {renderStatusNode(record.passed)}
                  </div>

                  <h3 className="text-2xl lg:text-4xl font-bold tracking-tighter leading-tight group-hover:text-primary transition-colors pr-12">
                    {record.examTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-10 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      最近考期: {record.recentExamTime || "无记录"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      考试次数: {record.tryCount ?? 0}
                    </div>
                  </div>
                </div>

                {/* 02 // 霸权数值区 (Dominant Score Display) */}
                <div className="flex items-center gap-12 xl:gap-20 min-w-[320px] justify-between xl:justify-end border-t xl:border-t-0 border-border/10 pt-8 xl:pt-0">
                  {/* 进度水位计 */}
                  <div className="hidden sm:flex flex-col items-end gap-3 flex-1 max-w-[200px]">
                    <div className="flex items-center justify-between w-full text-[9px] font-mono font-bold uppercase opacity-30 tracking-[0.3em]">
                      <span>得分占比</span>
                      <span>{record.maxScore ?? 0}%</span>
                    </div>
                    <div className="w-full h-[4px] bg-muted/10 relative">
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out z-10 ${record.passed ? "bg-primary" : "bg-destructive/40"}`}
                        style={{ width: `${scorePercent}%` }}
                      />
                      {/* 标尺线 */}
                      <div className="absolute inset-0 flex justify-between px-[1px] opacity-20">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-[1px] h-full bg-foreground"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 核心分数值 */}
                  <div className="flex items-baseline gap-2 min-w-[120px] text-right">
                    <span
                      className={`text-6xl lg:text-8xl font-mono font-black tracking-tighter leading-none ${record.passed === false ? "text-destructive" : isHighAlpha ? "text-primary" : "text-foreground"}`}
                    >
                      {record.maxScore ?? "--"}
                    </span>
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[12px] font-mono font-black opacity-20 leading-none">
                        分
                      </span>
                      {isHighAlpha && (
                        <div className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-sm animate-bounce">
                          优秀
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="hidden lg:flex w-16 h-16 border border-border/10 items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all">
                    <ArrowUpRight className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
              </div>
            </MotionItem>
          );
        })}
      </MotionStagger>
    </div>
  );
}
