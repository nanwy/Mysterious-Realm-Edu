"use client";

import { useRouter } from "next/navigation";
import { MotionItem, MotionStagger } from "@workspace/motion";
import { Badge, Button } from "@workspace/ui";
import { ArrowUpRight, CircleAlert, Clock3, Trophy } from "lucide-react";

interface ScoreRecord {
  id: string;
  examId: string;
  examTitle: string;
  tryCount: number | null;
  maxScore: number | null;
  passed: boolean | null;
  recentExamTime: string;
}

function renderPassedLabel(value: ScoreRecord["passed"]) {
  if (value === true) {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        通过
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
        未通过
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
      未知
    </span>
  );
}

function displayMetric(value: number | null, suffix = "") {
  return value === null ? "--" : `${value}${suffix}`;
}

function displayTime(value: string) {
  return value || "--";
}

function getAttemptLabel(value: number | null) {
  if (value === null) {
    return "次数待补";
  }

  if (value <= 1) {
    return "首次完成";
  }

  return `已参加 ${value} 次`;
}

export function ScoresResults({ records }: { records: ScoreRecord[] }) {
  const router = useRouter();

  return (
    <MotionStagger className="grid gap-4" delayChildren={0.06}>
      <MotionItem className="hidden overflow-hidden rounded-[28px] border border-border/70 bg-background/55 md:block">
        <div className="grid grid-cols-[minmax(0,1.7fr)_120px_140px_150px_150px_132px] gap-4 border-b border-border/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <span>考试记录</span>
          <span>次数</span>
          <span>最高分</span>
          <span>结果</span>
          <span>最近考试</span>
          <span className="text-right">动作</span>
        </div>

        <div className="divide-y divide-border/60">
          {records.map((record) => (
            <article
              key={record.id}
              className="grid grid-cols-[minmax(0,1.7fr)_120px_140px_150px_150px_132px] gap-4 px-5 py-5 transition-colors hover:bg-background/70"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-foreground">{record.examTitle}</p>
                  {record.maxScore !== null && record.maxScore >= 90 ? (
                    <Badge className="rounded-full" variant="secondary">
                      高分段
                    </Badge>
                  ) : null}
                </div>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  {getAttemptLabel(record.tryCount)}
                </p>
              </div>

              <div className="flex items-center text-sm font-medium text-foreground">
                {displayMetric(record.tryCount)}
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Trophy className="size-4 text-primary" />
                <span>{displayMetric(record.maxScore, " 分")}</span>
              </div>

              <div className="flex items-center">{renderPassedLabel(record.passed)}</div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="size-4" />
                <span>{displayTime(record.recentExamTime)}</span>
              </div>

              <div className="flex items-center justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!record.examId}
                  onClick={() => router.push(`/scores/${record.examId}`)}
                  title={record.examId || "exam-id-missing"}
                >
                  查看详情
                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </MotionItem>

      <div className="grid gap-3 md:hidden">
        {records.map((record) => (
          <MotionItem
            key={record.id}
            className="rounded-[28px] border border-border/70 bg-background/90 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">{record.examTitle}</p>
                  {record.maxScore !== null && record.maxScore >= 90 ? (
                    <Badge className="rounded-full" variant="secondary">
                      高分段
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{getAttemptLabel(record.tryCount)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  最近考试：{displayTime(record.recentExamTime)}
                </p>
              </div>
              {renderPassedLabel(record.passed)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-[22px] border border-border/60 bg-muted/35 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  考试次数
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {displayMetric(record.tryCount)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  最高分
                </p>
                <div className="mt-2 flex items-center gap-2 text-base font-semibold text-foreground">
                  <Trophy className="size-4 text-primary" />
                  <span>{displayMetric(record.maxScore, " 分")}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-[20px] border border-dashed border-border/70 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
              <CircleAlert className="size-4 shrink-0" />
              <span>成绩详情会继续承接单场考试明细、题型拆解与结果复盘。</span>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                disabled={!record.examId}
                onClick={() => router.push(`/scores/${record.examId}`)}
                title={record.examId || "exam-id-missing"}
              >
                查看详情
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </MotionItem>
        ))}
      </div>
    </MotionStagger>
  );
}
