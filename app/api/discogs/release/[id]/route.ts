import { NextResponse, type NextRequest } from "next/server";
import { getDiscogsRelease } from "@/lib/discogs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    return NextResponse.json({ release: await getDiscogsRelease(Number(id)) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error en Discogs" }, { status: 502 });
  }
}
