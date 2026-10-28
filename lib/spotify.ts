let cached: { token: string; expires: number } | null = null;

export async function getSpotifyToken(): Promise<string> {
  if (cached && cached.expires > Date.now() + 30_000) return cached.token;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Faltan SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify rechazó las credenciales (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artist: string;
  url: string;
}

export async function findSpotifyAlbum(artist: string, title: string): Promise<SpotifyAlbum | null> {
  const token = await getSpotifyToken();
  const q = `album:${title} artist:${artist}`;
  const res = await fetch(
    `https://api.spotify.com/v1/search?type=album&limit=5&q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Spotify search respondió ${res.status}`);
  const data = (await res.json()) as {
    albums: { items: { id: string; name: string; artists: { name: string }[]; external_urls: { spotify: string } }[] };
  };
  const first = data.albums.items[0];
  if (!first) return null;
  return {
    id: first.id,
    name: first.name,
    artist: first.artists.map((a) => a.name).join(", "),
    url: first.external_urls.spotify,
  };
}
