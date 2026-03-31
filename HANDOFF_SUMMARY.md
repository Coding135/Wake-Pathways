# Wake Pathways - Handoff Summary

## Status
All implementation and polish passes complete. Build: 0 errors. Lint: 0 warnings.

## What It Does
Wake Pathways helps Wake County teens find real internships, volunteer roles, scholarships, summer programs, jobs, and more. All listings link to official sources and show verification dates.

## How to Run
```bash
cd "/Users/thecoderguy/Desktop/Wake Pathways"
npm install
npm run dev
# Open http://localhost:3000
```

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- React Hook Form + Zod v3
- TanStack Query (provider configured)
- Custom UI components (shadcn/ui style)

## Brand / assets
- Logos: `public/brand/logo-mark-32.png` (header, footer, favicon), `logo-mark-192.png` (apple icon), optional `logo-mark.png`. Constants: `src/lib/brand.ts`.

## Data
- 105 real, verified listings from 54 organizations
- Source: `data/verified-listings.json`
- Loaded by mock data layer (`src/lib/mock-data.ts`)
- Status resolved at load time via `resolveDisplayStatus()`
- Verification report: `data/verification-report.md`
- Expansion verification table (50 adds, 2026-03-30): `data/verification-expansion-2026-03-30.md`

## Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage: hero, featured (active-first), deadlines, categories, trust, CTA |
| `/opportunities` | Explore: filters (including Interests dialog), AND across facets, OR within selected interests, chips, search, pagination |
| `/opportunities/[slug]` | Detail: trust row, at-a-glance with fit cue, category-aware fields, status-aware CTA, source details, similar opps |
| `/submit` | Opportunity submission form |
| `/saved` | Saved opportunities with ring-styled badges, compare table |
| `/about` | Mission, differentiators, how it works |
| `/how-it-works` | Trust and verification process |
| `/admin` | Dashboard: overview, submissions, listings, verification |

## Status System
Runtime-resolved via `resolveDisplayStatus()`:
- **Rolling**: if `deadline_type` is "rolling" or data says rolling
- **Closing Soon**: if open and deadline is within 7 days
- **Closed**: if deadline is past or data says closed
- **Open**: actively accepting, not more specifically rolling or closing soon
- **Unknown**: source does not specify

## Badge System
One unified visual family across the entire app:
- `-50` backgrounds, `-700` text, `ring-1 ring-inset` borders
- Same font size, weight, padding, radius
- Applied to: status badges, category badges, verified badges, filter chips
- Consistent across: cards, detail pages, saved page, homepage

## Key Design Decisions
- `resolveDisplayStatus` runs at data load time
- Featured curated to show active listings first (closed sorted to end, 3 closed unflagged)
- Category-aware detail fields (no cost for jobs)
- Closed listings show "View Official Page" instead of "Apply"
- Closed + no deadline: deadline metadata hidden entirely
- Source details: clean dl/dt/dd format, no generic filler text
- Similar opportunities scored across all categories
- Filter chips use ring pattern matching badge system

## Backend Limitations
- No live database (mock data from JSON)
- No authentication (admin is open)
- Submissions saved to server memory only (no persistence across restarts)
- Data is static (no real-time updates)

## Files to Know
- `WORKING_MEMORY.md` - full project context
- `data/verified-listings.json` - all listings data
- `src/lib/mock-data.ts` - data access layer (applies resolveDisplayStatus)
- `src/lib/utils.ts` - resolveDisplayStatus, status labels, formatDeadline, badge colors
- `src/lib/constants.ts` - app config, nav, filter options
- `src/components/opportunities/opportunity-card.tsx` - card component
- `src/components/opportunities/opportunity-filters.tsx` - filter UI with chips
- `src/app/opportunities/[slug]/page.tsx` - detail page
- `src/app/saved/page.tsx` - saved page with compare
