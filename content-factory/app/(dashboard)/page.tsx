import { listPersonas } from "@/lib/repositories/personas";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

export const dynamic = "force-dynamic";

type TaskStatusRow = Pick<Database["public"]["Tables"]["tasks"]["Row"], "status">;

async function getStats() {
  const personas = await listPersonas();
  const supabase = getServerSupabase();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("status");
  return {
    personas,
    tasks: (tasks ?? []) as TaskStatusRow[],
  };
}

export default async function DashboardHome() {
  const { personas, tasks } = await getStats();
  const running = tasks.filter((t) => t.status === "running").length;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 p-6 bg-white/[0.03]">
          <p className="text-xs text-zinc-400">人设数量</p>
          <p className="text-3xl font-bold">{personas.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 p-6 bg-white/[0.03]">
          <p className="text-xs text-zinc-400">运行中任务</p>
          <p className="text-3xl font-bold text-orange-300">{running}</p>
        </div>
        <div className="rounded-2xl border border-white/10 p-6 bg-white/[0.03]">
          <p className="text-xs text-zinc-400">已完成任务</p>
          <p className="text-3xl font-bold text-green-300">{done}</p>
        </div>
      </section>
      <section className="rounded-2xl border border-white/10 p-6 bg-white/[0.02]">
        <h2 className="text-lg font-semibold mb-4">人设列表</h2>
        <div className="space-y-3">
          {personas.map((persona) => (
            <div key={persona.id} className="flex justify-between items-center border border-white/5 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium">{persona.name}</p>
                <p className="text-xs text-zinc-400">{persona.tagline}</p>
              </div>
              <div className="text-xs text-zinc-400">{persona.target_platforms?.join(", ")}</div>
            </div>
          ))}
          {personas.length === 0 && <p className="text-sm text-zinc-500">暂时没有人设，先去内容工厂创建一个吧。</p>}
        </div>
      </section>
    </div>
  );
}
