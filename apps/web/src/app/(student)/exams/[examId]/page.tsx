import { StudentShell } from "@workspace/ui";
import { ExamSessionPageShell } from "@/components/exams/session/exam-session-page-shell";

function toUserExamId(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

export default async function ExamSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const routeParams = await params;
  const query = await searchParams;

  return (
    <StudentShell>
      <ExamSessionPageShell examId={routeParams.examId} initialUserExamId={toUserExamId(query.userExamId)} />
    </StudentShell>
  );
}
