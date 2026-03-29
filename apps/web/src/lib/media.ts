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

