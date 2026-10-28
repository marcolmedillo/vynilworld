import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { getListings } from "@/lib/discogs";
import { normalizeWish } from "@/lib/records";

type Ctx = { params: Promise<{ id: string }> };

// Consulta el marketplace de Discogs y guarda el precio más bajo encontrado.
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = getServerSupabase();
  const { data: row, error } = await supabase.from("wishlist_items").select("*").eq("id", id).single();
  if (error || !row) return NextResponse.json({ error: "Elemento no encontrado" }, { status: 404 });
  if (!row.discogs_release_id) {
    return NextResponse.json({ error: "Este disco no está vinculado a Discogs" }, { status: 400 });
  }

  const { count, cheapest } = await getListings(Number(row.discogs_release_id));
  const lowest = cheapest[0]?.price ?? null;
  await supabase
    .from("wishlist_items")
    .update({ lowest_price: lowest, listings_count: count, last_checked_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ count, listings: cheapest, item: normalizeWish({ ...row, lowest_price: lowest, listings_count: count }) });
}
