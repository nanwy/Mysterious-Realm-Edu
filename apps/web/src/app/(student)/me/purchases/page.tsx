import { StudentShell } from "@workspace/ui";
import { PurchasesPageShell } from "@/components/me/purchases/purchases-page-shell";

export default function MePurchasesPage() {
  return (
    <StudentShell
      title="已购商品"
      description="迁移旧版学员端已购商品页，先提供课程 / 考试切换、列表浏览，以及接口异常时的明确兜底说明。"
    >
      <PurchasesPageShell />
    </StudentShell>
  );
}
