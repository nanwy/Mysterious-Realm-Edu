"use client";

import { MotionReveal } from "@workspace/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui";
import {
  AlertCircle,
  Download,
  Eye,
  FileBadge2,
  RefreshCcw,
} from "lucide-react";
import type { CertificateRecord } from "@/core/certificates";

const openInNewTab = (url: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

const CertificatesLoadingState = () => {
  return (
    <div className="grid gap-3" data-testid="certificates-loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[24px] border border-border bg-card/90 p-5"
        >
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
};

const CertificateTable = ({ records }: { records: CertificateRecord[] }) => {
  return (
    <MotionReveal direction="up">
      <div
        className="overflow-hidden rounded-[24px] border border-border bg-card/90"
        data-testid="certificates-list"
      >
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
                      <p className="text-xs leading-6 text-muted-foreground">
                        {record.actionHint}
                      </p>
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
};

interface CertificatesResultsProps {
  records: CertificateRecord[];
  loading: boolean;
  error: string | null;
  emptyLabel: string;
  onRetry: () => void;
}

export const CertificatesResults = ({
  records,
  loading,
  error,
  emptyLabel,
  onRetry,
}: CertificatesResultsProps) => {
  if (loading) {
    return <CertificatesLoadingState />;
  }

  if (error) {
    return (
      <div className="grid gap-4">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>证书接口暂不可用</AlertTitle>
          <AlertDescription>
            当前无法加载{emptyLabel}证书：{error}。请确认已登录且接口环境可访问后重试。
          </AlertDescription>
        </Alert>
        <div>
          <Button type="button" onClick={onRetry}>
            <RefreshCcw className="size-4" />
            重试加载
          </Button>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        title="暂无证书"
        description={`当前分类下没有可展示的${
          emptyLabel === "全部" ? "" : emptyLabel
        }证书。`}
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3 rounded-[24px] border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <FileBadge2 className="mt-0.5 size-4 shrink-0" />
        <p className="leading-6">
          若在线预览地址未配置，页面会禁用“预览证书”并保留说明；若静态文件地址未配置，则“下载证书”也会显示降级提示，不会让页面直接报错。
        </p>
      </div>
      <CertificateTable records={records} />
    </div>
  );
};
