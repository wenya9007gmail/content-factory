import { NextResponse } from "next/server";
import { z } from "zod";
import { createPersona, listPersonas } from "@/lib/repositories/personas";

const schema = z.object({
  name: z.string().min(1),
  avatar_url: z.string().optional(),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  tone: z.record(z.any()).optional(),
  target_platforms: z.array(z.string()).default([]),
});

export async function GET() {
  const personas = await listPersonas();
  return NextResponse.json(personas);
}

export async function POST(req: Request) {
  const body = await req.json();
  const payload = schema.parse(body);
  const persona = await createPersona({
    avatar_url: payload.avatar_url ?? null,
    bio: payload.bio ?? null,
    tagline: payload.tagline ?? null,
    tone: payload.tone ?? {},
    target_platforms: payload.target_platforms,
    name: payload.name,
  });
  return NextResponse.json(persona);
}
