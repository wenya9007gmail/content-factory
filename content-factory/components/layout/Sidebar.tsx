import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "概览" },
  { href: "/factory", label: "内容工厂" },
  { href: "/settings", label: "设置" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-white/5 border-r border-white/10 p-6 space-y-6">
      <div>
        <div className="text-lg font-bold">内容工厂</div>
        <p className="text-xs text-zinc-400 mt-1">多账号矩阵 · 成本中心</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
