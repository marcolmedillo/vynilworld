import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { normalizeRecord } from "@/lib/records";
import { findSpotifyAlbum } from "@/lib/spotify";

type Ctx = { params: Promise<{ id: string }> };

// Busca el álbum en Spotify por artista y título y guarda su id.
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = getServerSupabase();
  const body = (await req.json().catch(() => ({}))) as { spotify_album_id?: string };

  let spotifyId = body.spotify_album_id ?? null;
  if (!spotifyId) {
    const { data: rec, error } = await supabase.from("records").select("artist,title").eq("id", id).single();
    if (error || !rec) return NextResponse.json({ error: "Disco no encontrado" }, { status: 404 });
    const found = await findSpotifyAlbum(rec.artist, rec.title);
    if (!found) return NextResponse.json({ error: "Spotify no encontró este álbum" }, { status: 404 });
    spotifyId = found.id;
  }

  const { data, error } = await supabase
    .from("records")
    .update({ spotify_album_id: spotifyId })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ record: normalizeRecord(data) });
}
