export function resolveMediaUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_STATIC_BASE_URL;
  if (!base) return path;

  return `${base.replace(/\/$/, "")}/common/static/${path.replace(/^\//, "")}`;
}

export function toText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export interface CertificateMediaResolution {
  url: string | null;
  reason: string | null;
}

function encodePreviewSource(url: string) {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(url);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(url, "utf8").toString("base64");
  }

  throw new Error("Base64 encoder unavailable.");
}

export function resolveCertificateDownloadUrl(path?: string | null): CertificateMediaResolution {
  if (!path || !path.trim()) {
    return {
      url: null,
      reason: "证书文件路径缺失，当前无法下载。",
    };
  }

  if (/^https?:\/\//.test(path) || path.startsWith("/")) {
    return {
      url: path,
      reason: null,
    };
  }

  const base = process.env.NEXT_PUBLIC_STATIC_BASE_URL;
  if (!base) {
    return {
      url: null,
      reason: "未配置 NEXT_PUBLIC_STATIC_BASE_URL，当前无法定位证书原文件。",
    };
  }

  return {
    url: `${base.replace(/\/$/, "")}/common/static/${path.replace(/^\//, "")}`,
    reason: null,
  };
}

export function resolveCertificatePreviewUrl(path?: string | null): CertificateMediaResolution {
  const fileResolution = resolveCertificateDownloadUrl(path);
  if (!fileResolution.url) {
    return fileResolution;
  }

  const previewBase = process.env.NEXT_PUBLIC_KKFILEVIEW_URL;
  if (!previewBase) {
    return {
      url: null,
      reason: "未配置 NEXT_PUBLIC_KKFILEVIEW_URL，当前仅支持下载证书原文件。",
    };
  }

  return {
    url: `${previewBase}${encodeURIComponent(encodePreviewSource(fileResolution.url))}`,
    reason: null,
  };
}
