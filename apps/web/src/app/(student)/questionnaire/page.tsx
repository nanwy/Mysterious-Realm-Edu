import { StudentShell } from "@workspace/ui";
import { QuestionnairePage } from "@/components/questionnaire/page";
import {
  QUESTIONNAIRE_PAGE_SIZE,
  QUESTIONNAIRE_TYPE_STUDENT,
  resolveQuestionnaireKeywordParam,
  resolveQuestionnairePageParam,
} from "@/core/questionnaire";

const QuestionnairePageRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialQuery = {
    pageNo: resolveQuestionnairePageParam(params.page),
    pageSize: QUESTIONNAIRE_PAGE_SIZE,
    name: resolveQuestionnaireKeywordParam(params.keyword),
    type: QUESTIONNAIRE_TYPE_STUDENT,
  };

  return (
    <StudentShell
      title="问卷调查"
      description="补齐首页问卷入口的承接页，保留旧学员端的搜索、列表、分页结构，并在真实接口失败时展示明确错误说明。"
    >
      <QuestionnairePage initialQuery={initialQuery} />
    </StudentShell>
  );
};

export default QuestionnairePageRoute;
