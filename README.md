# Risu Team

Dance school and sports club website built with Next.js, Convex, and Tailwind CSS.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [Convex](https://convex.dev) for backend, database, and auth
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com/) components

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables. Rename `.env.example` to `.env.local` and add:

   ```
   NEXT_PUBLIC_CONVEX_URL=[your Convex deployment URL]
   ```

3. Run Convex dev (for local development):

   ```bash
   npx convex dev
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Hero image (strona główna)

Zdjęcie w sekcji Hero jest w `public/hero-facebook.jpg` (Facebook `photo.php?…` nie da się podać jako bezpośredni `src` w Next — zapisz plik ze zdjęcia i nadpisz ten plik). Opcjonalnie ustaw `NEXT_PUBLIC_HERO_IMAGE_URL` na bezpośredni adres HTTPS do pliku graficznego (np. z `scontent-…fbcdn.net`).

## Auth

Authentication is handled via Convex. Configure Convex Auth (e.g. `@convex-dev/auth`) or an auth provider (WorkOS, Auth0) to enable sign-in, sign-up, and protected routes.
