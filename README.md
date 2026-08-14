# Achievement Aquarium

A class-management aquarium. Import a roster and every student becomes a fish; feed a fish and it grows, turning the abstract business of effort and progress into something the whole class can watch swim.

Achievement Aquarium is one of the class-management tools from **Dato Music Lab** (https://datomusiclab.dpdns.org), a working elementary music teacher's studio in Taipei.

## What it is

Points systems tend to end up as a number beside a name, which is precisely the form that makes some children stop trying. A tank full of fish behaves differently: growth is visible without being a ranking, every fish is clearly somebody's, and the tank looks alive whether or not anyone scored this lesson.

## Features

**Multiple tanks.** Any number of classes, each with its own setting — kelp forest, morning-light reef, moonlit deep — and its own class motto.

**Roster import.** Upload CSV or TXT, or paste a list straight in; the first column is read as the student name.

**Feeding.** Tap a fish to feed it and add to its growth; or award the whole class at once with a single `+1`.

**Leaderboard.** A live ranking by growth, with levels.

**Tuned to the room.** Adjustable swimming speed, sound on or off, and a fullscreen view for projecting the tank.

**Data stays local.** Rosters and growth records live in the browser's `localStorage` — no backend, no database, nothing uploaded.

## Quick start

```bash
npm install
npm run dev      # local development
npm run build    # verify a production build
```

Requires Node.js `>=22.13.0`.

## Tech

Built on [vinext](https://github.com/cloudflare/vinext) (Next.js on Cloudflare), with React 19 and Tailwind CSS 4.

- Page logic in `app/page.tsx` — a pure front-end component with no server-side data dependency
- Layout and SEO metadata in `app/layout.tsx`
- Styles in `app/globals.css`
- `db/`, `drizzle.config.ts` and `examples/d1/` are optional Cloudflare D1 support, currently unused
- `app/chatgpt-auth.ts` is an optional ChatGPT sign-in integration, currently unused by the home page

## Static deployment

Because the page is entirely front-end — all state in `localStorage` — there is a separate static bundle for hosts like GitHub Pages:

```bash
npx vite build --config vite.config.pages.ts
```

Output lands in `docs/`, which is where GitHub Pages publishes from.

## License

Code is MIT — see [LICENSE](LICENSE). Artwork is original work by Yucheng Lin under separate terms; see [NOTICE.md](NOTICE.md).

## More from Dato Music Lab

The aquarium has two siblings built on the same idea in different rooms: a 3D village where each student's points grow a recorder-playing elf, complete with a real gradebook and Excel export, and a garden where the class waters flowers instead. On the teaching side, the studio builds classroom games — rhythm, sight-reading, timbre, pitch detection — all at **https://datomusiclab.dpdns.org**.
