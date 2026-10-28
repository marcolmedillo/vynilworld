import Link from "next/link";

const sections = [
  { href: "/coleccion", title: "Colección", text: "Tu biblioteca de vinilos, carátula a carátula." },
  { href: "/wishlist", title: "Wishlist", text: "Los discos que quieres y a qué precio avisarte." },
  { href: "/rockola", title: "Rockola", text: "Reproduce tus álbumes desde Spotify." },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="font-sign text-6xl text-neon-pink drop-shadow-[0_0_12px_#ff2fb9] sm:text-8xl">
        Vynilworld
      </h1>
      <p className="text-center text-lg text-neon-cyan drop-shadow-[0_0_6px_#2ff3ff]">
        Studio 54 nunca cerró para ti.
      </p>
      <ul className="grid w-full gap-6 sm:grid-cols-3">
        {sections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block rounded-2xl border-2 border-neon-gold/70 bg-black/40 p-6 shadow-[0_0_12px_rgba(255,209,102,0.35)] transition hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(255,209,102,0.7)]"
            >
              <h2 className="font-sign text-2xl text-neon-gold">{s.title}</h2>
              <p className="mt-2 text-sm text-purple-100/80">{s.text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
