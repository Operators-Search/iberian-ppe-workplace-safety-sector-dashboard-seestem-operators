# PRD - Iberian PPE and Workplace Safety Sector Dashboard

## 1. Objective

Create a public, simple, visual web app for the `Iberian PPE and Workplace Safety Sector`, using two manually prepared Excel files.

The app helps users:

- understand the sector quickly,
- explore and filter companies,
- identify ownership groups,
- visualize aggregate financial metrics and sector attributes.

## 2. Scope

This is a single-sector app. It must not become a multi-sector UI.

Pages:

1. `Overview`
2. `Companies`
3. `Geography`
4. `Ownership Groups`

The shared Supabase database is prepared for future sectors through `sector_code`.

## 3. Sector

- Sector name: `Iberian PPE and Workplace Safety Sector`
- Sector code: `009`
- Slug: `iberian-ppe-and-workplace-safety-sector`
- Company identity: `(sector_code, bvd_code)`

The sector spans Spain and Portugal, covering PPE, workplace safety equipment, protective gear, health services, risk prevention, and ESG-related workplace safety requirements.

## 4. Sources

### Dashboard.xlsx

Contains one row per company with:

- general fields,
- dashboard financial metrics,
- boolean sector attributes.

Columns `A:Q` are standard fields. Every column after `Q` is a sector boolean attribute.

### SABI.xlsx

Contains additional profile, ownership, financial, and history fields. It enriches companies that also exist in `Dashboard.xlsx`.

## 5. Boolean Attributes

Use exactly these attributes:

- Fall protection PPE
- Hearing protection
- Hand and arm protection
- Foot and leg protection
- Eye and face protection
- Respiratory protection
- Head protection
- Protective clothing
- Workplace safety equipment non worn
- Consumables and disposables
- Manufacturing
- Distribution

Boolean conversion:

- `✓` = `true`
- `⮽`, `x`, `X`, or empty = `false`

## 6. Data Model

### sectors

- `sector_code` primary key
- `name`
- `slug`
- `description`
- timestamps

### companies

- `sector_code`
- `bvd_code`
- unique `(sector_code, bvd_code)`
- company profile fields from Dashboard/SABI
- financial latest-year fields
- `source_dashboard`
- `source_sabi`
- `raw_json_sabi`
- timestamps

### company_attributes

- `sector_code`
- `bvd_code`
- `attribute_key`
- `attribute_label`
- `value`
- unique `(sector_code, bvd_code, attribute_key)`

### company_financial_history

- `sector_code`
- `bvd_code`
- `metric_key`
- `metric_label`
- `period_offset`
- `value`
- unique `(sector_code, bvd_code, metric_key, period_offset)`

## 7. Import Rules

The import is manual.

1. Read `SECTOR_CODE`.
2. Upsert the sector row in `sectors`.
3. Read `Dashboard.xlsx`.
4. Validate standard columns `A:Q`.
5. Validate attributes after `Q`.
6. Convert boolean attributes.
7. Read `SABI.xlsx`.
8. Merge by `BvD Code`.
9. Convert `kEUR` / `th EUR` values to EUR by multiplying by `1000`.
10. Upsert companies, attributes, and history using `sector_code`.
11. Delete stale data only inside `where sector_code = SECTOR_CODE`.

## 8. UX Rules

- Keep the app read-only.
- Keep BvD Code hidden in visible UI unless technically needed.
- No admin UI.
- No auth.
- No sector selector.
- Keep labels available in English, Spanish, and Portuguese.

## 9. Acceptance Criteria

The project is acceptable when:

- all frontend queries filter by `SECTOR_CODE`,
- the importer never deletes or mutates other sectors,
- the SQL supports multiple sectors in the same database,
- the four existing pages still work,
- monetary values are stored in EUR and displayed compactly,
- the project is ready for Supabase SQL, data import, and Vercel deployment.
