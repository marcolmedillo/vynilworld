"use client";

import { useState } from "react";
import Link from "next/link";
import { compressImage } from "@/lib/compress";
import type { RecordItem } from "@/lib/types";

const BATCH = 4;

export default function Importar() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [created, setCreated] = useState<RecordItem[]>([]);
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    setCreated([]);
    const out: RecordItem[] = [];
    try {
      for (let i = 0; i < files.length; i += BATCH) {
        const slice = files.slice(i, i + BATCH);
        setProgress(`Subiendo ${Math.min(i + BATCH, files.length)} de ${files.length}…`);
        const fd = new FormData();
        for (const f of slice) {
          const blob = await compressImage(f);
          fd.append("files", new File([blob], `${f.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" }));
        }
        const res = await fetch("/api/records/import", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al subir");
        out.push(...data.records);
      }
      setCreated(out);
      setProgress(`Listo: ${out.length} discos creados. Identifica cada uno desde su ficha.`);
      setFiles([]);
    } catch (e) {
      setProgress(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="sign text-4xl">Subir fotos en lote</h1>
      <p className="text-sm text-purple-200/80">
        Cada foto se convierte en un disco separado. Quedan marcados como &quot;Sin identificar&quot; hasta que
        los completes desde su ficha con Discogs.
      </p>

      <div className="neon-card space-y-4 p-5">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="text-sm text-purple-200"
        />
        <p className="text-sm text-neon-gold">{files.length} fotos seleccionadas</p>
        <button className="neon-btn" disabled={busy || files.length === 0} onClick={start}>
          {busy ? "Subiendo…" : "Subir todas"}
        </button>
        {progress && <p className="text-sm text-neon-cyan">{progress}</p>}
      </div>

      {created.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {created.map((r) => (
            <li key={r.id}>
              <Link href={`/coleccion/${r.id}`} className="neon-card block p-3 text-sm">
                {r.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
