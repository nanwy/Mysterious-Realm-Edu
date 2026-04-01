import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StudentShell,
  SurfaceCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui";
import { getCoursePageData } from "@/lib/data";

export default async function CoursesPage() {
  const { items, error } = await getCoursePageData();

  return (
    <StudentShell
      title="我的课程"
      description="对应旧项目 `views/user/MyCourse.vue` 与课程列表入口，后续承接学习进度、推荐课程、最近学习等真实数据。"
    >
      <SurfaceCard
        eyebrow="Courses"
        title="课程中心骨架"
        description="预留课程筛选、卡片列表、分类导航和学习进度入口。"
      >
        <Card className="border-white/70 bg-white/95">
          <CardHeader>
            <Badge>真实接口</Badge>
            <CardTitle>课程列表</CardTitle>
            <CardDescription>旧 Vue 接口：`POST /course/list`</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-sm text-slate-500">当前未连通接口：{error}</p>
            ) : items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>课程名称</TableHead>
                    <TableHead>讲师 / 分类</TableHead>
                    <TableHead>价格 / 状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.slice(0, 8).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{String(item.courseName ?? item.title ?? `课程 ${index + 1}`)}</TableCell>
                      <TableCell>{String(item.teacherName ?? item.categoryName ?? "--")}</TableCell>
                      <TableCell>{String(item.price ?? item.statusText ?? "待接入")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500">接口可用后会在这里展示真实课程数据。</p>
            )}
          </CardContent>
        </Card>
      </SurfaceCard>
    </StudentShell>
  );
}
