import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { normalizeRecord, recordPayload } from "@/lib/records";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim().replace(/[,()]/g, " ");
  const format = sp.get("format");
  const genre = sp.get("genre");
  const sort = sp.get("sort") ?? "created";
  const sortMap: Record<string, { col: string; asc: boolean }> = {
    created: { col: "created_at", asc: false },
    artist: { col: "artist", asc: true },
    title: { col: "title", asc: true },
    year: { col: "year", asc: false },
  };
  const s = sortMap[sort] ?? sortMap.created;

  let query = getServerSupabase().from("records").select("*");
  if (q) query = query.or(`artist.ilike.%${q}%,title.ilike.%${q}%,label.ilike.%${q}%`);
  if (format) query = query.eq("format_size", format);
  if (genre) query = query.contains("genres", [genre]);

  const { data, error } = await query.order(s.col, { ascending: s.asc, nullsFirst: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: (data ?? []).map(normalizeRecord) });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const payload = recordPayload(body);
  if (!payload.artist || !payload.title) {
    return NextResponse.json({ error: "Artista y título son obligatorios" }, { status: 400 });
  }
  const { data, error } = await getServerSupabase()
    .from("records")
    .insert({ ...payload, status: "identified" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ record: normalizeRecord(data) }, { status: 201 });
}
