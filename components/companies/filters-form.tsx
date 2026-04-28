import Link from "next/link";
import { USE_COMPACT_COMPANIES_LAYOUT } from "@/components/companies/layout-options";
import { getAttributeDefinitions, getMessages, type Locale } from "@/lib/i18n";
import type { CompanyFilterOptions, CompanyFilters } from "@/types/data";

type FiltersFormProps = {
  filters: CompanyFilters;
  options: CompanyFilterOptions;
  locale: Locale;
};

function NumberInput({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: number | null;
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</span>
      <input
        type="number"
        name={name}
        defaultValue={value ?? ""}
        className="w-full min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
      />
    </label>
  );
}

export function CompanyFiltersForm({ filters, options, locale }: FiltersFormProps) {
  const copy = getMessages(locale);
  const attributes = getAttributeDefinitions(locale);
  const topGridClassName = USE_COMPACT_COMPANIES_LAYOUT
    ? "grid gap-4 lg:grid-cols-2 2xl:grid-cols-[1.3fr_0.9fr_1fr_1fr]"
    : "grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr]";
  const numberGridClassName = USE_COMPACT_COMPANIES_LAYOUT
    ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
    : "grid gap-4 lg:grid-cols-4";
  const attributeContainerClassName = USE_COMPACT_COMPANIES_LAYOUT
    ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    : "flex flex-wrap gap-3";
  const attributeLabelClassName = USE_COMPACT_COMPANIES_LAYOUT
    ? "flex min-w-0 items-start gap-2 rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)]"
    : "inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground)]";

  return (
    <form
      method="get"
      className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
    >
      <input type="hidden" name="sort" value={filters.sort} />

      <div className="flex flex-col gap-5">
        <div className={topGridClassName}>
          <label className="grid min-w-0 gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.filters.companySearch}</span>
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder={copy.filters.companySearchPlaceholder}
              className="w-full min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="grid min-w-0 gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.filters.country}</span>
            <select
              name="country"
              defaultValue={filters.country}
              className="w-full min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            >
              <option value="">{copy.filters.allCountries}</option>
              {options.countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>

          <label className="grid min-w-0 gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.filters.region}</span>
            <select
              name="region"
              defaultValue={filters.region}
              className="w-full min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            >
              <option value="">{copy.filters.allRegions}</option>
              {options.regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <label className="grid min-w-0 gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.filters.owner}</span>
            <select
              name="owner"
              defaultValue={filters.owner}
              className="w-full min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            >
              <option value="">{copy.filters.allOwners}</option>
              {options.owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={numberGridClassName}>
          <NumberInput label={copy.filters.revenueMin} name="revenueMin" value={filters.revenueMin} />
          <NumberInput label={copy.filters.revenueMax} name="revenueMax" value={filters.revenueMax} />
          <NumberInput label={copy.filters.ebitdaMin} name="ebitdaMin" value={filters.ebitdaMin} />
          <NumberInput label={copy.filters.ebitdaMax} name="ebitdaMax" value={filters.ebitdaMax} />
          <NumberInput label={copy.filters.ebitdaPctMin} name="ebitdaPctMin" value={filters.ebitdaPctMin} />
          <NumberInput label={copy.filters.ebitdaPctMax} name="ebitdaPctMax" value={filters.ebitdaPctMax} />
          <NumberInput label={copy.filters.netDebtMin} name="netDebtMin" value={filters.netDebtMin} />
          <NumberInput label={copy.filters.netDebtMax} name="netDebtMax" value={filters.netDebtMax} />
          <NumberInput label={copy.filters.employeesMin} name="employeesMin" value={filters.employeesMin} />
          <NumberInput label={copy.filters.employeesMax} name="employeesMax" value={filters.employeesMax} />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.filters.sectorAttributes}</p>
          <div className={attributeContainerClassName}>
            {attributes.map((attribute) => (
              <label
                key={attribute.key}
                className={attributeLabelClassName}
              >
                <input
                  type="checkbox"
                  name="attributes"
                  value={attribute.key}
                  defaultChecked={filters.attributes.includes(attribute.key)}
                  className="mt-0.5 shrink-0 accent-[var(--accent)]"
                />
                <span className="min-w-0 whitespace-normal leading-5">{attribute.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            {copy.filters.apply}
          </button>
          <Link
            href="/companies"
            scroll={false}
            className="inline-flex items-center rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent-soft)]/60"
          >
            {copy.filters.reset}
          </Link>
          <p className="text-sm text-[var(--muted)]">{copy.filters.andLogic}</p>
        </div>
      </div>
    </form>
  );
}
