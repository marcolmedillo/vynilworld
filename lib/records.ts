import type { FormatSize, RecordItem, WishlistItem } from "./types";

export function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeRecord(r: Record<string, any>): RecordItem {
  return {
    ...r,
    year: num(r.year),
    discogs_release_id: num(r.discogs_release_id),
    purchase_price: num(r.purchase_price),
    genres: r.genres ?? [],
  } as RecordItem;
}

export function normalizeWish(w: Record<string, any>): WishlistItem {
  return {
    ...w,
    discogs_release_id: num(w.discogs_release_id),
    max_price: num(w.max_price),
    lowest_price: num(w.lowest_price),
    listings_count: num(w.listings_count),
  } as WishlistItem;
}

const STRING_FIELDS = [
  "artist", "title", "label", "catalog_number", "format_description", "edition",
  "cover_url", "purchase_date", "purchase_place", "condition", "comments", "spotify_album_id",
];
const NUMBER_FIELDS = ["year", "discogs_release_id", "purchase_price"];
const ALL_FIELDS = [...STRING_FIELDS, ...NUMBER_FIELDS, "format_size", "genres"];

export function recordPayload(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of ALL_FIELDS) {
    if (!(key in body)) continue;
    const v = body[key];
    if (key === "genres") {
      out[key] = Array.isArray(v)
        ? v.map(String).filter(Boolean)
        : String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    } else if (NUMBER_FIELDS.includes(key)) {
      out[key] = num(v);
    } else if (key === "format_size") {
      out[key] = ["7", "10", "12"].includes(String(v)) ? (String(v) as FormatSize) : null;
    } else {
      const s = v === null || v === undefined ? "" : String(v).trim();
      out[key] = s === "" ? null : s;
    }
  }
  return out;
}
