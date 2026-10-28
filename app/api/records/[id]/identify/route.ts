import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { getDiscogsRelease } from "@/lib/discogs";

type Ctx = { params: Promise<{ id: string }> };

// Rellena la ficha con los datos de una release de Discogs y reemplaza el tracklist.
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { discogs_release_id } = (await req.json()) as { discogs_release_id: number };
  const rel = await getDiscogsRelease(Number(discogs_release_id));
  const supabase = getServerSupabase();

  const { data: current } = await supabase.from("records").select("cover_url").eq("id", id).single();
  const { error } = await supabase
    .from("records")
    .update({
      artist: rel.artist,
      title: rel.title,
      year: rel.year,
      label: rel.label,
      catalog_number: rel.catalog_number,
      format_size: rel.format_size,
      format_description: rel.format_description,
      genres: rel.genres,
      discogs_release_id: rel.discogs_release_id,
      cover_url: current?.cover_url ?? rel.cover_remote,
      status: "identified",
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("tracks").delete().eq("record_id", id);
  if (rel.tracks.length > 0) {
    const { error: tErr } = await supabase
      .from("tracks")
      .insert(rel.tracks.map((t) => ({ ...t, record_id: id })));
    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, tracks: rel.tracks.length });
}
