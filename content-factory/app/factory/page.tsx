import { listPersonas } from "@/lib/repositories/personas";
import { listTopics } from "@/lib/repositories/topics";
import PipelineProgress from "@/components/factory/PipelineProgress";
import TopicTable from "@/components/factory/TopicTable";
import PersonaSelector from "@/components/factory/PersonaSelector";
import CostBanner from "@/components/cost/CostBanner";

async function loadData() {
  const personas = await listPersonas();
  const persona = personas[0];
  const topics = persona ? await listTopics(persona.id) : [];
  return { personas, persona, topics };
}

export default async function FactoryPage() {
  const { personas, persona, topics } = await loadData();
  return (
    <div className="min-h-screen bg-[#03030b] text-zinc-100 p-6 space-y-6">
      <CostBanner personaId={persona?.id} />
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-400">当前人设</p>
            <h1 className="text-2xl font-bold">{persona?.name ?? "未选择"}</h1>
          </div>
          <PersonaSelector personas={personas} />
        </div>
        <PipelineProgress />
      </section>
      <section className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">选题仓库</h2>
            <p className="text-xs text-zinc-400">支持 Tavily / Exa 调研热度</p>
          </div>
          <form className="flex gap-3">
            <input name="keyword" placeholder="输入关键词..." className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm" />
            <button className="rounded-xl bg-orange-500/80 px-4 py-2 text-sm font-semibold">AI 生成选题</button>
          </form>
        </div>
        <TopicTable topics={topics} />
      </section>
    </div>
  );
}
