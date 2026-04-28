import Link from "next/link";
import { formatCurrencyCompact, formatInteger, formatPercent } from "@/lib/format";
import { getMessages, type Locale } from "@/lib/i18n";
import { buildSearchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import type { CompanyDirectoryRow } from "@/types/data";

type CompaniesTableProps = {
  companies: CompanyDirectoryRow[];
  currentSearchParams: URLSearchParams;
  sort: string;
  selectedCompanyCode: string | null;
  locale: Locale;
};

export function CompaniesTable({
  companies,
  currentSearchParams,
  sort,
  selectedCompanyCode,
  locale,
}: CompaniesTableProps) {
  const copy = getMessages(locale);
  const sortHeaders = [
    { key: "name_asc", label: copy.companiesTable.company },
    { key: "revenue_desc", label: copy.companiesTable.revenue },
    { key: "ebitda_desc", label: copy.companiesTable.ebitda },
    { key: "employees_desc", label: copy.companiesTable.employees },
    { key: "cagr_desc", label: copy.companiesTable.cagr },
  ] as const;

  return (
    <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              {sortHeaders.map((header) => (
                <th key={header.key} className="px-4 py-3 text-left font-semibold text-[var(--muted)]">
                  <Link
                    href={`/companies?${buildSearchParams(currentSearchParams, {
                      sort: header.key,
                      page: 1,
                    })}`}
                    scroll={false}
                    className={cn(
                      "inline-flex items-center gap-2 transition hover:text-[var(--foreground)]",
                      sort === header.key ? "text-[var(--foreground)]" : "",
                    )}
                  >
                    {header.label}
                    {sort === header.key ? <span className="text-[var(--accent)]">*</span> : null}
                  </Link>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">{copy.companiesTable.country}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">{copy.companiesTable.region}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">{copy.companiesTable.owner}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {companies.map((company) => {
              const isSelected = selectedCompanyCode === company.bvd_code;
              return (
                <tr
                  key={company.bvd_code}
                  className={cn(isSelected ? "bg-[var(--accent-soft)]/55" : "hover:bg-[var(--surface-muted)]/50")}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/companies?${buildSearchParams(currentSearchParams, {
                        selected: company.bvd_code,
                      })}`}
                      scroll={false}
                      className="block"
                    >
                      <div className="font-medium text-[var(--foreground)]">
                        {company.nombre ?? copy.companiesTable.unnamedCompany}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{formatCurrencyCompact(company.t_o, locale)}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    <div>{formatCurrencyCompact(company.ebitda, locale)}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{formatPercent(company.ebitda_pct, locale)}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{formatInteger(company.empleados, locale)}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{formatPercent(company.cagr, locale)}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{company.pais ?? "-"}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{company.displayRegion}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{company.propietario ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
