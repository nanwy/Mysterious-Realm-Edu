"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  fetchOnlineInvigilateUserProfile,
  getExamWatermarkContent,
  getOnlineInvigilateConfig,
  getOnlineInvigilateEnabled,
  type OnlineInvigilateUserProfile,
} from "@/core/exams";
import type { ExamOnlineSession } from "@/core/exams";

interface OnlineExamWatermarkProps {
  session: ExamOnlineSession;
  profile: OnlineInvigilateUserProfile | null | undefined;
  profileError: boolean;
  children: ReactNode;
}

export const useOnlineInvigilateProfile = (session: ExamOnlineSession) =>
  useQuery({
    queryKey: ["exams", "online", "invigilate-profile", session.userExamId],
    queryFn: () => fetchOnlineInvigilateUserProfile(),
    enabled: getOnlineInvigilateEnabled(session),
    staleTime: 5 * 60 * 1000,
  });

export const OnlineExamWatermark = ({
  session,
  profile,
  profileError,
  children,
}: OnlineExamWatermarkProps) => {
  const config = getOnlineInvigilateConfig(session.detail);
  const content = getExamWatermarkContent({
    enabled: Boolean(session.detail?.watermarkEnable),
    profile,
  });

  if (!content) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[2rem]">
        <div className="grid h-full min-h-[42rem] grid-cols-3 gap-10 opacity-15 sm:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 60 }, (_, index) => (
            <span
              className="select-none self-center justify-self-center whitespace-nowrap text-sm font-semibold text-slate-500 [transform:rotate(-28deg)]"
              key={`${content}-${index}`}
            >
              {content}
            </span>
          ))}
        </div>
      </div>
      {(config.snapOn || config.invigilateEnable) && profileError ? (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          监考用户信息获取失败，水印与监考大屏连接可能不可用。
        </div>
      ) : null}
    </div>
  );
};
