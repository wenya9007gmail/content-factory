import { summarizeCost } from "@/lib/repositories/costLogs";

export default async function CostBanner({ personaId }: { personaId?: string }) {
  if (!personaId) return null;
  const total = await summarizeCost(personaId);
  const limit = Number(process.env.DEFAULT_IMAGE_BUDGET_CENTS ?? "500") * 10;
  const status = total > limit ? "余额不足" : "余额正常";
  const statusColor = total > limit ? "text-red-400" : "text-green-400";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 flex items-center justify-between text-sm">
      <div>
        <p className="text-xs text-zinc-400">成本中心</p>
        <p className="text-lg font-semibold">已用 ¥{(total / 100).toFixed(2)}</p>
      </div>
      <div className={`text-sm ${statusColor}`}>{status}</div>
    </div>
  );
}
