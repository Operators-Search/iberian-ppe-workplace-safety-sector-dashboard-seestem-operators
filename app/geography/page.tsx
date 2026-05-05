import Link from "next/link";
import { ChartCard } from "@/components/chart-card";
import { GeographyKpiStrip } from "@/components/geography/geography-kpi-strip";
import { IberiaChoroplethMap } from "@/components/geography/iberia-choropleth-map";
import { RegionRanking } from "@/components/geography/region-ranking";
import { PageHero } from "@/components/layout/page-hero";
import { getGeographyPageData, parseGeographyCountryScope } from "@/lib/geography";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { buildSearchParams, toUrlSearchParams } from "@/lib/search-params";
import type { GeographyCountryScope, GeographySearchParams } from "@/types/data";

export const dynamic = "force-dynamic";

type GeographyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GeographyPage({ searchParams }: GeographyPageProps) {
  const locale = await getRequestLocale();
  const copy = getMessages(locale);
  const resolvedSearchParams = (await searchParams) as GeographySearchParams;
  const currentSearchParams = toUrlSearchParams(
    resolvedSearchParams as Record<string, string | string[] | undefined>,
  );
  const scope = parseGeographyCountryScope(
    Array.isArray(resolvedSearchParams.scope) ? resolvedSearchParams.scope[0] : resolvedSearchParams.scope,
  );
  const data = await getGeographyPageData(locale, scope);
  const scopeOptions: Array<{ value: GeographyCountryScope; label: string }> = [
    { value: "all", label: copy.geography.scopeOptions.all },
    { value: "spain", label: copy.geography.scopeOptions.spain },
    { value: "portugal", label: copy.geography.scopeOptions.portugal },
  ];
  const unmatchedLabels = data.unmatchedRegions.map((item) => item.label).join(", ");

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={copy.geography.eyebrow}
        title={copy.geography.title}
        description={copy.geography.description}
      />

      <section className="flex flex-wrap items-center gap-3 rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,251,255,0.92))] px-4 py-4 shadow-[var(--shadow)]">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {copy.geography.scopeLabel}
        </span>
        <div className="flex flex-wrap gap-2">
          {scopeOptions.map((option) => {
            const search = buildSearchParams(currentSearchParams, {
              scope: option.value === "all" ? null : option.value,
            });
            const href = search ? `/geography?${search}` : "/geography";
            const isActive = option.value === scope;

            return (
              <Link
                key={option.value}
                href={href}
                scroll={false}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition duration-200",
                  isActive
                    ? "border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-alt))] text-white shadow-[var(--shadow)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[rgba(33,150,243,0.06)]",
                ].join(" ")}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </section>

      <GeographyKpiStrip kpis={data.kpis} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard
          title={copy.geography.mapTitle}
          description={copy.geography.mapDescription(data.mappedCompanies, data.totalCompanies)}
        >
          <div className="space-y-4">
            <IberiaChoroplethMap regions={data.regions} locale={locale} />
            {data.unmappedCompanies > 0 ? (
              <p className="text-sm leading-6 text-[var(--muted)]">
                {copy.geography.unmappedNote(data.unmappedCompanies, unmatchedLabels)}
              </p>
            ) : null}
          </div>
        </ChartCard>

        <ChartCard title={copy.geography.rankingTitle} description={copy.geography.rankingDescription}>
          <RegionRanking items={data.ranking} locale={locale} />
        </ChartCard>
      </section>
    </div>
  );
}
