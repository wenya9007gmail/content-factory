"use client";

import { useState, useTransition } from "react";

export default function ProviderLimitsForm({ personaId }: { personaId: string }) {
  const [limit, setLimit] = useState(5000);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const submit = () => {
    startTransition(async () => {
      const res = await fetch("/api/cost", {
        method: "POST",
        body: JSON.stringify({ persona_id: personaId, daily_limit: limit }),
      });
      if (res.ok) {
        setMessage("已更新");
      } else {
        setMessage("更新失败");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 p-4 space-y-3 bg-white/[0.02]">
      <p className="text-sm font-semibold">调整限额</p>
      <input
        type="number"
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm"
      />
      <button
        onClick={submit}
        disabled={pending}
        className="w-full rounded-xl bg-orange-500/80 py-2 text-sm font-semibold"
      >
        {pending ? "保存中…" : "保存"}
      </button>
      {message && <p className="text-xs text-zinc-400">{message}</p>}
    </div>
  );
}
