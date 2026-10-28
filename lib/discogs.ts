import type { DiscogsHit, FormatSize, Listing, MappedRelease, Track } from "./types";

const BASE = "https://api.discogs.com";

function authHeaders(): HeadersInit {
  const token = process.env.DISCOGS_TOKEN;
  if (!token) throw new Error("Falta DISCOGS_TOKEN en las variables de entorno");
  return {
    Authorization: `Discogs token=${token}`,
    "User-Agent": process.env.DISCOGS_USER_AGENT ?? "Vynilworld/0.1",
  };
}

async function discogsGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`Discogs respondió ${res.status} en ${path}`);
  return (await res.json()) as T;
}

export async function searchDiscogs(q: string): Promise<DiscogsHit[]> {
  const data = await discogsGet<{ results: DiscogsHit[] }>(
    `/database/search?type=release&format=Vinyl&per_page=10&q=${encodeURIComponent(q)}`
  );
  return data.results;
}

interface DiscogsRelease {
  id: number;
  title: string;
  year?: number;
  artists?: { name: string }[];
  labels?: { name: string; catno: string }[];
  formats?: { name: string; qty?: string; descriptions?: string[] }[];
  genres?: string[];
  styles?: string[];
  tracklist?: { position: string; title: string; duration: string }[];
  images?: { uri: string; type: string }[];
}

function sizeFrom(descs: string[]): FormatSize | null {
  const joined = descs.join(" ");
  if (joined.includes('12"')) return "12";
  if (joined.includes('10"')) return "10";
  if (joined.includes('7"')) return "7";
  return null;
}

function sideOf(position: string): string {
  const m = position.match(/^([A-Za-z]+)\d*$/);
  return m ? m[1].toUpperCase() : "-";
}

export async function getDiscogsRelease(id: number): Promise<MappedRelease> {
  const r = await discogsGet<DiscogsRelease>(`/releases/${id}`);
  const formats = r.formats ?? [];
  const descs = formats.flatMap((f) => [f.name, ...(f.descriptions ?? [])]);
  const counters: Record<string, number> = {};
  const tracks: Track[] = (r.tracklist ?? [])
    .filter((t) => t.title)
    .map((t) => {
      const side = sideOf(t.position);
      counters[side] = (counters[side] ?? 0) + 1;
      return { side, position: counters[side], title: t.title, duration: t.duration || null };
    });
  const fmt = formats[0];
  const label = r.labels?.[0];
  return {
    discogs_release_id: r.id,
    artist: (r.artists ?? []).map((a) => a.name.replace(/\s\(\d+\)$/, "")).join(", ") || "Desconocido",
    title: r.title,
    year: r.year || null,
    label: label?.name ?? null,
    catalog_number: label?.catno ?? null,
    format_size: sizeFrom(descs),
    format_description: fmt
      ? [fmt.qty && fmt.qty !== "1" ? `${fmt.qty}x` : null, fmt.name, ...(fmt.descriptions ?? [])]
          .filter(Boolean)
          .join(" ")
      : null,
    genres: [...(r.genres ?? []), ...(r.styles ?? [])],
    cover_remote: r.images?.find((i) => i.type === "primary")?.uri ?? r.images?.[0]?.uri ?? null,
    tracks,
  };
}

interface DiscogsListingsResponse {
  pagination: { items: number };
  listings: {
    id: number;
    price: { value: number; currency: string };
    condition: string;
    seller: { username: string };
    uri: string;
  }[];
}

export async function getListings(releaseId: number): Promise<{ count: number; cheapest: Listing[] }> {
  const data = await discogsGet<DiscogsListingsResponse>(
    `/marketplace/listings?release_id=${releaseId}&status=For%20Sale&sort=price&sort_order=asc&per_page=5`
  );
  return {
    count: data.pagination.items,
    cheapest: data.listings.map((l) => ({
      id: l.id,
      price: l.price.value,
      currency: l.price.currency,
      condition: l.condition,
      seller: l.seller.username,
      url: `https://www.discogs.com${l.uri}`,
    })),
  };
}
