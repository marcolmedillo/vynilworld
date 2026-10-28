"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RecordCard from "@/components/RecordCard";
import type { RecordItem } from "@/lib/types";

export default function Coleccion() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [q, setQ] = useState("");
  const [format, setFormat] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("created");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ sort });
    if (q.trim()) params.set("q", q.trim());
    if (format) params.set("format", format);
    if (genre.trim()) params.set("genre", genre.trim());
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/records?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al cargar");
        setRecords(data.records);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, format, genre, sort]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="sign text-4xl">Colección</h1>
          <p className="text-sm text-purple-200/80">{loading ? "Cargando…" : `${records.length} discos`}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/coleccion/importar" className="neon-btn-pink">Subir fotos</Link>
          <Link href="/coleccion/nuevo" className="neon-btn">+ Añadir disco</Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <input className="input sm:col-span-2" placeholder="Buscar artista, título o sello" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="">Todos los formatos</option>
          <option value="7">7&quot;</option>
          <option value="10">10&quot;</option>
          <option value="12">12&quot;</option>
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="created">Más recientes</option>
          <option value="artist">Artista A-Z</option>
          <option value="title">Título A-Z</option>
          <option value="year">Año</option>
        </select>
        <input className="input sm:col-span-4" placeholder="Filtrar por género (ej. Disco, Funk)" value={genre} onChange={(e) => setGenre(e.target.value)} />
      </div>

      {error && <p className="text-neon-pink">{error}</p>}
      {!loading && records.length === 0 && !error && (
        <p className="text-purple-200/80">No hay discos con esos filtros todavía.</p>
      )}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {records.map((r) => (
          <RecordCard key={r.id} record={r} href={`/coleccion/${r.id}`} />
        ))}
      </div>
    </section>
  );
}
