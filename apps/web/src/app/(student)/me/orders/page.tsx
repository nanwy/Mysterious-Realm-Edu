import { StudentShell } from "@workspace/ui";
import { OrdersPageShell } from "@/components/me/orders/orders-page-shell";

export default function MeOrdersPage() {
  return (
    <StudentShell
      title="我的订单"
      description="承接旧版学员端订单列表入口，先迁移状态筛选、订单列表、详情占位与接口失败兜底。"
    >
      <OrdersPageShell />
    </StudentShell>
  );
}
