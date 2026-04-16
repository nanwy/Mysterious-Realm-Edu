import { StudentShell } from "@workspace/ui";
import { PurchasesPageShell } from "@/components/me/purchases/purchases-page-shell";

export default function MePurchasesPage() {
  return (
    <StudentShell
      title="已购内容"
      description="迁移旧版学员端已购商品页，承接课程与考试两类已购记录，并在接口失败、空列表或入口缺失时给出明确说明。"
    >
      <PurchasesPageShell />
    </StudentShell>
  );
}
