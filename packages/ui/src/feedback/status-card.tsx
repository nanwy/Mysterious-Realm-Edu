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
    <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{hint}</p>
    </div>
  );
}

