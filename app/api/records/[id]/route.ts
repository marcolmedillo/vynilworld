import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { normalizeRecord, recordPayload } from "@/lib/records";
import type { Track } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { data, error } = await getServerSupabase()
    .from("records")
    .select("*, tracks(*)")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Disco no encontrado" }, { status: 404 });
  const record = normalizeRecord(data);
  record.tracks = ((data.tracks ?? []) as Track[]).sort(
    (a, b) => a.side.localeCompare(b.side) || a.position - b.position
  );
  return NextResponse.json({ record });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const payload = recordPayload((await req.json()) as Record<string, unknown>);
  const { data, error } = await getServerSupabase()
    .from("records")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ record: normalizeRecord(data) });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = getServerSupabase();
  const { data: rec } = await supabase.from("records").select("cover_path").eq("id", id).single();
  if (rec?.cover_path) await supabase.storage.from("covers").remove([rec.cover_path]);
  const { error } = await supabase.from("records").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
