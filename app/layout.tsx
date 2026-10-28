import type { Metadata } from "next";
import Link from "next/link";
import { Monoton, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sign = Monoton({ weight: "400", subsets: ["latin"], variable: "--font-sign" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Vynilworld",
  description: "Tu colección de vinilos, catalogada y con wishlist.",
};

const links = [
  { href: "/coleccion", label: "Colección" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/rockola", label: "Rockola" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sign.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <header className="sticky top-0 z-10 border-b border-neon-pink/40 bg-black/70 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-sign text-2xl text-neon-pink drop-shadow-[0_0_8px_#ff2fb9]">
              Vynilworld
            </Link>
            <ul className="flex gap-4 text-sm font-semibold">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-neon-cyan hover:text-neon-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
