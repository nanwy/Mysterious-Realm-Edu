import { StudentShell } from "@workspace/ui";
import { MessagesPageShell } from "@/components/me/messages/messages-page-shell";

export default function MeMessagesPage() {
  return (
    <StudentShell
      title="消息中心"
      description="迁移旧版学员端系统消息与业务消息列表，保留分页结构，并在接口不可用时给出明确错误说明。"
    >
      <MessagesPageShell />
    </StudentShell>
  );
}
