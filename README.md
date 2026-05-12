# Iberian PPE and Workplace Safety Sector Dashboard

Public read-only dashboard built with Next.js, Supabase Postgres, and a manual Excel import workflow.

## Scope

This project is a standalone single-sector app:

- Sector: `Iberian PPE and Workplace Safety Sector`
- Sector code: `009`
- Project slug: `iberian-ppe-and-workplace-safety-sector`
- Pages kept as-is:
  - `Overview`
  - `Companies`
  - `Geography`
  - `Ownership Groups`

The UI is not multi-sector. The shared Supabase database is multi-sector through `sector_code`.

## Sector Description

The Iberian PPE and workplace safety sector is a robust market spanning Spain and Portugal, dedicated to upholding rigorous EU safety standards through high-quality protective gear and health services. This industry is fueled by a strong industrial landscape and a growing corporate emphasis on employee well-being, risk prevention, and ESG compliance. From traditional manufacturing to modern construction, the sector continues to evolve by integrating innovative technology to keep the region's workforce safe and productive.

## Sector Attributes

Dashboard columns after `Q` must match these attributes exactly:

- `Fall protection PPE`
- `Hearing protection`
- `Hand and arm protection`
- `Foot and leg protection`
- `Eye and face protection`
- `Respiratory protection`
- `Head protection`
- `Protective clothing`
- `Workplace safety equipment non worn`
- `Consumables and disposables`
- `Manufacturing`
- `Distribution`

## Data Rules

- `BvD Code` is the company business identifier inside a sector.
- Company identity in the shared database is `(sector_code, bvd_code)`.
- `Dashboard.xlsx` is the primary sector membership file.
- `SABI.xlsx` enriches matched companies only.
- In `Dashboard.xlsx`, columns `A:Q` are standard fields.
- Every column after `Q` is treated as a boolean sector attribute.
- Boolean conversion in `Dashboard.xlsx`:
  - `✓` => `true`
  - `⮽` => `false`
  - `x` => `false`
  - `X` => `false`
  - empty => `false`
- Monetary values from `kEUR` / `th EUR` are multiplied by `1000` during import.
- The UI shows monetary values in EUR using compact million formatting where applicable.
- SABI-only companies that do not exist in `Dashboard.xlsx` are ignored.
- Cleanup deletes only rows where `sector_code = SECTOR_CODE`.

## Files Expected By The Importer

Preferred location:

- `data/input/Dashboard.xlsx`
- `data/input/SABI.xlsx`

Fallback also supported:

- `Dashboard.xlsx`
- `SABI.xlsx`

The importer checks the project root first, then `data/input/`.

## Supabase Environment Variables

Use the shared Supabase project API URL:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vbmghaenmoulwovfepdc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SECTOR_CODE=009
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` may also be the Supabase dashboard project URL; the app normalizes it to the API URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is used by the read-only frontend.
- `SUPABASE_SERVICE_ROLE_KEY` is used only by `scripts/import-data.ts`.
- In Vercel, add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SECTOR_CODE`.
- Optionally add `CRON_SECRET` in Vercel to protect the keep-alive endpoint.
- Do not add `SUPABASE_SERVICE_ROLE_KEY` to Vercel unless you intentionally run maintenance/import scripts there.

## Supabase Availability

Supabase can pause Free Plan projects with low activity after 7 days. The only guaranteed way to prevent inactivity pauses is upgrading the Supabase project to Pro.

This app also includes a lightweight keep-alive mitigation for Free Plan projects:

- Vercel Cron calls `/api/keepalive` once per day.
- The route performs tiny read-only Supabase queries for the configured `SECTOR_CODE`.
- It uses only the anon key and never uses the service role key.
- The route is idempotent and does not insert, update, or delete data.
- If `CRON_SECRET` is set in Vercel, Vercel sends it as a bearer token and the endpoint requires it.

The cron is configured in `vercel.json`:

```json
{
  "path": "/api/keepalive",
  "schedule": "0 6 * * *"
}
```

If the database is already paused, first unpause it from the Supabase dashboard. The cron can help prevent future inactivity pauses, but it cannot wake a paused project by itself.

## SQL

Apply the SQL in:

- `supabase/migrations/20260421173000_init_sector_dashboard.sql`

It creates:

- `public.sectors`
- `public.companies` with unique `(sector_code, bvd_code)`
- `public.company_attributes` with unique `(sector_code, bvd_code, attribute_key)`
- `public.company_financial_history` with unique `(sector_code, bvd_code, metric_key, period_offset)`
- composite foreign keys, indexes, `updated_at` triggers, and public read RLS policies

## Local Setup

Install dependencies:

```bash
pnpm install
```

Copy envs if needed:

```bash
cp .env.example .env.local
```

Apply the SQL in the Supabase SQL editor, then import:

```bash
pnpm import:data
```

Run locally:

```bash
pnpm dev
```

## Import Flow

The importer:

1. Reads `SECTOR_CODE`.
2. Upserts the sector row into `sectors`.
3. Reads and validates `Dashboard.xlsx`.
4. Converts boolean attributes after column `Q`.
5. Reads and normalizes `SABI.xlsx`.
6. Merges both files by `BvD Code`.
7. Upserts `companies` using `sector_code,bvd_code`.
8. Rebuilds `company_attributes` only for this sector.
9. Rebuilds `company_financial_history` only for this sector.
10. Removes stale companies only inside this sector.

## Verification Commands

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm import:data
```

## Deploy To Vercel

1. Create a new Vercel project for this sector copy.
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SECTOR_CODE`
   - `CRON_SECRET` optional but recommended
3. Deploy with Vercel's Next.js defaults.
4. Confirm Vercel shows one Cron Job for `/api/keepalive`.
5. Import data locally or from a secure maintenance environment after SQL is applied.
