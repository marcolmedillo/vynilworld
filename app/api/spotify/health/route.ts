import { NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/spotify";

// Valida que las credenciales de Spotify funcionan de verdad (token + una búsqueda).
export async function GET() {
  try {
    const token = await getSpotifyToken();
    const res = await fetch("https://api.spotify.com/v1/search?type=album&limit=1&q=abbey%20road", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Spotify search respondió ${res.status}`);
    const data = (await res.json()) as { albums: { items: { name: string }[] } };
    return NextResponse.json({ spotify: { ok: true, sample: data.albums.items[0]?.name ?? null } });
  } catch (e) {
    return NextResponse.json({ spotify: { ok: false, error: e instanceof Error ? e.message : "Error" } });
  }
}
