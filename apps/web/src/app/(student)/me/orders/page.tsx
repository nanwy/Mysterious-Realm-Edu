import { StudentShell } from "@workspace/ui";
import { OrdersPageShell } from "@/components/me/orders/orders-page-shell";

export default function MeOrdersPage() {
  return (
    <StudentShell
      title="我的订单"
      description="迁移旧版学员端订单列表页，承接状态筛选、订单核心信息、分页浏览与异常兜底，同时明确标注未迁移的支付和售后链路。"
    >
      <OrdersPageShell />
    </StudentShell>
  );
}
