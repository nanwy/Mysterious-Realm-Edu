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
import { getExamPageData } from "@/lib/data";

export default async function ExamsPage() {
  const { items, error } = await getExamPageData();

  return (
    <StudentShell
      title="在线考试"
      description="对应旧项目考试列表、考试预览、在线考试与结果详情。后续会把考试策略、防作弊与缓存答案流程放入此分区。"
    >
      <SurfaceCard
        eyebrow="Exam"
        title="考试中心骨架"
        description="已为考试列表、考试详情、在线考试、切屏检测与人脸监考能力预留结构。"
      >
        <Card className="border-white/70 bg-white/95">
          <CardHeader>
            <Badge>真实接口</Badge>
            <CardTitle>考试列表</CardTitle>
            <CardDescription>旧 Vue 接口：`POST /exam/list`</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {error ? (
              <p className="text-sm text-slate-500">当前未连通接口：{error}</p>
            ) : items.length > 0 ? (
              items.slice(0, 6).map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">
                    {String(item.examName ?? item.title ?? `考试 ${index + 1}`)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {String(item.examTime ?? item.startTime ?? item.description ?? "已接入考试列表接口。")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">接口可用后会在这里展示真实考试数据。</p>
            )}
          </CardContent>
        </Card>
      </SurfaceCard>
    </StudentShell>
  );
}
