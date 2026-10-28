"use client";

import { useEffect, useState } from "react";
import DiscogsSearch from "@/components/DiscogsSearch";
import type { Listing, WishlistItem } from "@/lib/types";

type Panel = { count: number; listings: Listing[] };

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [panels, setPanels] = useState<Record<string, Panel>>({});
  const [adding, setAdding] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const [minCond, setMinCond] = useState("");
  const [notes, setNotes] = useState("");
  const [checking, setChecking] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    if (!res.ok) setMessage(data.error);
    else setItems(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  async function pick(releaseId: number) {
    setMessage("Añadiendo…");
    const rel = await (await fetch(`/api/discogs/release/${releaseId}`)).json();
    if (!rel.release) {
      setMessage(rel.error ?? "No se pudo cargar el disco");
      return;
    }
    const m = rel.release;
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        discogs_release_id: m.discogs_release_id,
        artist: m.artist,
        title: m.title,
        format_size: m.format_size,
        format_description: m.format_description,
        cover_url: m.cover_remote,
        max_price: maxPrice,
        min_condition: minCond,
        notes,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "No se pudo añadir");
      return;
    }
    setAdding(false);
    setMessage(null);
    await load();
  }

  async function check(id: string) {
    setChecking(id);
    setMessage(null);
    const res = await fetch(`/api/wishlist/${id}/availability`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setMessage(data.error ?? "No se pudo comprobar");
    else {
      setPanels((p) => ({ ...p, [id]: { count: data.count, listings: data.listings } }));
      await load();
    }
    setChecking(null);
  }

  async function remove(id: string) {
    if (!window.confirm("¿Quitar de la wishlist?")) return;
    await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="sign text-4xl">Wishlist</h1>
          <p className="text-sm text-purple-200/80">{items.length} discos que quieres</p>
        </div>
        <button className="neon-btn" onClick={() => setAdding((v) => !v)}>
          {adding ? "Cerrar" : "+ Añadir a la wishlist"}
        </button>
      </div>

      {adding && (
        <div className="neon-card space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <input className="input" type="number" min="0" step="0.5" placeholder="Precio máximo (€)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            <select className="input" value={minCond} onChange={(e) => setMinCond(e.target.value)}>
              <option value="">Condición mínima</option>
              {["M", "NM", "VG+", "VG", "G+", "G"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input className="input" placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DiscogsSearch onPick={pick} buttonLabel="Añadir" />
        </div>
      )}

      {message && <p className="text-sm text-neon-gold">{message}</p>}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const panel = panels[it.id];
          const below = it.lowest_price !== null && it.max_price !== null && it.lowest_price <= it.max_price;
          return (
            <li key={it.id} className={`neon-card flex flex-col gap-3 p-4 ${below ? "border-neon-gold shadow-[0_0_20px_#ffd166]" : ""}`}>
              <div className="flex gap-3">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-black/70">
                  {it.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.cover_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-neon-cyan">{it.artist}</p>
                  <p className="truncate text-sm">{it.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {it.format_size && <span className="badge">{it.format_size}&quot;</span>}
                    {it.max_price !== null && <span className="badge">Máx. {it.max_price} €</span>}
                    {it.lowest_price !== null && (
                      <span className={`badge ${below ? "border-neon-gold text-neon-gold" : "border-neon-cyan text-neon-cyan"}`}>
                        Mínimo {it.lowest_price} €
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {it.notes && <p className="text-xs text-purple-300/70">{it.notes}</p>}
              {it.last_checked_at && (
                <p className="text-xs text-purple-300/60">
                  Última comprobación: {new Date(it.last_checked_at).toLocaleString("es-ES")} · {it.listings_count ?? 0} anuncios
                </p>
              )}
              <div className="mt-auto flex gap-2">
                <button className="neon-btn px-3 py-1 text-sm" onClick={() => check(it.id)} disabled={checking === it.id || !it.discogs_release_id}>
                  {checking === it.id ? "Comprobando…" : "Comprobar ofertas"}
                </button>
                <button className="neon-btn-pink px-3 py-1 text-sm" onClick={() => remove(it.id)}>Quitar</button>
              </div>
              {panel && (
                <ul className="space-y-1 border-t border-neon-violet/40 pt-2 text-xs">
                  {panel.listings.length === 0 && <li>No hay anuncios a la venta ahora mismo.</li>}
                  {panel.listings.map((l) => (
                    <li key={l.id} className="flex justify-between gap-2">
                      <span>{l.price} {l.currency} · {l.condition} · {l.seller}</span>
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-neon-cyan underline">ver</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
