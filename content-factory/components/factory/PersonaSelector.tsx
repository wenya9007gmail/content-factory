"use client";

import type { Database } from "@/lib/types";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

export default function PersonaSelector({ personas }: { personas: Persona[] }) {
  return (
    <select className="rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm">
      {personas.map((p) => (
        <option key={p.id}>{p.name}</option>
      ))}
    </select>
  );
}
