"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { RecordItem } from "@/lib/types";

const CONDITIONS = ["M", "NM", "VG+", "VG", "G+", "G", "F", "P"];

type Props = {
  initial?: Partial<RecordItem>;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
};

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neon-gold">{label}</span>
      {children}
    </label>
  );
}

export default function RecordForm({ initial = {}, submitLabel, onSubmit }: Props) {
  const [f, setF] = useState({
    artist: str(initial.artist),
    title: str(initial.title),
    year: str(initial.year),
    label: str(initial.label),
    catalog_number: str(initial.catalog_number),
    format_size: str(initial.format_size),
    format_description: str(initial.format_description),
    edition: str(initial.edition),
    genres: (initial.genres ?? []).join(", "),
    purchase_date: str(initial.purchase_date),
    purchase_place: str(initial.purchase_place),
    purchase_price: str(initial.purchase_price),
    condition: str(initial.condition),
    comments: str(initial.comments),
    discogs_release_id: str(initial.discogs_release_id),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function handle(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(f);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handle} className="grid gap-4 sm:grid-cols-2">
      <Field label="Artista *">
        <input required className="input" value={f.artist} onChange={set("artist")} />
      </Field>
      <Field label="Título *">
        <input required className="input" value={f.title} onChange={set("title")} />
      </Field>
      <Field label="Año">
        <input className="input" inputMode="numeric" value={f.year} onChange={set("year")} />
      </Field>
      <Field label="Sello discográfico">
        <input className="input" value={f.label} onChange={set("label")} />
      </Field>
      <Field label="Número de catálogo">
        <input className="input" value={f.catalog_number} onChange={set("catalog_number")} />
      </Field>
      <Field label="Formato">
        <select className="input" value={f.format_size} onChange={set("format_size")}>
          <option value="">Sin definir</option>
          <option value="7">7&quot;</option>
          <option value="10">10&quot;</option>
          <option value="12">12&quot;</option>
        </select>
      </Field>
      <Field label="Descripción del formato">
        <input className="input" placeholder='2x12" LP, Gatefold…' value={f.format_description} onChange={set("format_description")} />
      </Field>
      <Field label="Edición">
        <input className="input" placeholder="Reedición, prensa original…" value={f.edition} onChange={set("edition")} />
      </Field>
      <Field label="Géneros (separados por comas)">
        <input className="input" value={f.genres} onChange={set("genres")} />
      </Field>
      <Field label="Condición">
        <select className="input" value={f.condition} onChange={set("condition")}>
          <option value="">Sin definir</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Fecha de compra">
        <input type="date" className="input" value={f.purchase_date} onChange={set("purchase_date")} />
      </Field>
      <Field label="Lugar de compra">
        <input className="input" value={f.purchase_place} onChange={set("purchase_place")} />
      </Field>
      <Field label="Precio pagado (€)">
        <input className="input" inputMode="decimal" value={f.purchase_price} onChange={set("purchase_price")} />
      </Field>
      <Field label="ID de Discogs">
        <input className="input" inputMode="numeric" value={f.discogs_release_id} onChange={set("discogs_release_id")} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Comentarios">
          <textarea rows={3} className="input" value={f.comments} onChange={set("comments")} />
        </Field>
      </div>
      {error && <p className="text-neon-pink sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button className="neon-btn" disabled={saving}>
          {saving ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
