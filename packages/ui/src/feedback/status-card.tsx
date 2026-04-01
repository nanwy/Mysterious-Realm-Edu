export function StatusCard({
  title,
  hint,
  value,
}: {
  title: string;
  hint: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-card/75 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="text-muted-foreground text-sm">{title}</p>
      <p className="text-foreground mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-muted-foreground mt-2 text-sm">{hint}</p>
    </div>
  );
}
