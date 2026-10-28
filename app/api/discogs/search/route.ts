import { NextResponse, type NextRequest } from "next/server";
import { searchDiscogs } from "@/lib/discogs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "Escribe algo para buscar" }, { status: 400 });
  try {
    return NextResponse.json({ results: await searchDiscogs(q) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error en Discogs" }, { status: 502 });
  }
}
