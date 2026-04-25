import { StudentShell } from "@workspace/ui";
import { CertificatesPage } from "@/components/me/certificates/page";
import {
  CERTIFICATE_TYPE,
  CERTIFICATES_PAGE_SIZE,
  type CertificateTypeFilter,
} from "@/core/certificates";

const toPositivePage = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

const toCertificateType = (
  value: string | string[] | undefined
): CertificateTypeFilter => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === CERTIFICATE_TYPE.ALL ||
    raw === CERTIFICATE_TYPE.STUDY ||
    raw === CERTIFICATE_TYPE.EXAM
  ) {
    return raw;
  }

  return CERTIFICATE_TYPE.ALL;
};

const MeCertificatesRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialFilters = {
    certificateType: toCertificateType(params.type),
    pageNo: toPositivePage(params.page),
    pageSize: CERTIFICATES_PAGE_SIZE,
  } as const;

  return (
    <StudentShell
      title="我的证书"
      description="迁移旧版学员端证书列表页，保留分类切换、证书列表与预览/下载入口，并在接口或环境异常时展示明确降级说明。"
    >
      <CertificatesPage initialFilters={initialFilters} />
    </StudentShell>
  );
};

export default MeCertificatesRoute;
