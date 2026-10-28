import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { normalizeWish, num } from "@/lib/records";

export async function GET() {
  const { data, error } = await getServerSupabase()
    .from("wishlist_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: (data ?? []).map(normalizeWish) });
}

export async function POST(req: NextRequest) {
  const b = (await req.json()) as Record<string, unknown>;
  const artist = String(b.artist ?? "").trim();
  const title = String(b.title ?? "").trim();
  if (!artist || !title) return NextResponse.json({ error: "Artista y título son obligatorios" }, { status: 400 });
  const { data, error } = await getServerSupabase()
    .from("wishlist_items")
    .insert({
      artist,
      title,
      discogs_release_id: num(b.discogs_release_id),
      format_size: ["7", "10", "12"].includes(String(b.format_size)) ? String(b.format_size) : null,
      format_description: (b.format_description as string) || null,
      cover_url: (b.cover_url as string) || null,
      max_price: num(b.max_price),
      min_condition: (b.min_condition as string) || null,
      notes: (b.notes as string) || null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: normalizeWish(data) }, { status: 201 });
}
