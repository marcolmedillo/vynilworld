import type { Metadata } from "next";
import { Monoton, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sign = Monoton({ weight: "400", subsets: ["latin"], variable: "--font-sign" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Vynilworld",
  description: "Tu colección de vinilos, catalogada y con wishlist.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sign.variable} ${body.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
