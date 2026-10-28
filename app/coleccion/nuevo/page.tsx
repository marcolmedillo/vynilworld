"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DiscogsSearch from "@/components/DiscogsSearch";
import RecordForm from "@/components/RecordForm";
import { compressImage } from "@/lib/compress";
import type { RecordItem } from "@/lib/types";

export default function NuevoDisco() {
  const router = useRouter();
  const [prefill, setPrefill] = useState<Partial<RecordItem>>({});
  const [formKey, setFormKey] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function pick(releaseId: number) {
    setMessage("Cargando datos de Discogs…");
    const res = await fetch(`/api/discogs/release/${releaseId}`);
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "No se pudo cargar el disco");
      return;
    }
    const m = data.release;
    setPrefill({
      artist: m.artist,
      title: m.title,
      year: m.year,
      label: m.label,
      catalog_number: m.catalog_number,
      format_size: m.format_size,
      format_description: m.format_description,
      genres: m.genres,
      discogs_release_id: m.discogs_release_id,
      cover_url: m.cover_remote,
    });
    setFormKey((k) => k + 1);
    setMessage("Datos cargados. Revisa y guarda.");
  }

  async function save(values: Record<string, unknown>) {
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, cover_url: prefill.cover_url ?? null }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
    const id: string = data.record.id;

    if (photo) {
      const fd = new FormData();
      fd.append("file", new File([await compressImage(photo)], "cover.jpg", { type: "image/jpeg" }));
      await fetch(`/api/records/${id}/cover`, { method: "POST", body: fd });
    }
    router.push(`/coleccion/${id}`);
  }

  return (
    <section className="space-y-8">
      <h1 className="sign text-4xl">Añadir disco</h1>

      <div className="neon-card space-y-4 p-5">
        <h2 className="text-lg font-semibold text-neon-cyan">1. Busca en Discogs (opcional)</h2>
        <DiscogsSearch onPick={pick} buttonLabel="Usar este" />
        {message && <p className="text-sm text-neon-gold">{message}</p>}
      </div>

      <div className="neon-card space-y-4 p-5">
        <h2 className="text-lg font-semibold text-neon-cyan">2. Carátula (opcional)</h2>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="text-sm text-purple-200"
        />
        {photo && <p className="text-xs text-purple-300/70">Se subirá: {photo.name}</p>}
      </div>

      <div className="neon-card p-5">
        <h2 className="mb-4 text-lg font-semibold text-neon-cyan">3. Datos del disco</h2>
        <RecordForm key={formKey} initial={prefill} submitLabel="Guardar disco" onSubmit={save} />
      </div>
    </section>
  );
}
