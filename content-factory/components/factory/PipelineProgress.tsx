const steps = [
  "IP定位",
  "起名&头像",
  "对标选题",
  "内容生产",
  "发布",
  "数据分析",
  "自动学习",
  "变现追踪",
];

export default function PipelineProgress() {
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
      {steps.map((step, idx) => (
        <div key={step} className="text-center">
          <div className="w-9 h-9 rounded-full bg-orange-500/80 flex items-center justify-center text-sm font-bold mx-auto mb-2">
            {idx + 1}
          </div>
          <p className="text-xs text-zinc-400">{step}</p>
        </div>
      ))}
    </div>
  );
}
