# The Iberian Freight Forwarding Sector Dashboard

Public read-only sector dashboard built with Next.js, Supabase Postgres, and a manual Excel import workflow.

## Scope

This project is a standalone copy for a single sector only:

- Sector: `The Iberian freight forwarding sector`
- Short project name: `Freight Forwarding`
- Pages kept as-is:
  - `Overview`
  - `Companies`
  - `Geography`
  - `Ownership Groups`

The current architecture stays unchanged:

- no multi-sector mode
- no admin
- no auth
- no storage
- no UI import flow

## What changed for this sector

- UI copy, metadata, and labels were adapted to freight forwarding
- The sector attributes were replaced with the new freight forwarding attribute set
- The importer now validates the new `Dashboard.xlsx` layout and reads the new Excel files
- `BvD Code` remains the unique identifier for joins and imports, but stays hidden from the visible UI
- The project now points locally to the new standalone Supabase project

## Sector attributes

These are the active boolean attributes for this project:

- `Ocean freight`
- `Air freight`
- `Road freight`
- `Rail intermodal`
- `Customs clearance`
- `Temperature controlled cold chain`
- `Pharma or GDP related`
- `Dangerous goods chemicals`

## Data rules implemented

- `BvD Code` is the unique company identifier
- `Dashboard.xlsx` is the primary sector membership file
- `SABI.xlsx` enriches matched companies only
- In `Dashboard.xlsx`, columns `A:Q` are standard fields
- Every column after `Q` is treated as a sector boolean attribute
- Boolean conversion in `Dashboard.xlsx`:
  - `✓` => `true`
  - `⮽` => `false`
  - `x` => `false`
  - `X` => `false`
  - empty => `false`
- Monetary values coming from `th EUR` are converted to real `EUR` during import
- The UI keeps showing monetary values in EUR, with compact million formatting where applicable
- SABI-only companies that do not exist in the Dashboard file are ignored

## Files expected by the importer

Preferred location:

- `data/input/Dashboard.xlsx`
- `data/input/SABI.xlsx`

Fallback also supported:

- `Dashboard.xlsx`
- `SABI.xlsx`

In this workspace, both files already exist in the project root and in `data/input/`.

## Supabase environment variables

`NEXT_PUBLIC_SUPABASE_URL` must be the project API URL, not the Supabase dashboard URL.

Use:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://iaquoxyiyydkmbnynixe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Notes:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is used by the frontend for public read access
- `SUPABASE_SERVICE_ROLE_KEY` is used only by `scripts/import-data.ts`
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in Vercel client-side settings
- Vercel only needs:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## SQL to paste into Supabase

Use the existing schema file:

- `supabase/migrations/20260421173000_init_sector_dashboard.sql`

No schema change was required for this sector. The same tables are reused:

- `public.companies`
- `public.company_attributes`
- `public.company_financial_history`

That SQL also creates:

- indexes
- `updated_at` trigger
- RLS public `select` policies for the read-only frontend

## Local setup

Install dependencies:

```bash
pnpm install
```

Copy envs if needed:

```bash
cp .env.example .env.local
```

Import data:

```bash
pnpm import:data
```

Run locally:

```bash
pnpm dev
```

## Import flow

The importer does the following:

1. Reads `Dashboard.xlsx`
2. Validates the standard columns in `A:Q`
3. Validates the freight forwarding attribute columns after `Q`
4. Converts the attribute flags to booleans
5. Reads `SABI.xlsx`
6. Normalizes SABI headers
7. Merges both files by `BvD Code`
8. Upserts `companies`
9. Rebuilds `company_attributes`
10. Rebuilds `company_financial_history`
11. Removes stale companies no longer present in the current Dashboard file

## Verification commands

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm import:data
```

## Deploy to Vercel

1. Create a new Vercel project for this copy
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

Do not add `SUPABASE_SERVICE_ROLE_KEY` to the frontend deployment unless you intentionally run the importer in a secure server-side context.
