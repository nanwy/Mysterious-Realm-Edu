"use client";

import { useRouter } from "next/navigation";
import { MotionItem, MotionStagger } from "@workspace/motion";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui";
import { ArrowUpRight, CircleAlert, Trophy } from "lucide-react";

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
      <MotionItem className="hidden overflow-hidden rounded-[24px] border border-border md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">考试名称</TableHead>
              <TableHead>考试次数</TableHead>
              <TableHead>最高分</TableHead>
              <TableHead>是否通过</TableHead>
              <TableHead>最近考试</TableHead>
              <TableHead className="px-4 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="bg-background/80">
                <TableCell className="px-4 py-4 whitespace-normal text-foreground">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{record.examTitle}</p>
                      {record.maxScore !== null && record.maxScore >= 90 ? (
                        <Badge className="rounded-full" variant="secondary">
                          高分段
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{getAttemptLabel(record.tryCount)}</p>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-muted-foreground">
                  {displayMetric(record.tryCount)}
                </TableCell>
                <TableCell className="py-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-primary" />
                    <span>{displayMetric(record.maxScore, " 分")}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">{renderPassedLabel(record.passed)}</TableCell>
                <TableCell className="py-4 text-muted-foreground">
                  {displayTime(record.recentExamTime)}
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </MotionItem>

      <div className="grid gap-3 md:hidden">
        {records.map((record) => (
          <MotionItem
            key={record.id}
            className="rounded-[28px] border border-border/70 bg-background/90 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
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
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-[22px] bg-muted/50 p-4">
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
