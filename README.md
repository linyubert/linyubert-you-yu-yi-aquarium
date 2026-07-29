# vinext-starter

Full-stack starter on [vinext](https://github.com/cloudflare/vinext). Cloudflare D1 and Drizzle support included, but optional — turn them on when you actually need them.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

No `wrangler.jsonc` here.

## What's Inside

- Site code lives in `app/`
- `.openai/hosting.json` declares the optional Sites D1 and R2 bindings
- `vite.config.ts` simulates those bindings locally
- `db/schema.ts` starts empty on purpose
- `examples/d1/` has an optional D1 example
- `drizzle.config.ts` handles local migration generation when you need it

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from `oai-authenticated-user-email`.

SIWC-authenticated sites may also get `oai-authenticated-user-full-name`, but only when the user's SIWC profile has a non-empty `name` claim. It's percent-encoded UTF-8, with `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8` alongside it.

Treat the full name as optional. Fall back to email:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

`app/chatgpt-auth.ts` has the helpers ready to go:

- `getChatGPTUser()` — optional signed-in UI
- `requireChatGPTUser(returnTo)` — server-rendered pages that should redirect anonymous visitors through Sign in with ChatGPT
- `chatGPTSignInPath(returnTo)` / `chatGPTSignOutPath(returnTo)` — for browser links or actions

`returnTo` should be a same-origin relative path — the destination after sign-in/out. The helper validates and encodes it for you.

Mark protected pages `export const dynamic = "force-dynamic"` since they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection — don't build app routes on those paths. Anything that skips the helper stays anonymous-compatible.

SIWC proves identity, not workspace membership. If you need workspace-wide restrictions, use the Sites hosting platform's access policy controls, or add your own server-side membership/allowlist check.

Use SIWC for account pages, per-user dashboards, saved records, and writes tied to the current ChatGPT user. Keep public content anonymous.

## Commands

- `npm run dev` — local dev
- `npm run build` — verify the vinext build output
- `npm test` — build + check the rendered loading skeleton
- `npm run db:generate` — generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
