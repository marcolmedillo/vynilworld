import Link from "next/link";
import type { RecordItem } from "@/lib/types";

export default function RecordCard({ record, href }: { record: RecordItem; href: string }) {
  return (
    <Link href={href} className="neon-card group flex flex-col overflow-hidden">
      <div className="aspect-square w-full bg-black/70">
        {record.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={record.cover_url}
            alt={`${record.artist} - ${record.title}`}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-sign text-4xl text-neon-violet">?</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="truncate font-semibold text-neon-cyan">{record.artist}</p>
        <p className="truncate text-sm text-purple-100/90">{record.title}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {record.format_size && <span className="badge">{record.format_size}&quot;</span>}
          {record.year && <span className="badge">{record.year}</span>}
          {record.status === "pending" && <span className="badge border-neon-pink text-neon-pink">Sin identificar</span>}
        </div>
      </div>
    </Link>
  );
}
