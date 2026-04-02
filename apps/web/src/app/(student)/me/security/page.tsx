import { Suspense } from "react";
import { StudentShell } from "@workspace/ui";
import { SecurityPageContent } from "@/components/me/security/security-page-content";
import { SecurityPageShell } from "@/components/me/security/security-page-shell";

export default function MeSecurityPage() {
  return (
    <StudentShell
      title="账号安全"
      description="迁移旧版学员端账号安全承接页，当前只展示安全概览、状态反馈和后续操作说明，不开放真实提交。"
    >
      <Suspense fallback={<SecurityPageShell state="loading" />}>
        <SecurityPageContent />
      </Suspense>
    </StudentShell>
  );
}
