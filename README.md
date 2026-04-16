# 🧭 WanderLog — Travel Journal Platform

A Next.js 14 travel journal community. Reddit-meets-Medium for travellers — day-by-day itineraries, interactive maps, AI writing copilot, upvotes, and threaded comments.

---

## ✦ Design

**Medium-faithful aesthetic** with full light/dark mode:

- **Typography** — Source Serif 4 for all editorial content, DM Sans for UI
- **Light mode** — warm white `#ffffff`, warm ink `#1a1a1a`, subtle warm borders
- **Dark mode** — deep charcoal `#191919`, warm off-white `#e8e6e1` — not harsh
- **Theme toggle** — sun/moon icon in navbar, persisted to `localStorage`, respects `prefers-color-scheme` on first visit, no flash on reload
- **Transitions** — all color/background changes animate at 0.2s ease

---

## 🚀 Quick Start

```bash
cd wanderlog-next
npm install
npm run dev
```

Opens at **http://localhost:3000**

### Build for production
```bash
npm run build
npm start
```

---

## 🔐 Demo Accounts

Click any demo button on the sign-in modal (no password needed):

| Username | Name |
|---|---|
| `elena_wanders` | Elena Marchetti |
| `kai_roams` | Kai Nakamura |
| `priya_travels` | Priya Sharma |

---

## 🤖 AI Copilot

The AI writing assistant calls **Claude claude-sonnet-4-20250514** directly from the browser.

For production, proxy the call through a backend route to avoid exposing your API key:

```js
// src/app/api/ai/route.js
export async function POST(req) {
  const body = await req.json();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  return Response.json(await res.json());
}
```

Then change the fetch URL in `WritePage.js` from `https://api.anthropic.com/v1/messages` to `/api/ai`.

---

## 📁 Structure

```
src/
├── app/
│   ├── layout.js              # Root layout — fonts, providers, navbar
│   ├── page.js                # Home feed
│   ├── home.module.css
│   ├── post/[id]/
│   │   ├── page.js            # Full post with timeline, map, comments
│   │   └── post.module.css
│   ├── write/[[...id]]/
│   │   ├── page.js            # Journal editor + AI copilot
│   │   └── write.module.css
│   └── user/[username]/
│       ├── page.js            # User profile
│       └── profile.module.css
├── components/
│   ├── Navbar.js / .module.css
│   ├── AuthModal.js / .module.css
│   ├── PostCard.js / .module.css
│   ├── TripMap.js             # Leaflet map (client-only, SSR disabled)
│   └── StoreInit.js           # Seeds localStorage on mount
├── hooks/
│   ├── useAuth.js             # Auth context
│   └── useTheme.js            # Theme context (light/dark toggle)
├── lib/
│   └── store.js               # localStorage data layer
└── styles/
    └── globals.css            # CSS variables, light+dark themes, resets
```

---

## 🗄️ Data Model

Everything persists in `localStorage` under `wl_*` keys.

```ts
Post {
  id, authorId, title, excerpt, cover,
  route, journeyType, duration, startDate, tags,
  upvotes, createdAt,
  days: Day[],
  mapCenter: [lat, lng], mapZoom
}

Day {
  day: number, location: string,
  lat: number, lng: number,
  title: string, content: string
}

Comment { id, postId, authorId, content, parentId, upvotes, createdAt }
User     { id, username, name, bio, avatar, joined }
```

---

## 🌍 Deployment

### Vercel (recommended)
```bash
npx vercel
```

### Netlify
```bash
npm run build
# Upload the .next folder or connect via Git
```

Add to `next.config.js` for static export if needed:
```js
output: 'export'
```

---

## 🛣️ Roadmap

- [ ] PostgreSQL backend + Prisma ORM
- [ ] Image upload via Cloudinary
- [ ] Follow system + personalised feed
- [ ] Route community pages (`/route/east-asia`)
- [ ] Full-text search with Algolia or pg_search
- [ ] Email digest of new posts

---

MIT License
