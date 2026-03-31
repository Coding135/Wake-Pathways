# Working Memory - Wake Pathways

## Product Goal
Wake Pathways is a clean, fast, trustworthy platform that helps Wake County teens discover real local opportunities. It must feel immediately useful, credible, and launchable.

## Non-Negotiable Rules
- No fake data, no demo labels, no placeholder text
- No em dashes in public-facing copy
- No broken links
- No invented opportunities, dates, pay, deadlines, ages, or source details
- Use "Unknown" where a field is unclear
- Must not feel like an AI-generated demo app
- Must contain 50+ real, verified listings (now 105 listings after March 2026 data expansion)

## Branding
- Product name: **Wake Pathways**
- Headline tone: trustworthy, local, youth-friendly, clear
- No "Wake Youth Hub" - use "Wake Pathways" consistently
- Logo: PNG marks in `public/brand/` (`logo-mark-32.png`, `logo-mark-192.png`, `logo-mark.png`). Import paths from `src/lib/brand.ts`. Header and footer use the 32px mark with text lockup; `layout.tsx` sets favicon and apple touch icon metadata.

## Current State (Launch-Polish Pass Complete)

### Data
- 105 real, verified listings from 54 organizations
- All sourced from official government, nonprofit, and educational organization websites
- Stored in `data/verified-listings.json`, loaded by mock data layer
- Verification report at `data/verification-report.md`
- March 2026 expansion audit table: `data/verification-expansion-2026-03-30.md` (50 new listings, opp-056 through opp-105)
- Featured flags updated: 3 closed listings unflagged, 3 active listings added as featured
- Now 7 featured listings, at least 4 active (ensuring no closed item leads the section)

### Status System (Single Source of Truth)
Runtime resolution via `resolveDisplayStatus()` in `src/lib/utils.ts`:
- **Open**: actively accepting applications, not rolling, not closing soon
- **Rolling**: `deadline_type` is "rolling" OR `application_status` is "rolling" in the data
- **Closing Soon**: open with deadline within 7 days (derived at runtime)
- **Closed**: deadline passed (derived at runtime) or `application_status` is "closed" in data
- **Unknown**: status cannot be determined from source

Resolution happens at data load time in `mock-data.ts` so every consumer sees the correct status.

### Badge System (Fully Unified)
All badges/pills/labels use one consistent visual system:
- Background: `-50` shade
- Text: `-700` shade for strong readability
- Border: `ring-1 ring-inset ring-{color}-{600 or 700}/10-20` for subtle definition
- Same font size, weight, padding, radius across all badge types
- Applied consistently to: status badges, category badges, verified badges, filter chips
- Category badges match across: opportunity cards, detail page, saved page
- No `text-[11px]` overrides or `variant="secondary"` mismatches

### Features Implemented
- Homepage: hero search, category chips, featured (active-first, closed last), "Deadlines coming up", trust grid, submit CTA
- Explore/Browse: full filter system with active filter chips (removable, ring-styled), search, pagination, **Interests** multi-select (dialog). Interest matching is tag- and category-derived via `src/lib/opportunity-interests.ts` (frozen per listing in `mock-data.ts`). Filter combination: **AND** across category, city, grade, format, compensation, status, verified, free, and search; **OR** among selected interests (listing must match at least one chosen interest when any are selected).
- Saved opportunities: `useSyncExternalStore` uses a **stable module-level empty array** for `getServerSnapshot` and empty client state to avoid React 19 snapshot loop warnings.
- Detail pages: status badge, trust metadata row, "At a glance" with category-aware fit cue, category-aware cost field (hidden for jobs), status-aware CTA ("View Official Page" for closed), separated cost/compensation, eligibility, source details (clean dl/dt/dd, no filler), similar opportunities (cross-category scored), save button
- Cards: category badge + status badge (same font size), verified badge + save button, metadata row (location, conditional deadline, compensation)
- Saved page: full card with ring-styled category/status/verified badges, org name, metadata, "View details" action, remove button, side-by-side compare table
- Submit page: validated form wired to POST /api/submissions
- About page: concrete copy referencing specific source types, Wake County cities, and actual product behavior
- How It Works page: steps, verification explanation, trust badges
- Admin dashboard: overview, submissions, listings, verification tabs
- 404 page: custom with navigation
- Save/bookmark: localStorage-based, works across cards and detail pages

### Edge Cases Handled
- Closed + no deadline: deadline metadata hidden from cards and saved cards (badge communicates status)
- Jobs: "Cost" field and "Free to participate" hidden
- Closed listings: CTA says "View Official Page" instead of "Apply"
- Source details: generic filler reminder removed, section is clean and minimal

## Navigation
- Explore (/opportunities)
- Submit (/submit)
- Saved (/saved)
- About (/about)

## Key Decisions
- Using Next.js 16 + Tailwind v4 stack
- Status resolved at data load time via `resolveDisplayStatus`
- Featured listings: active-first sorting + curated flags (no closed item leads the section)
- Category-aware detail fields (no cost for jobs)
- Status-aware CTAs ("View Official Page" for closed)
- Badge ring pattern for visual consistency across all surfaces
- Similar opportunities search broadly with scoring
- Closed + no deadline: hide deadline metadata entirely

## Open Issues
- Admin auth is still stubbed (no real auth)
- Supabase integration not live (using mock data layer)
- Submit form saves to server memory only (no persistence)
