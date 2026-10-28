"use client";

import { useState, type FormEvent } from "react";
import type { DiscogsHit, Track } from "@/lib/types";

function TracklistDropdown({ releaseId }: { releaseId: number }) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    if (!e.currentTarget.open || tracks || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/discogs/release/${releaseId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo cargar el tracklist");
      setTracks(data.release.tracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const bySide = (tracks ?? []).reduce<Record<string, Track[]>>((acc, t) => {
    (acc[t.side] ??= []).push(t);
    return acc;
  }, {});

  return (
    <details onToggle={onToggle} className="mt-2 text-xs">
      <summary className="cursor-pointer text-neon-cyan hover:text-neon-gold">Ver tracklist</summary>
      <div className="mt-2 space-y-2 rounded-lg border border-neon-violet/40 bg-black/50 p-2">
        {loading && <p className="text-purple-300/70">Cargando…</p>}
        {error && <p className="text-neon-pink">{error}</p>}
        {tracks && tracks.length === 0 && <p className="text-purple-300/70">Sin tracklist en Discogs.</p>}
        {Object.entries(bySide).map(([side, list]) => (
          <div key={side}>
            <p className="font-sign text-neon-gold">Cara {side}</p>
            <ol className="space-y-0.5">
              {list.map((t) => (
                <li key={`${side}-${t.position}`} className="flex justify-between gap-2">
                  <span>{t.position}. {t.title}</span>
                  <span className="text-purple-300/70">{t.duration}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </details>
  );
}

export default function DiscogsSearch({
  onPick,
  buttonLabel = "Elegir",
  showTracks = false,
}: {
  onPick: (releaseId: number) => void | Promise<void>;
  buttonLabel?: string;
  showTracks?: boolean;
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
          <li key={h.id} className="rounded-xl border border-neon-violet/50 bg-black/40 p-3">
            <div className="flex items-center gap-3">
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
            </div>
            {showTracks && <TracklistDropdown releaseId={h.id} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
