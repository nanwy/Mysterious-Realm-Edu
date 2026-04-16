import { StudentShell } from "@workspace/ui";
import { CertificatesPageShell } from "@/components/me/certificates/certificates-page-shell";

export default function MeCertificatesPage() {
  return (
    <StudentShell
      title="我的证书"
      description="迁移旧版学员端证书列表页，保留分类切换、证书列表与预览/下载入口，并在接口或环境异常时展示明确降级说明。"
    >
      <CertificatesPageShell />
    </StudentShell>
  );
}
