import Link from "next/link";
import { formatCurrencyCompact, formatInteger, formatPercent } from "@/lib/format";
import { getMessages, type Locale } from "@/lib/i18n";
import type { CompanyDirectoryRow } from "@/types/data";

type RankingTableProps = {
  title: string;
  companies: CompanyDirectoryRow[];
  metricKey: "t_o" | "ebitda";
  locale: Locale;
};

export function RankingTable({ title, companies, metricKey, locale }: RankingTableProps) {
  const copy = getMessages(locale);

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
        <Link href="/companies" className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]">
          {copy.ranking.viewAll}
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">{copy.ranking.company}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">{copy.ranking.country}</th>
              <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">{copy.ranking.metric}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {companies.map((company) => (
              <tr key={company.bvd_code}>
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--foreground)]">{company.nombre ?? copy.companiesTable.unnamedCompany}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{company.displayRegion}</div>
                </td>
                <td className="px-4 py-3 text-[var(--foreground)]">{company.pais ?? "-"}</td>
                <td className="px-4 py-3 text-right text-[var(--foreground)]">
                  <div className="font-semibold">
                    {metricKey === "t_o"
                      ? formatCurrencyCompact(company.t_o, locale)
                      : formatCurrencyCompact(company.ebitda, locale)}
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {copy.ranking.metricSummary(
                      formatPercent(company.ebitda_pct, locale),
                      formatInteger(company.empleados, locale),
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
