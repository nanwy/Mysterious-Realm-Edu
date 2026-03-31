import { brand, cn } from "@workspace/shared";

export function AppLogo({
  compact = false,
  logoPath = "https://img.chuzelab.com/images/logo/megrez.png",
}: {
  compact?: boolean;
  logoPath?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-card shadow-[0_12px_30px_rgba(91,75,255,0.08)] ring-1 ring-border">
        <img src={logoPath} alt={brand.name} width={34} height={34} />
      </div>
      <div className={cn("min-w-0", compact && "hidden lg:block md:hidden sm:block")}>
        <p className="font-serif text-lg font-semibold tracking-[0.02em] text-foreground">
          {brand.name}
        </p>
        <p className="text-sm text-muted-foreground">{brand.slogan}</p>
      </div>
    </div>
  );
}
