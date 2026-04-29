"use client";

import { queryOptions } from "@tanstack/react-query";
import type { CertificateListRequest } from "@workspace/api";
import { fetchCertificates } from "./api";

export const certificateKeys = {
  all: ["certificates"] as const,
  list: (filters: CertificateListRequest) =>
    [
      ...certificateKeys.all,
      "list",
      filters.certificateType,
      filters.pageNo,
      filters.pageSize,
    ] as const,
};

export const certificateQueryOptions = {
  list: (filters: CertificateListRequest) =>
    queryOptions({
      queryKey: certificateKeys.list(filters),
      queryFn: () => fetchCertificates(filters),
    }),
};
