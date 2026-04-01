export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-border/80 bg-muted/90 px-6 py-12 text-center">
      <p className="text-foreground text-lg font-medium">{title}</p>
      <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-7">{description}</p>
    </div>
  );
}
