# Admin dashboard — front end

Next.js 14 (App Router) + TypeScript + Tailwind CSS + lucide-react + recharts.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Structure

```
app/
  layout.tsx        root layout, loads Inter font + globals.css
  page.tsx           the dashboard page — assembles everything below
  globals.css         Tailwind directives + base styles
components/
  Sidebar.tsx         logo + nav, collapsible, navy bg
  Topbar.tsx          search bar, notifications, profile
  KpiCard.tsx          reusable stat card (used 4x on the dashboard)
  RevenueChart.tsx      recharts area chart
  MachineStatusBars.tsx  3 progress bars: installed / returns / disposed
  RecentInvoicesTable.tsx table with status badges
lib/
  mock-data.ts        placeholder data — SWAP FOR YOUR API CALLS
  utils.ts             cn() className helper + currency formatter
tailwind.config.ts     color tokens (navy / orange / surface / status colors)
```

## Wiring up your ASP.NET Core Web API

Everything currently reads from `lib/mock-data.ts`. Replace those exports with
real fetches, for example:

```ts
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL; // e.g. https://localhost:5001/api

export async function getKpis() {
  const res = await fetch(`${API_BASE}/dashboard/kpis`, { cache: "no-store" });
  return res.json();
}
```

Suggested endpoints to plan on the backend, matching what's on this page:

- `GET /api/dashboard/kpis` → invoice revenue, credit notes count, active machines, new invoices count (+ % change vs last month for each)
- `GET /api/dashboard/revenue-trend?range=7m` → `[{ month, revenue }]`
- `GET /api/invoices/recent?take=6` → `[{ invoiceNo, client, date, amount, status }]`
- `GET /api/machines/status-summary` → `{ newlyInstalled, returns, disposed }` each with `count` / `total`

Since `page.tsx` is currently a plain (non-async) server component, the easiest
path: mark it `async`, `await` your fetch calls at the top, and pass the data
down as props instead of importing from `mock-data.ts`. Add a loading.tsx /
skeleton per route if you want streaming.

## Notes

- Color tokens live in `tailwind.config.ts` (navy/orange/surface/status) — change
  them there and every component updates.
- Sidebar has a working collapse toggle but no mobile drawer yet (hidden below
  `lg` breakpoint) — hook the `Menu` button in `Topbar.tsx` up to a slide-over
  if you need mobile nav before tomorrow.
- Table row actions (`MoreHorizontal`) and search input aren't wired to
  anything yet — just markup, ready for your handlers.
