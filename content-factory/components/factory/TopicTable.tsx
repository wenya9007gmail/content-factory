"use client";

import type { Database } from "@/lib/types";

type Topic = Database["public"]["Tables"]["topics"]["Row"];

export default function TopicTable({ topics }: { topics: Topic[] }) {
  return (
    <div className="divide-y divide-white/5 border border-white/10 rounded-2xl">
      {topics.map((topic) => (
        <div key={topic.id} className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{topic.title}</p>
            <p className="text-xs text-zinc-500">{topic.brief}</p>
          </div>
          <span className="text-xs text-orange-300">{topic.status}</span>
        </div>
      ))}
      {topics.length === 0 && (
        <div className="p-4 text-sm text-zinc-500">还没有选题，试试上方 Tavily 查询。</div>
      )}
    </div>
  );
}
