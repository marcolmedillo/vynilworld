"use client";

import { useEffect, useState } from "react";
import type { RecordItem } from "@/lib/types";

export default function Rockola() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [current, setCurrent] = useState<RecordItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/records?sort=artist");
      const data = await res.json();
      if (!res.ok) setMessage(data.error);
      else setRecords(data.records);
    })();
  }, []);

  async function matchSpotify(r: RecordItem) {
    setMessage("Buscando en Spotify…");
    const res = await fetch(`/api/records/${r.id}/spotify`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "No se encontró");
      return;
    }
    setRecords((prev) => prev.map((x) => (x.id === r.id ? data.record : x)));
    setCurrent(data.record);
    setMessage(null);
  }

  async function testConnection() {
    setMessage("Probando conexión con Spotify…");
    const res = await fetch("/api/spotify/health");
    const data = await res.json();
    setMessage(data.spotify.ok ? `Spotify conectado ✓ (búsqueda de prueba: ${data.spotify.sample ?? "sin resultados"})` : `Spotify: ${data.spotify.error}`);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="sign text-4xl">Rockola</h1>
          <p className="text-sm text-purple-200/80">Escucha tus álbumes desde Spotify.</p>
        </div>
        <button className="neon-btn" onClick={testConnection}>Probar conexión Spotify</button>
      </div>

      {message && <p className="text-sm text-neon-gold">{message}</p>}

      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <div className="neon-card max-h-[70vh] overflow-y-auto p-3">
          <ul className="space-y-2">
            {records.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => (r.spotify_album_id ? setCurrent(r) : matchSpotify(r))}
                  className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-neon-pink/10 ${current?.id === r.id ? "bg-neon-cyan/10" : ""}`}
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-black/70">
                    {r.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.cover_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neon-cyan">{r.artist}</p>
                    <p className="truncate text-xs text-purple-100/80">{r.title}</p>
                  </div>
                  {!r.spotify_album_id && <span className="badge shrink-0">Buscar</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="neon-card p-4">
          {current?.spotify_album_id ? (
            <div className="space-y-3">
              <p className="sign text-2xl">{current.title}</p>
              <iframe
                title={`${current.artist} - ${current.title}`}
                src={`https://open.spotify.com/embed/album/${current.spotify_album_id}?utm_source=generator&theme=0`}
                width="100%"
                height="380"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="rounded-xl"
              />
            </div>
          ) : (
            <p className="py-20 text-center text-purple-200/80">
              Elige un disco de la lista. Si todavía no está vinculado a Spotify, se buscará automáticamente.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
