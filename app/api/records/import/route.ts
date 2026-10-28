import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { normalizeRecord } from "@/lib/records";

// Cada foto se convierte en un disco pendiente de identificar.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "No llegó ninguna foto" }, { status: 400 });

  const supabase = getServerSupabase();
  const created = [];
  for (const file of files) {
    const id = crypto.randomUUID();
    const path = `pending/${id}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("covers")
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: "image/jpeg" });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    const { data: pub } = supabase.storage.from("covers").getPublicUrl(path);
    const { data, error } = await supabase
      .from("records")
      .insert({
        artist: "Pendiente",
        title: file.name.replace(/\.[^.]+$/, "") || "Sin identificar",
        status: "pending",
        cover_url: pub.publicUrl,
        cover_path: path,
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    created.push(normalizeRecord(data));
  }
  return NextResponse.json({ records: created }, { status: 201 });
}
