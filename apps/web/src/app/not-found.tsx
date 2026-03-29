export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">404</p>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-slate-950">页面暂未接入</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          当前路由已经预留在 Next.js 工程中，但具体业务内容会按迁移优先级逐步补齐。
        </p>
      </div>
    </main>
  );
}

