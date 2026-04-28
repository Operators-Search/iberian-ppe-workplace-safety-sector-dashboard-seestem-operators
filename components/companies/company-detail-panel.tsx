import { LazyCompanyHistoryChart } from "@/components/charts/lazy-company-history-chart";
import { formatCurrencyCompact, formatDate, formatInteger, formatPercent, formatRatio } from "@/lib/format";
import { getAttributeLabel, getMessages, getMetricLabel, type Locale } from "@/lib/i18n";
import { ATTRIBUTE_DEFINITIONS, type CompanyDirectoryRow, type CompanyHistorySeries } from "@/types/data";

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export function CompanyDetailPanel({
  company,
  history,
  locale,
}: {
  company: CompanyDirectoryRow | null;
  history: CompanyHistorySeries[];
  locale: Locale;
}) {
  const copy = getMessages(locale);

  if (!company) {
    return (
      <aside className="rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)] shadow-[var(--shadow)]">
        {copy.companyDetail.empty}
      </aside>
    );
  }

  const attributeEntries = Object.entries(company.attributes).filter(([, value]) => value);

  return (
    <aside className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {copy.companyDetail.badge}
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {company.nombre ?? copy.companiesTable.unnamedCompany}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {company.pais ?? "-"} / {company.displayRegion} / {company.propietario ?? copy.companyDetail.noOwner}
          </p>
        </div>
        {company.webpage ? (
          <a
            href={company.webpage}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            {copy.companyDetail.visitWebsite}
          </a>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <DetailMetric label={copy.companyDetail.revenue} value={formatCurrencyCompact(company.t_o, locale)} />
        <DetailMetric label={copy.companyDetail.ebitda} value={formatCurrencyCompact(company.ebitda, locale)} />
        <DetailMetric label={copy.companyDetail.ebitdaPct} value={formatPercent(company.ebitda_pct, locale)} />
        <DetailMetric label={copy.companyDetail.netDebt} value={formatCurrencyCompact(company.net_debt, locale)} />
        <DetailMetric label={copy.companyDetail.employees} value={formatInteger(company.empleados, locale)} />
        <DetailMetric label={copy.companyDetail.cagr} value={formatPercent(company.cagr, locale)} />
        <DetailMetric label={copy.companyDetail.ndEbitda} value={formatRatio(company.nd_ebitda, locale)} />
        <DetailMetric label={copy.companyDetail.wcTo} value={formatPercent(company.wc_t_o, locale)} />
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.companyDetail.sectorAttributes}</h3>
        <div className="flex flex-wrap gap-2">
          {attributeEntries.length === 0 ? (
            <span className="text-sm text-[var(--muted)]">{copy.companyDetail.noAttributes}</span>
          ) : (
            attributeEntries.map(([key]) => (
              <span
                key={key}
                className="inline-flex items-center rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-sm font-medium text-[var(--accent-strong)]"
              >
                {getAttributeLabel(locale, key as (typeof ATTRIBUTE_DEFINITIONS)[number]["key"])}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <DetailMetric label={copy.companyDetail.nif} value={company.nif ?? "-"} />
        <DetailMetric label={copy.companyDetail.foundationDate} value={formatDate(company.fecha_fundacion, locale)} />
        <DetailMetric label={copy.companyDetail.currentStatus} value={company.situacion_actual ?? "-"} />
        <DetailMetric label={copy.companyDetail.latestYearAvailable} value={formatDate(company.ultimo_ano_disponible, locale)} />
        <DetailMetric label={copy.companyDetail.latestPeriodEnd} value={formatDate(company.latest_period_end, locale)} />
        <DetailMetric label={copy.companyDetail.ultimateOwner} value={company.propietario_final_global ?? "-"} />
        <DetailMetric label={copy.companyDetail.caeCode} value={company.cae_codigo ?? "-"} />
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.companyDetail.descriptionProfile}</h3>
        <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[var(--foreground)]">
          <p>{company.cae_descripcion ?? "-"}</p>
          <p>{company.actividad_descripcion ?? "-"}</p>
          {company.english_trade_description ? <p>{company.english_trade_description}</p> : null}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{copy.companyDetail.historicalMetrics}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {copy.companyDetail.historicalDescription}
          </p>
        </div>
        {history.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
            {copy.companyDetail.noHistoricalData}
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((series) => (
              <LazyCompanyHistoryChart
                key={series.metricKey}
                series={series}
                locale={locale}
                metricLabel={getMetricLabel(locale, series.metricKey)}
                labels={copy.charts.history}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
