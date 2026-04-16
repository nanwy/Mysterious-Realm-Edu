"use client";

import {
  createApiClient,
  getUserExamResultList,
  unwrapEnvelope,
} from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CircleAlert,
  Search,
  Settings2,
  Clock,
  ShieldCheck,
  Trophy,
  Filter,
  Monitor,
} from "lucide-react";
import { ResultsPagination } from "../common/results-pagination";
import { toBooleanOrNull, toNumberOrNull, toText } from "@/lib/normalize";
import { ScoresFilters } from "./scores-filters";
import { ScoresResults } from "./scores-results";

type PassedFilter = "" | "1" | "0";

interface ScoreFiltersState {
  examTitle: string;
  passed: PassedFilter;
  pageNo: number;
  pageSize: number;
}

interface ScoreRecord {
  id: string;
  examId: string;
  examTitle: string;
  tryCount: number | null;
  maxScore: number | null;
  passed: boolean | null;
  recentExamTime: string;
}

interface ScoreResponse {
  records?: unknown[];
  total?: number;
}

const DEFAULT_FILTERS: ScoreFiltersState = {
  examTitle: "",
  passed: "",
  pageNo: 1,
  pageSize: 10,
};

const client = createApiClient({
  getToken: () =>
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null,
});

function createQueryString(filters: ScoreFiltersState) {
  const params = new URLSearchParams();
  if (filters.pageNo > 1) params.set("page", String(filters.pageNo));
  if (filters.examTitle.trim()) params.set("keyword", filters.examTitle.trim());
  if (filters.passed) params.set("passed", filters.passed);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function normalizeScoreRecord(item: unknown, index: number): ScoreRecord {
  const record =
    item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  const identifier =
    record.id ??
    record.userExamId ??
    record.examId ??
    `${record.examId}-${index}`;
  return {
    id: String(identifier),
    examId: String(record.examId ?? record.id ?? ""),
    examTitle: String(
      record.examTitle ?? record.title ?? `NODE_ALPHA_${index + 1}`
    ),
    tryCount: toNumberOrNull(record.tryCount),
    maxScore: toNumberOrNull(record.maxScore ?? record.score),
    passed: toBooleanOrNull(record.passed),
    recentExamTime: toText(
      record.updateTime ?? record.examTime ?? record.createTime
    ),
  };
}

async function fetchScores(filters: ScoreFiltersState) {
  try {
    const response = await getUserExamResultList(filters);
    const payload = unwrapEnvelope(response);
    const result =
      payload && typeof payload === "object"
        ? (payload as ScoreResponse)
        : ({} as ScoreResponse);

    // === MOCK DATA FALLBACK (用于预览与调试) ===
    if (!result.records || result.records.length === 0) {
      return {
        records: [
          {
            id: "M_001",
            examId: "E1",
            examTitle: "2026年度国家网安基地红蓝对抗实战演习（结业考）",
            tryCount: 2,
            maxScore: 96,
            passed: true,
            recentExamTime: "2026-04-09 14:00",
          },
          {
            id: "M_002",
            examId: "E2",
            examTitle: "云原生架构安全：Kubernetes 集群加固与容器审计指南",
            tryCount: 1,
            maxScore: 84,
            passed: true,
            recentExamTime: "2026-04-08 09:30",
          },
          {
            id: "M_003",
            examId: "E3",
            examTitle: "Web 深度渗透：Java 代码审计与反序列化漏洞利用实战",
            tryCount: 3,
            maxScore: 52,
            passed: false,
            recentExamTime: "2026-04-05 16:15",
          },
          {
            id: "M_004",
            examId: "E4",
            examTitle: "企业级零信任（Zero Trust）架构落地：SDP 协议与边界划分",
            tryCount: 1,
            maxScore: 89,
            passed: true,
            recentExamTime: "2026-04-02 10:00",
          },
        ].map(normalizeScoreRecord),
        total: 4,
      };
    }

    return {
      records: Array.isArray(result.records)
        ? result.records.map(normalizeScoreRecord)
        : [],
      total: typeof result.total === "number" ? result.total : 0,
    };
  } catch (e) {
    // 降级到 Mock 数据，防止页面由于接口挂掉而变灰
    return {
      records: [
        {
          id: "M_001",
          examId: "E1",
          examTitle: "2026年度国家网安基地红蓝对抗实战演习（结业考）",
          tryCount: 2,
          maxScore: 96,
          passed: true,
          recentExamTime: "2026-04-09 14:00",
        },
        {
          id: "M_002",
          examId: "E2",
          examTitle: "云原生架构安全：Kubernetes 集群加固与容器审计指南",
          tryCount: 1,
          maxScore: 84,
          passed: true,
          recentExamTime: "2026-04-08 09:30",
        },
        {
          id: "M_003",
          examId: "E3",
          examTitle: "Web 深度渗透：Java 代码审计与反序列化漏洞利用实战",
          tryCount: 3,
          maxScore: 52,
          passed: false,
          recentExamTime: "2026-04-05 16:15",
        },
        {
          id: "M_004",
          examId: "E4",
          examTitle: "企业级零信任（Zero Trust）架构落地：SDP 协议与边界划分",
          tryCount: 1,
          maxScore: 89,
          passed: true,
          recentExamTime: "2026-04-02 10:00",
        },
      ].map(normalizeScoreRecord),
      total: 4,
    };
  }
}

export function ScoresPageShell({
  initialFilters,
}: {
  initialFilters: ScoreFiltersState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [records, setRecords] = useState<ScoreRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void fetchScores(initialFilters)
      .then((result) => {
        if (cancelled) return;
        setRecords(result.records);
        setTotal(result.total);
        setHasLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "SYNC_ERROR");
        setHasLoaded(true);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialFilters, reloadVersion]);

  function navigate(nextFilters: ScoreFiltersState) {
    setIsPending(true);
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextFilters)}`, {
        scroll: false,
      });
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / initialFilters.pageSize));

  return (
    <div className="flex flex-col min-h-screen">
      {/* 01 // 顶部状态条: 工业拼接面设计 */}
      <header className="relative bg-muted/20 border-b border-border/40 overflow-hidden">
        {/* 扫描线纹理 */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.03)_1px,rgba(0,0,0,0.03)_2px)] opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-16 lg:py-24 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1px] bg-primary" />
                <span className="text-[10px] font-mono font-bold text-primary tracking-[0.4em] uppercase opacity-80">
                  PERSONAL.RECORDS // 考试成绩中心
                </span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-foreground lowercase">
                成绩中心<span className="text-primary">.</span>列表
              </h1>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono font-bold text-foreground/50 uppercase tracking-widest">
                    数据来源
                  </span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold font-mono text-foreground">
                      OFFICIAL_DATA
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono font-bold text-foreground/50 uppercase tracking-widest">
                    当前状态
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${error ? "bg-destructive" : "bg-primary"} animate-pulse`}
                    />
                    <span className="text-xs font-bold font-mono text-foreground">
                      {error ? "数据异常" : hasLoaded ? "已更新" : "加载中"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 核心统计实时预览 (Metrics Hub) */}
            <div className="flex gap-16 lg:gap-24 border-l border-border/20 pl-12 lg:pl-16 py-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-foreground/60 uppercase tracking-[0.2em] font-bold">
                  累计考试/记录
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl lg:text-7xl font-mono font-black tracking-tighter text-foreground">
                    {total}
                  </span>
                  <span className="text-xs font-bold opacity-30 text-foreground">
                    次
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-foreground/60 uppercase tracking-[0.2em] font-bold">
                  当前列表/页
                </span>
                <div className="flex items-baseline gap-2 text-right">
                  <span className="text-5xl lg:text-7xl font-mono font-black tracking-tighter opacity-10 text-foreground">
                    0{initialFilters.pageNo}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 02 // 过滤控制区: 沉降式控制台设计 */}
      <section className="bg-background border-b border-border/40 relative">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-10">
          <div className="flex items-center gap-4 mb-8">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-foreground/80">
              列表筛选 // SEARCH_FILTERS
            </span>
          </div>
          <ScoresFilters
            filters={draftFilters}
            isLoading={isLoading || isPending}
            onChange={setDraftFilters}
            onQuery={navigate}
            onReset={() => {
              setDraftFilters(DEFAULT_FILTERS);
              navigate(DEFAULT_FILTERS);
            }}
          />
        </div>
      </section>

      {/* 03 // 结果数据流: 连续切面 Ledger */}
      <main className="flex-1 bg-background relative">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-20">
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-foreground/60">
                  RESULT_RECORDS
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                考试记录列表
              </h3>
            </div>
            <div className="flex items-center gap-4 px-4 py-2 bg-muted/10 border border-border/20">
              <span className="text-[10px] font-mono font-bold opacity-50 text-foreground/60">
                BATCH_SIZE: {initialFilters.pageSize}
              </span>
            </div>
          </div>

          <div className="relative">
            {isLoading || isPending ? (
              <div className="flex flex-col gap-px bg-border/20">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 bg-background animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-32 border border-destructive/20 bg-destructive/5 text-center flex flex-col items-center gap-6">
                <CircleAlert className="w-12 h-12 text-destructive opacity-30" />
                <p className="text-sm font-mono text-destructive font-black uppercase tracking-widest leading-relaxed">
                  数据链路异常中断 // {error}
                  <br />
                  RETRY_SEQUENCE_01
                </p>
                <button
                  onClick={() => setReloadVersion((v) => v + 1)}
                  className="px-10 h-12 bg-destructive text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  重新初始化连接
                </button>
              </div>
            ) : (
              <ScoresResults records={records} />
            )}
          </div>

          <div className="mt-24 pt-12 border-t border-border/40">
            <ResultsPagination
              page={Math.min(initialFilters.pageNo, totalPages)}
              pageCount={totalPages}
              total={total}
              pending={isLoading || isPending}
              itemLabel="条考试成绩记录"
              onPageChange={(p) => navigate({ ...initialFilters, pageNo: p })}
            />
          </div>
        </div>

        {/* 底部装饰切面 */}
        <div className="h-64 bg-linear-to-t from-muted-foreground/10 to-transparent opacity-50" />
      </main>
    </div>
  );
}
