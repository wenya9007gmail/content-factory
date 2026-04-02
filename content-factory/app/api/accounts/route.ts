import { NextResponse } from "next/server";
import { z } from "zod";
import { createAccount, listAccounts } from "@/lib/repositories/accounts";

const createSchema = z.object({
  persona_id: z.string().uuid(),
  platform: z.string(),
  handle: z.string(),
  auth: z.record(z.any()).default({}),
  daily_limit: z.number().default(10),
  status: z.string().default("active"),
});

export async function GET(req: Request) {
  const personaId = new URL(req.url).searchParams.get("personaId") ?? undefined;
  const accounts = await listAccounts(personaId);
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const payload = createSchema.parse(await req.json());
  const account = await createAccount(payload);
  return NextResponse.json(account);
}
