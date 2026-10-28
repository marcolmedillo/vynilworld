export type FormatSize = "7" | "10" | "12";

export interface Track {
  id?: string;
  side: string;
  position: number;
  title: string;
  duration: string | null;
}

export interface RecordItem {
  id: string;
  artist: string;
  title: string;
  year: number | null;
  label: string | null;
  catalog_number: string | null;
  format_size: FormatSize | null;
  format_description: string | null;
  edition: string | null;
  genres: string[];
  discogs_release_id: number | null;
  cover_url: string | null;
  cover_path: string | null;
  purchase_date: string | null;
  purchase_place: string | null;
  purchase_price: number | null;
  condition: string | null;
  comments: string | null;
  spotify_album_id: string | null;
  status: "identified" | "pending";
  created_at: string;
  tracks?: Track[];
}

export interface WishlistItem {
  id: string;
  artist: string;
  title: string;
  discogs_release_id: number | null;
  format_size: FormatSize | null;
  format_description: string | null;
  cover_url: string | null;
  max_price: number | null;
  currency: string;
  min_condition: string | null;
  notes: string | null;
  lowest_price: number | null;
  listings_count: number | null;
  last_checked_at: string | null;
  created_at: string;
}

export interface DiscogsHit {
  id: number;
  title: string;
  year?: string;
  label?: string[];
  format?: string[];
  thumb?: string;
}

export interface MappedRelease {
  discogs_release_id: number;
  artist: string;
  title: string;
  year: number | null;
  label: string | null;
  catalog_number: string | null;
  format_size: FormatSize | null;
  format_description: string | null;
  genres: string[];
  cover_remote: string | null;
  tracks: Track[];
}

export interface Listing {
  id: number;
  price: number;
  currency: string;
  condition: string;
  seller: string;
  url: string;
}
