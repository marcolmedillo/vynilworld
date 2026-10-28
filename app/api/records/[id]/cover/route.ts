import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { normalizeRecord } from "@/lib/records";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });

  const supabase = getServerSupabase();
  const path = `${id}/${Date.now()}.jpg`;
  const { error: upErr } = await supabase.storage
    .from("covers")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: "image/jpeg" });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from("covers").getPublicUrl(path);
  const { data, error } = await supabase
    .from("records")
    .update({ cover_url: pub.publicUrl, cover_path: path })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ record: normalizeRecord(data) });
}
