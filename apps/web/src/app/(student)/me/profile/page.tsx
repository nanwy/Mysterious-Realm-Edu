import { Suspense } from "react";
import { StudentShell } from "@workspace/ui";
import { ProfilePageContent } from "@/components/me/profile/profile-page-content";
import { ProfilePageShell } from "@/components/me/profile/profile-page-shell";

export default function ProfilePage() {
  return (
    <StudentShell
      title="个人资料"
      description="迁移旧版学员端个人资料展示体验，当前只承接资料浏览、状态反馈和占位编辑入口。"
    >
      <Suspense fallback={<ProfilePageShell state="loading" />}>
        <ProfilePageContent />
      </Suspense>
    </StudentShell>
  );
}
