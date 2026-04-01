import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_32%),linear-gradient(180deg,_#f8fcff,_#edf4ff)] px-4 py-12 dark:bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.35),_transparent_28%),linear-gradient(180deg,_#020617,_#0f172a)]">
      <div className="w-full max-w-5xl rounded-[36px] border border-white/80 bg-white/90 p-4 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[30px] bg-[linear-gradient(135deg,_#082f49,_#155e75,_#cffafe)] px-6 py-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100">Account Access</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold">云学考学员登录</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-cyan-50/90">
              登录页已对接旧项目认证接口，并补充了前端校验、成功提示和暗色主题适配。后续可以继续接入图片验证码与登录后重定向流程。
            </p>
            <div className="mt-8 grid gap-3 text-sm text-cyan-50/90 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="font-medium text-white">即时校验</p>
                <p className="mt-1 leading-6">缺失字段会在提交前直接提示，避免无效请求。</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="font-medium text-white">主题兼容</p>
                <p className="mt-1 leading-6">页面支持浅色与深色模式，并复用现有主题切换能力。</p>
              </div>
            </div>
          </section>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
