import { StudentShell } from "@workspace/ui";
import { NewsDetailPage } from "@/components/news/detail/page";

const NewsDetailPageRoute = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <StudentShell
      title="资讯详情"
      description="承接旧学员端文章详情阅读体验，保留真实接口读取、正文展示和接口失败时的可读错误说明。"
    >
      <NewsDetailPage newsId={id} />
    </StudentShell>
  );
};

export default NewsDetailPageRoute;
