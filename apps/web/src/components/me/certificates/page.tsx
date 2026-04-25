"use client";

import { useQuery } from "@tanstack/react-query";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Badge,
  SurfaceCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui";
import { Eye, GraduationCap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { CertificatesResults } from "./results";
import { ResultsPagination } from "@/components/common/results-pagination";
import {
  CERTIFICATE_TYPE,
  CERTIFICATE_TYPE_OPTIONS,
  type CertificateFiltersState,
  certificateQueryOptions,
  type CertificateTypeFilter,
  normalizeCertificatesError,
} from "@/core/certificates";

const createQueryString = (filters: CertificateFiltersState) => {
  const params = new URLSearchParams();

  if (filters.pageNo > 1) {
    params.set("page", String(filters.pageNo));
  }

  if (filters.certificateType !== CERTIFICATE_TYPE.ALL) {
    params.set("type", filters.certificateType);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const getTypeLabel = (value: CertificateTypeFilter) =>
  CERTIFICATE_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
  "全部";

export const CertificatesPage = ({
  initialFilters,
}: {
  initialFilters: CertificateFiltersState;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const certificatesQuery = useQuery(
    certificateQueryOptions.list(initialFilters)
  );
  const records = certificatesQuery.data?.records ?? [];
  const total = certificatesQuery.data?.total ?? 0;
  const isLoading = certificatesQuery.isLoading || isPending;
  const error = certificatesQuery.error
    ? normalizeCertificatesError(certificatesQuery.error)
    : null;

  const navigate = (nextFilters: CertificateFiltersState) => {
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextFilters)}`, {
        scroll: false,
      });
    });
  };

  const updateType = (nextValue: string) => {
    const certificateType = CERTIFICATE_TYPE_OPTIONS.some(
      (option) => option.value === nextValue
    )
      ? (nextValue as CertificateTypeFilter)
      : CERTIFICATE_TYPE.ALL;

    navigate({
      ...initialFilters,
      certificateType,
      pageNo: 1,
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / initialFilters.pageSize));
  const currentPage = Math.min(initialFilters.pageNo, totalPages);
  const currentTypeLabel = getTypeLabel(initialFilters.certificateType);
  const staticConfigured = Boolean(process.env.NEXT_PUBLIC_STATIC_BASE_URL);
  const previewConfigured = Boolean(process.env.NEXT_PUBLIC_KKFILEVIEW_URL);
  const listStatus = error
    ? "请求失败"
    : isLoading
      ? "加载中"
      : `${records.length} 条`;

  return (
    <MotionStagger className="grid gap-6" delayChildren={0.08}>
      <MotionItem>
        <SurfaceCard
          eyebrow="Certificates"
          title="我的证书"
          description="迁移旧版学员端证书列表页，保留分类切换、列表浏览和预览/下载入口；接口失败或预览环境未配置时，页面会明确展示降级说明。"
        >
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MotionReveal direction="up" delay={0.02}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">当前分类</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {currentTypeLabel}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    切换分类会重置到第一页，并重新请求对应证书列表。
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.08}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">列表状态</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {listStatus}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {error ?? "列表展示用户、证书、考试、课程与发证时间等核心字段。"}
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.14}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">预览能力</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {previewConfigured && staticConfigured
                      ? "预览可用"
                      : staticConfigured
                        ? "仅可下载"
                        : "待补环境"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {previewConfigured
                      ? "已检测到预览地址，动作入口会优先打开在线预览。"
                      : "未配置 NEXT_PUBLIC_KKFILEVIEW_URL 时，页面会保留下载入口或给出降级说明。"}
                  </p>
                </div>
              </MotionReveal>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <Badge variant="outline">
                分页 {initialFilters.pageSize} 条/页
              </Badge>
              <Badge variant="outline">
                {staticConfigured ? "静态文件地址已配置" : "静态文件地址未配置"}
              </Badge>
              <Badge variant="outline">
                {previewConfigured ? "在线预览已配置" : "在线预览未配置"}
              </Badge>
            </div>

            <div data-testid="certificates-tabs">
              <Tabs
                value={initialFilters.certificateType}
                onValueChange={updateType}
              >
                <TabsList aria-label="证书分类">
                  {CERTIFICATE_TYPE_OPTIONS.map((option) => (
                    <TabsTrigger key={option.value} value={option.value}>
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {CERTIFICATE_TYPE_OPTIONS.map((option) => (
                  <TabsContent key={option.value} value={option.value}>
                    <div className="sr-only">{option.label}证书列表</div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title={`${currentTypeLabel}证书列表`}
          description="列表保留 loading / empty / error 三种兜底状态；若证书原文件或在线预览地址未配置，会在操作区说明当前能做什么。"
        >
          <div className="grid gap-6">
            <div data-testid="certificates-list-region">
              <CertificatesResults
                records={records}
                loading={isLoading}
                error={error}
                emptyLabel={currentTypeLabel}
                onRetry={() => {
                  void certificatesQuery.refetch();
                }}
              />
            </div>

            <div data-testid="certificates-pagination">
              <ResultsPagination
                page={currentPage}
                pageCount={totalPages}
                total={total}
                pending={isLoading}
                itemLabel="张证书"
                onPageChange={(page) =>
                  navigate({
                    ...initialFilters,
                    pageNo: page,
                  })
                }
              />
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title="迁移说明"
          description="证书页沿用旧版“全部 / 学习证书 / 考试证书”三分类；当前仍直接请求现有证书接口，没有修改 packages/api。"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="size-4" />
                <span>接口字段归一化</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                页面优先读取旧 Vue 中使用过的
                <code className="mx-1 rounded bg-background px-1.5 py-0.5 text-xs text-foreground">
                  *_dictText
                </code>
                字段，并对时间、课程、考试名称缺失时提供占位文案。
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="size-4" />
                <span>动作入口降级</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                预览依赖
                <code className="mx-1 rounded bg-background px-1.5 py-0.5 text-xs text-foreground">
                  NEXT_PUBLIC_KKFILEVIEW_URL
                </code>
                ，原文件依赖
                <code className="mx-1 rounded bg-background px-1.5 py-0.5 text-xs text-foreground">
                  NEXT_PUBLIC_STATIC_BASE_URL
                </code>
                ；任一缺失时都会把原因写在操作区。
              </p>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>
    </MotionStagger>
  );
};
