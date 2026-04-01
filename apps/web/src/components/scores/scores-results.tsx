import { MotionItem, MotionStagger } from "@workspace/motion";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui";

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
      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        通过
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
        未通过
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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

export function ScoresResults({ records }: { records: ScoreRecord[] }) {
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
                <TableCell className="px-4 py-4 font-medium whitespace-normal text-foreground">
                  {record.examTitle}
                </TableCell>
                <TableCell className="py-4 text-muted-foreground">
                  {displayMetric(record.tryCount)}
                </TableCell>
                <TableCell className="py-4 text-muted-foreground">
                  {displayMetric(record.maxScore, " 分")}
                </TableCell>
                <TableCell className="py-4">{renderPassedLabel(record.passed)}</TableCell>
                <TableCell className="py-4 text-muted-foreground">
                  {displayTime(record.recentExamTime)}
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
                  <Button size="sm" variant="outline" disabled title={record.examId || "detail-pending"}>
                    查看详情
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
            className="rounded-[24px] border border-border bg-background/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {record.examTitle}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  最近考试：{displayTime(record.recentExamTime)}
                </p>
              </div>
              {renderPassedLabel(record.passed)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-[20px] bg-muted/50 p-4">
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
                <p className="mt-2 text-base font-semibold text-foreground">
                  {displayMetric(record.maxScore, " 分")}
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full" variant="outline" disabled title={record.examId || "detail-pending"}>
              查看详情
            </Button>
          </MotionItem>
        ))}
      </div>
    </MotionStagger>
  );
}
