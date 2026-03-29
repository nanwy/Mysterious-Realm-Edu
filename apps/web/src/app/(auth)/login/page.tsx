import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_32%),linear-gradient(180deg,_#f8fcff,_#edf4ff)] px-4 py-12">
      <div className="w-full max-w-5xl rounded-[36px] border border-white/80 bg-white/90 p-4 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[30px] bg-[linear-gradient(135deg,_#082f49,_#155e75,_#cffafe)] px-6 py-8 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100">Account Access</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold">云学考学员登录</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-cyan-50/90">
              这里会接入旧项目的验证码、登录、部门切换与重定向逻辑。当前先提供 Next.js 版登录壳层，后续直接挂接既有 `/auth/login` 与验证码接口。
            </p>
          </section>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
