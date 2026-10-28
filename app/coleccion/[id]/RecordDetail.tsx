"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DiscogsSearch from "@/components/DiscogsSearch";
import RecordForm from "@/components/RecordForm";
import { compressImage } from "@/lib/compress";
import type { RecordItem, Track } from "@/lib/types";

export default function RecordDetail({ id }: { id: string }) {
  const router = useRouter();
  const [record, setRecord] = useState<RecordItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/records/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No encontrado");
      return;
    }
    setRecord(data.record);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function save(values: Record<string, unknown>) {
    const res = await fetch(`/api/records/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "No se pudo guardar");
    setEditing(false);
    await load();
  }

  async function identify(releaseId: number) {
    setIdentifying(false);
    await run("Identificando con Discogs", async () => {
      const res = await fetch(`/api/records/${id}/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discogs_release_id: releaseId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "No se pudo identificar");
    });
  }

  async function uploadPhoto(file: File) {
    await run("Subiendo foto", async () => {
      const fd = new FormData();
      fd.append("file", new File([await compressImage(file)], "cover.jpg", { type: "image/jpeg" }));
      const res = await fetch(`/api/records/${id}/cover`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "No se pudo subir la foto");
    });
  }

  async function findOnSpotify() {
    await run("Buscando en Spotify", async () => {
      const res = await fetch(`/api/records/${id}/spotify`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "No se encontró en Spotify");
    });
  }

  async function remove() {
    if (!window.confirm("¿Eliminar este disco de la colección?")) return;
    const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/coleccion");
    else setError("No se pudo eliminar");
  }

  if (!record) {
    return <p className="text-neon-pink">{error ?? "Cargando…"}</p>;
  }

  const bySide = (record.tracks ?? []).reduce<Record<string, Track[]>>((acc, t) => {
    (acc[t.side] ??= []).push(t);
    return acc;
  }, {});

  return (
    <section className="space-y-8">
      <div className="grid gap-8 md:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="neon-card aspect-square overflow-hidden">
            {record.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={record.cover_url} alt={record.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-sign text-5xl text-neon-violet">?</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="neon-btn" onClick={() => setEditing((v) => !v)} disabled={!!busy}>
              {editing ? "Cerrar edición" : "Editar"}
            </button>
            <button className="neon-btn" onClick={() => setIdentifying((v) => !v)} disabled={!!busy}>
              Identificar con Discogs
            </button>
            <label className="neon-btn cursor-pointer">
              Subir foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
              />
            </label>
            <button className="neon-btn" onClick={findOnSpotify} disabled={!!busy}>
              Buscar en Spotify
            </button>
            <button className="neon-btn-pink" onClick={remove} disabled={!!busy}>
              Eliminar
            </button>
          </div>
          {busy && <p className="text-sm text-neon-gold">{busy}…</p>}
          {error && <p className="text-sm text-neon-pink">{error}</p>}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="sign text-4xl">{record.title}</h1>
            <p className="text-xl text-neon-cyan">{record.artist}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {record.year && <span className="badge">{record.year}</span>}
              {record.format_size && <span className="badge">{record.format_size}&quot;</span>}
              {record.format_description && <span className="badge">{record.format_description}</span>}
              {record.label && <span className="badge">{record.label}{record.catalog_number ? ` · ${record.catalog_number}` : ""}</span>}
              {record.condition && <span className="badge">Condición {record.condition}</span>}
              {record.status === "pending" && <span className="badge border-neon-pink text-neon-pink">Sin identificar</span>}
            </div>
            {record.genres.length > 0 && (
              <p className="mt-3 text-sm text-purple-200/80">{record.genres.join(" · ")}</p>
            )}
          </div>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {record.edition && <Info label="Edición" value={record.edition} />}
            {record.purchase_date && <Info label="Comprado" value={record.purchase_date} />}
            {record.purchase_place && <Info label="Dónde" value={record.purchase_place} />}
            {record.purchase_price !== null && <Info label="Precio" value={`${record.purchase_price} €`} />}
            {record.comments && <Info label="Comentarios" value={record.comments} />}
          </dl>

          {identifying && (
            <div className="neon-card p-4">
              <DiscogsSearch onPick={identify} buttonLabel="Identificar" />
            </div>
          )}

          {editing && (
            <div className="neon-card p-4">
              <RecordForm initial={record} submitLabel="Guardar cambios" onSubmit={save} />
            </div>
          )}

          <div>
            <h2 className="mb-3 text-lg font-semibold text-neon-cyan">Tracklist</h2>
            {Object.keys(bySide).length === 0 ? (
              <p className="text-sm text-purple-300/70">Sin tracklist. Identifícalo con Discogs para cargarlo.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(bySide).map(([side, tracks]) => (
                  <div key={side} className="neon-card p-4">
                    <h3 className="font-sign mb-2 text-xl text-neon-gold">Cara {side}</h3>
                    <ol className="space-y-1 text-sm">
                      {tracks.map((t) => (
                        <li key={`${side}-${t.position}`} className="flex justify-between gap-2">
                          <span>
                            {t.position}. {t.title}
                          </span>
                          <span className="text-purple-300/70">{t.duration}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-neon-gold">{label}</dt>
      <dd className="text-purple-50">{value}</dd>
    </div>
  );
}
