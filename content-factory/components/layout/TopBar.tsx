export default function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-10 py-4 bg-white/[0.02]">
      <div>
        <p className="text-xs uppercase text-orange-400 tracking-wide">矩阵看板</p>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>
      <div className="text-sm text-zinc-400">余额状态：<span className="text-green-400">正常</span></div>
    </header>
  );
}
