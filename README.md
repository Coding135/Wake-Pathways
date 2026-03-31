# Wake County Youth Opportunity Hub

A polished, trustworthy platform for Wake County middle and high school students to discover real local opportunities, including internships, volunteer work, scholarships, summer programs, competitions, leadership programs, and student jobs.

## Quick Start

```bash
# Clone and install
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials (optional for demo mode)

# Run in development mode
npm run dev
# Open http://localhost:3000
```

## Demo Mode

The app runs in **demo mode** by default, without needing a Supabase connection. All data is served from the built-in mock data layer with 15 real-inspired opportunities from Wake County organizations.

To connect to a real Supabase instance, add your credentials to `.env.local` and apply the database migration.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom component library (shadcn-style)
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (for admin)
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query
- **Testing**: Vitest + Testing Library + Playwright

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── opportunities/     # Browse + detail pages
│   ├── submit/            # Submission form
│   ├── admin/             # Admin dashboard
│   ├── about/             # About page
│   ├── how-it-works/      # Verification info
│   ├── digest/            # Weekly digest signup
│   ├── saved/             # Saved opportunities
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI primitives
│   ├── layout/            # Header, footer
│   └── opportunities/     # Domain-specific components
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── mock-data.ts       # Demo data layer
│   ├── schemas.ts         # Zod validation schemas
│   ├── constants.ts       # App constants
│   └── utils.ts           # Utility functions
└── types/
    └── database.ts        # TypeScript type definitions

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Database schema

scripts/
├── seed.ts                # Seed data script
├── verify-links.ts        # Link verification script
└── import-csv.ts          # CSV import utility

tests/
├── unit/                  # Vitest unit tests
├── e2e/                   # Playwright e2e tests
└── setup.ts               # Test setup
```

## Database Setup (Optional)

If connecting to Supabase:

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key to `.env.local`
4. Run the seed script: `npx tsx scripts/seed.ts`

### Admin Setup

To create an admin user, insert a record into the `admin_users` table:

```sql
INSERT INTO admin_users (email, name, role) 
VALUES ('admin@example.com', 'Admin', 'admin');
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npx tsx scripts/verify-links.ts` | Run link verification |
| `npx tsx scripts/seed.ts` | Seed the database |
| `npx tsx scripts/import-csv.ts <file>` | Import from CSV |

## Features

### For Students & Parents
- Browse and search opportunities with powerful filters
- Filter by category, grade, age, location, paid/unpaid, and more
- View detailed information for each opportunity
- Save opportunities for later
- Sign up for weekly digest emails
- Share opportunities easily

### For Organizations
- Submit new opportunities through a public form
- Submissions reviewed before publishing

### For Admins
- Review and moderate submissions
- Manage listings (feature, verify, archive)
- Link verification and health monitoring
- Expired deadline detection
- Weekly digest content management

### Data Integrity
- Every listing tracks its source URL
- Verification status and timestamps
- Automated link checking
- Duplicate detection
- Missing field flagging

## Geographic Focus

The platform is specifically designed for **Wake County, North Carolina**, covering cities including Raleigh, Cary, Apex, Morrisville, Holly Springs, Fuquay-Varina, Wake Forest, Garner, Knightdale, Wendell, Zebulon, and Rolesville.

## Design Principles

- **Trust over volume**: Fewer verified listings are better than many unverified ones
- **Simple and fast**: Clean UI without feature bloat
- **Mobile-first**: Works beautifully on phones
- **Accessible**: Keyboard navigation, semantic HTML, focus management
- **No fake data**: Demo listings are clearly marked; production data must be verified

## License

MIT
