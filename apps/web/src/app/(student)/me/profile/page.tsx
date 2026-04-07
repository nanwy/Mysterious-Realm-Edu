import { Suspense } from "react";
import { StudentShell } from "@workspace/ui";
import { ProfilePageContent } from "@/components/me/profile/profile-page-content";
import { ProfilePageShell } from "@/components/me/profile/profile-page-shell";

export default function ProfilePage() {
  return (
    <StudentShell
      title="个人资料"
      description="统一展示学员基础资料、联系信息与组织归属，保留只读呈现并覆盖完整状态反馈。"
    >
      <Suspense fallback={<ProfilePageShell state="loading" />}>
        <ProfilePageContent />
      </Suspense>
    </StudentShell>
  );
}
