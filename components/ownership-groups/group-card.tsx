import { formatCurrencyCompact, formatInteger, formatPercent } from "@/lib/format";
import { getMessages, type Locale } from "@/lib/i18n";
import type { OwnershipGroupSummary } from "@/types/data";

export function OwnershipGroupCard({
  group,
  defaultOpen = false,
  locale,
}: {
  group: OwnershipGroupSummary;
  defaultOpen?: boolean;
  locale: Locale;
}) {
  const copy = getMessages(locale);

  return (
    <details
      open={defaultOpen}
      className="group rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
    >
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.ownershipCard.badge}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">{group.owner}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {copy.ownershipCard.summary(group.companyCount, formatPercent(group.averageEbitdaPct, locale))}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.ownershipCard.revenue}</p>
              <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                {formatCurrencyCompact(group.totalRevenue, locale)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.ownershipCard.ebitda}</p>
              <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                {formatCurrencyCompact(group.totalEbitda, locale)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.ownershipCard.netDebt}</p>
              <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                {formatCurrencyCompact(group.totalNetDebt, locale)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{copy.ownershipCard.employees}</p>
              <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                {formatInteger(group.totalEmployees, locale)}
              </p>
            </div>
          </div>
        </div>
      </summary>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">{copy.ownershipCard.company}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">{copy.ownershipCard.country}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--muted)]">{copy.ownershipCard.region}</th>
              <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">{copy.ownershipCard.revenue}</th>
              <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">{copy.ownershipCard.ebitda}</th>
              <th className="px-4 py-3 text-right font-semibold text-[var(--muted)]">{copy.ownershipCard.employees}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {group.companies.map((company) => (
              <tr key={company.bvd_code}>
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--foreground)]">{company.nombre ?? copy.ownershipCard.unnamedCompany}</div>
                </td>
                <td className="px-4 py-3 text-[var(--foreground)]">{company.pais ?? "-"}</td>
                <td className="px-4 py-3 text-[var(--foreground)]">{company.displayRegion}</td>
                <td className="px-4 py-3 text-right text-[var(--foreground)]">{formatCurrencyCompact(company.t_o, locale)}</td>
                <td className="px-4 py-3 text-right text-[var(--foreground)]">
                  <div>{formatCurrencyCompact(company.ebitda, locale)}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{formatPercent(company.ebitda_pct, locale)}</div>
                </td>
                <td className="px-4 py-3 text-right text-[var(--foreground)]">{formatInteger(company.empleados, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
