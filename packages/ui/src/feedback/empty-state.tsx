export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-border/80 bg-muted/90 px-6 py-12 text-center">
      {Icon ? (
        <Icon className="mx-auto mb-4 size-8 text-muted-foreground" />
      ) : null}
      <p className="text-foreground text-lg font-medium">{title}</p>
      <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm leading-7">
        {description}
      </p>
      {actions ? (
        <div className="mt-6 flex justify-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
