import { brand, cn } from "@workspace/shared";

export function AppLogo({
  compact = false,
  logoPath = "/logo.png",
}: {
  compact?: boolean;
  logoPath?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(8,30,66,0.08)] ring-1 ring-slate-200/80">
        <img src={logoPath} alt={brand.name} width={34} height={34} />
      </div>
      <div className={cn("min-w-0", compact && "hidden sm:block")}>
        <p className="font-serif text-lg font-semibold tracking-[0.02em] text-slate-900 dark:text-white">
          {brand.name}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{brand.slogan}</p>
      </div>
    </div>
  );
}
