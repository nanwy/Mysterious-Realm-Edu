import { Button, Input } from "@workspace/ui";

type PassedFilter = "" | "1" | "0";

interface ScoreFiltersState {
  examTitle: string;
  passed: PassedFilter;
  pageNo: number;
  pageSize: number;
}

export function ScoresFilters({
  filters,
  isLoading,
  onChange,
  onQuery,
  onReset,
}: {
  filters: ScoreFiltersState;
  isLoading: boolean;
  onChange: (filters: ScoreFiltersState) => void;
  onQuery: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px_auto] lg:items-end">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">考试名称</span>
        <Input
          value={filters.examTitle}
          onChange={(event) =>
            onChange({
              ...filters,
              examTitle: event.target.value,
            })
          }
          placeholder="请输入考试名称"
          className="h-11 rounded-2xl border-border bg-background px-4"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">是否通过</span>
        <select
          value={filters.passed}
          onChange={(event) =>
            onChange({
              ...filters,
              passed: event.target.value as PassedFilter,
            })
          }
          className="h-11 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">全部</option>
          <option value="1">通过</option>
          <option value="0">未通过</option>
        </select>
      </label>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={onQuery} disabled={isLoading}>
          查询
        </Button>
        <Button size="lg" variant="outline" onClick={onReset} disabled={isLoading}>
          清空
        </Button>
      </div>
    </div>
  );
}
