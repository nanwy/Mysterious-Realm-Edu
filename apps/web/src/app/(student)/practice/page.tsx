import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StudentShell,
  SurfaceCard,
} from "@workspace/ui";
import { getPracticePageData } from "@/lib/data";

export default async function PracticePage() {
  const { items, error } = await getPracticePageData();

  return (
    <StudentShell
      title="在线练习"
      description="对应旧项目题库、练习模式与练习结果路由，后续接入题库列表、随机/顺序练习和作答记录。"
    >
      <SurfaceCard
        eyebrow="Practice"
        title="题库练习骨架"
        description="已预留仓库列表、练习模式切换、作答状态与练习结果页的迁移空间。"
      >
        <Card className="border-white/70 bg-white/95">
          <CardHeader>
            <Badge>真实接口</Badge>
            <CardTitle>题库仓库列表</CardTitle>
            <CardDescription>旧 Vue 接口：`POST /repository/list`</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {error ? (
              <p className="text-sm text-slate-500">当前未连通接口：{error}</p>
            ) : items.length > 0 ? (
              items.slice(0, 6).map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">
                    {String(item.repositoryName ?? item.title ?? `题库 ${index + 1}`)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {String(item.description ?? item.remark ?? "已接入仓库列表接口。")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">接口可用后会在这里展示真实题库数据。</p>
            )}
          </CardContent>
        </Card>
      </SurfaceCard>
    </StudentShell>
  );
}
