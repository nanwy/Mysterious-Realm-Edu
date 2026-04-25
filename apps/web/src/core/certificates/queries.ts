"use client";

import { queryOptions } from "@tanstack/react-query";
import { fetchCertificates } from "./api";
import type { CertificateFiltersState } from "./types";

export const certificateKeys = {
  all: ["certificates"] as const,
  list: (filters: CertificateFiltersState) =>
    [
      ...certificateKeys.all,
      "list",
      filters.certificateType,
      filters.pageNo,
      filters.pageSize,
    ] as const,
};

export const certificateQueryOptions = {
  list: (filters: CertificateFiltersState) =>
    queryOptions({
      queryKey: certificateKeys.list(filters),
      queryFn: () => fetchCertificates(filters),
    }),
};
