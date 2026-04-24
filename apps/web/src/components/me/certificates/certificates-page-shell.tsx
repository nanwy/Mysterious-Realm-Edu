"use client";

import { getUserCertificateList, unwrapEnvelope } from "@workspace/api";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  EmptyState,
  Skeleton,
  SurfaceCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui";
import {
  AlertCircle,
  Download,
  Eye,
  FileBadge2,
  GraduationCap,
  RefreshCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ResultsPagination } from "@/components/common/results-pagination";
import {
  resolveCertificateDownloadUrl,
  resolveCertificatePreviewUrl,
  toText,
} from "@/lib/media";
import { toNumberOrFallback, toRecordOrEmpty } from "@/lib/normalize";

type CertificateTab = "all" | "study" | "exam";
type CertificateType = "" | "1" | "2";

interface CertificatesQuery {
  tab: CertificateTab;
  pageNo: number;
  pageSize: number;
  certificateType: CertificateType;
}

interface CertificateRecord {
  id: string;
  userName: string;
  certificateName: string;
  certificateTypeLabel: string;
  examName: string;
  courseName: string;
  issueTime: string;
  previewUrl: string | null;
  downloadUrl: string | null;
  actionHint: string | null;
}

interface CertificateListPayload {
  records?: unknown[];
  total?: number;
}

const TABS: Array<{
  value: CertificateTab;
  label: string;
  certificateType: CertificateType;
}> = [
  { value: "all", label: "全部", certificateType: "" },
  { value: "study", label: "学习证书", certificateType: "1" },
  { value: "exam", label: "考试证书", certificateType: "2" },
];

const DEFAULT_QUERY: CertificatesQuery = {
  tab: "all",
  pageNo: 1,
  pageSize: 10,
  certificateType: "",
};

function getTabMeta(tab: string) {
  return TABS.find((item) => item.value === tab) ?? TABS[0];
}

function getErrorMessage(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "证书接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前只能展示错误说明，不能视为接口已打通。`;
  }

  if (message === "网络请求失败") {
    return "证书接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

function normalizeCertificateRecord(item: unknown, index: number): CertificateRecord {
  const record = toRecordOrEmpty(item);
  const certificatePath = toText(
    record.certificatePath ?? record.objectName ?? record.filePath,
    ""
  );
  const previewResolution = resolveCertificatePreviewUrl(certificatePath);
  const downloadResolution = resolveCertificateDownloadUrl(certificatePath);
  const identifier =
    record.id ??
    record.userCertificateId ??
    record.certificateId ??
    record.examId ??
    `certificate-${index + 1}`;

  return {
    id: String(identifier),
    userName: toText(record.userId_dictText ?? record.userName ?? record.realName, `学员 ${index + 1}`),
    certificateName: toText(
      record.certificateId_dictText ?? record.certificateName ?? record.title,
      `证书 ${index + 1}`
    ),
    certificateTypeLabel: toText(
      record.certificateType_dictText ?? record.certificateTypeName,
      "待补类型"
    ),
    examName: toText(record.examId_dictText ?? record.examName, "未关联考试"),
    courseName: toText(record.courseId_dictText ?? record.courseName, "未关联课程"),
    issueTime: toText(
      record.createTime ?? record.issueTime ?? record.updateTime,
      "待补发证时间"
    ),
    previewUrl: previewResolution.url,
    downloadUrl: downloadResolution.url,
    actionHint:
      previewResolution.reason ??
      downloadResolution.reason ??
      null,
  };
}

async function fetchCertificates(query: CertificatesQuery) {
  const response = await getUserCertificateList({
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    certificateType: query.certificateType,
  });
  const payload = unwrapEnvelope(response);
  const result =
    payload && typeof payload === "object"
      ? (payload as CertificateListPayload)
      : ({} as CertificateListPayload);
  const records = Array.isArray(result.records) ? result.records.map(normalizeCertificateRecord) : [];

  return {
    records,
    total: toNumberOrFallback(result.total, records.length),
  };
}

function CertificatesLoadingState() {
  return (
    <div className="grid gap-3" data-testid="certificates-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-border bg-card/90 p-5">
          <Skeleton style={{ height: 20, width: 112, borderRadius: 999 }} />
          <div className="mt-3">
            <Skeleton style={{ height: 16, width: 176, borderRadius: 999 }} />
          </div>
          <div className="mt-4">
            <Skeleton style={{ height: 64, width: "100%", borderRadius: 24 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function openInNewTab(url: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function CertificateTable({ records }: { records: CertificateRecord[] }) {
  return (
    <MotionReveal direction="up">
      <div className="overflow-hidden rounded-[24px] border border-border bg-card/90" data-testid="certificates-list">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户姓名</TableHead>
              <TableHead>证书名称</TableHead>
              <TableHead>证书类型</TableHead>
              <TableHead>考试名称</TableHead>
              <TableHead>课程名称</TableHead>
              <TableHead>发证时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.userName}</TableCell>
                <TableCell>{record.certificateName}</TableCell>
                <TableCell>{record.certificateTypeLabel}</TableCell>
                <TableCell>{record.examName}</TableCell>
                <TableCell>{record.courseName}</TableCell>
                <TableCell>{record.issueTime}</TableCell>
                <TableCell>
                  <div className="grid gap-2 py-1">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!record.previewUrl}
                        onClick={() => {
                          if (record.previewUrl) {
                            openInNewTab(record.previewUrl);
                          }
                        }}
                      >
                        <Eye className="size-4" />
                        预览证书
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!record.downloadUrl}
                        onClick={() => {
                          if (record.downloadUrl) {
                            openInNewTab(record.downloadUrl);
                          }
                        }}
                      >
                        <Download className="size-4" />
                        下载证书
                      </Button>
                    </div>
                    {record.actionHint ? (
                      <p className="text-xs leading-6 text-muted-foreground">{record.actionHint}</p>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MotionReveal>
  );
}

export function CertificatesPageShell() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchCertificates(query)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setRecords(result.records);
        setTotal(result.total);
        setError(null);
        setHasLoaded(true);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setRecords([]);
        setTotal(0);
        setError(getErrorMessage(requestError));
        setHasLoaded(true);
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, reloadVersion]);

  function handleTabChange(value: string) {
    const tab = getTabMeta(value);

    setQuery((current) => ({
      ...current,
      tab: tab.value,
      pageNo: 1,
      certificateType: tab.certificateType,
    }));
  }

  function handlePageChange(page: number) {
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const safePage = Math.min(Math.max(page, 1), pageCount);

    setQuery((current) => ({
      ...current,
      pageNo: safePage,
    }));
  }

  function handleRetry() {
    setReloadVersion((value) => value + 1);
  }

  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const currentTab = getTabMeta(query.tab);
  const staticConfigured = Boolean(process.env.NEXT_PUBLIC_STATIC_BASE_URL);
  const previewConfigured = Boolean(process.env.NEXT_PUBLIC_KKFILEVIEW_URL);

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
                  <p className="mt-3 text-2xl font-semibold text-foreground">{currentTab.label}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    切换分类会重置到第一页，并重新请求对应证书列表。
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal direction="up" delay={0.08}>
                <div className="rounded-[24px] border border-border bg-muted/40 p-5">
                  <p className="text-sm text-muted-foreground">列表状态</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {error ? "请求失败" : hasLoaded ? `${records.length} 条` : "加载中"}
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
              <Badge variant="outline">分页 {query.pageSize} 条/页</Badge>
              <Badge variant="outline">
                {staticConfigured ? "静态文件地址已配置" : "静态文件地址未配置"}
              </Badge>
              <Badge variant="outline">
                {previewConfigured ? "在线预览已配置" : "在线预览未配置"}
              </Badge>
            </div>

            <div data-testid="certificates-tabs">
              <Tabs value={query.tab} onValueChange={handleTabChange}>
                <TabsList aria-label="证书分类">
                  {TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {TABS.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value}>
                    <div className="sr-only">{tab.label}证书列表</div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </SurfaceCard>
      </MotionItem>

      <MotionItem>
        <SurfaceCard
          title={`${currentTab.label}证书列表`}
          description="列表保留 loading / empty / error 三种兜底状态；若证书原文件或在线预览地址未配置，会在操作区说明当前能做什么。"
        >
          <div className="grid gap-6">
            <div data-testid="certificates-list-region">
              {!hasLoaded || isLoading ? (
                <CertificatesLoadingState />
              ) : error ? (
                <div className="grid gap-4">
                  <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>证书接口暂不可用</AlertTitle>
                    <AlertDescription>
                      当前无法加载{currentTab.label}
                      证书：{error}。请确认已登录且接口环境可访问后重试。
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Button type="button" onClick={handleRetry}>
                      <RefreshCcw className="size-4" />
                      重试加载
                    </Button>
                  </div>
                </div>
              ) : records.length === 0 ? (
                <EmptyState
                  title="暂无证书"
                  description={`当前分类下没有可展示的${currentTab.label === "全部" ? "" : currentTab.label}证书。`}
                />
              ) : (
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 rounded-[24px] border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    <FileBadge2 className="mt-0.5 size-4 shrink-0" />
                    <p className="leading-6">
                      若在线预览地址未配置，页面会禁用“预览证书”并保留说明；若静态文件地址未配置，则“下载证书”也会显示降级提示，不会让页面直接报错。
                    </p>
                  </div>
                  <CertificateTable records={records} />
                </div>
              )}
            </div>

            <div data-testid="certificates-pagination">
              <ResultsPagination
                page={query.pageNo}
                pageCount={pageCount}
                total={total}
                pending={isLoading}
                itemLabel="张证书"
                onPageChange={handlePageChange}
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
}
