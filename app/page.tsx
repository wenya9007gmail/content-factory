export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#03030b] text-zinc-100">
      <main className="flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border border-white/5 bg-white/[0.03] p-10 text-center shadow-2xl">
        <div className="text-5xl">🏭</div>
        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
          内容变现工厂 V3
        </h1>
        <p className="text-sm text-zinc-400">
          你的八步内容流水线：IP定位 → 账号搭建 → 选题库 → 内容工厂 → 发布 → 数据 → 自动优化 → 变现追踪
        </p>
        <a
          href="/factory.html"
          className="rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:translate-y-0.5"
        >
          进入系统 →
        </a>
        <div className="text-xs text-zinc-500">
          已接入后端代理，可在 Vercel 部署并安全调用国内/海外 AI API
        </div>
      </main>
    </div>
  );
}
