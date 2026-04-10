import { summarizeCost } from "@/lib/repositories/costLogs";
import { sumDailyLimit } from "@/lib/repositories/accounts";

export default async function UsageCard({ personaId }: { personaId: string }) {
  const used = await summarizeCost(personaId);
  const limit = await sumDailyLimit(personaId);
  const percent = limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="rounded-2xl border border-white/10 p-4 space-y-2 bg-white/[0.02]">
      <p className="text-xs text-zinc-400">成本使用率</p>
      <div className="flex justify-between text-sm">
        <span>¥{(used / 100).toFixed(2)}</span>
        <span className="text-zinc-400">限额 ¥{(limit / 100).toFixed(2)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5">
        <div className="h-2 rounded-full bg-orange-400" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-zinc-400">{percent}% 已使用</p>
    </div>
  );
}
