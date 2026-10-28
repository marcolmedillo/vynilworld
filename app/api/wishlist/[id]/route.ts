import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { normalizeWish, num } from "@/lib/records";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const b = (await req.json()) as Record<string, unknown>;
  const { data, error } = await getServerSupabase()
    .from("wishlist_items")
    .update({
      max_price: num(b.max_price),
      min_condition: (b.min_condition as string) || null,
      notes: (b.notes as string) || null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: normalizeWish(data) });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error } = await getServerSupabase().from("wishlist_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
