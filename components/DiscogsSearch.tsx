"use client";

import { useState, type FormEvent } from "react";
import type { DiscogsHit } from "@/lib/types";

export default function DiscogsSearch({
  onPick,
  buttonLabel = "Elegir",
}: {
  onPick: (releaseId: number) => void | Promise<void>;
  buttonLabel?: string;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<DiscogsHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/discogs/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al buscar");
      setHits(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="flex gap-2">
        <input
          className="input"
          placeholder="Artista o álbum (ej. Daft Punk Discovery)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="neon-btn shrink-0" disabled={loading}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>
      {error && <p className="text-neon-pink">{error}</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {hits.map((h) => (
          <li key={h.id} className="flex items-center gap-3 rounded-xl border border-neon-violet/50 bg-black/40 p-3">
            {h.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={h.thumb} alt="" className="h-14 w-14 rounded object-cover" />
            ) : (
              <div className="h-14 w-14 rounded bg-black/70" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-purple-50">{h.title}</p>
              <p className="truncate text-xs text-purple-300/70">
                {[h.year, h.label?.[0], h.format?.join(", ")].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button className="neon-btn-pink shrink-0 px-3 py-1 text-sm" onClick={() => onPick(h.id)}>
              {buttonLabel}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
