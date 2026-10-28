# Vynilworld

Catálogo de vinilos con carátulas, tracklist por cara, wishlist con alertas de precio
(Discogs) y rockola con Spotify embebido.

## Stack
- Next.js (App Router) + Tailwind, desplegado en Vercel
- Supabase (proyecto `vynilworld`, región eu-west-1): tablas `records`, `tracks`, `wishlist_items`, `price_alerts`, con RLS activo
- API de Discogs (token personal)
- Avisos por Gmail (fase posterior)

## Puesta en marcha
1. `cp .env.example .env.local` y rellena las variables.
2. `npm install`
3. `npm run dev`

Las variables de `.env.local` no se suben a GitHub: en Vercel se configuran en Project Settings > Environment Variables.
