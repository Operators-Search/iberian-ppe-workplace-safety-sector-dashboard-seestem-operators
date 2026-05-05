import { ChartCard } from "@/components/chart-card";
import { LazyDistributionBarChart } from "@/components/charts/lazy-distribution-bar-chart";
import { LazySectorBubbleChart } from "@/components/charts/lazy-sector-bubble-chart";
import { KpiCard } from "@/components/kpi-card";
import { PageHero } from "@/components/layout/page-hero";
import { RankingTable } from "@/components/overview/ranking-table";
import { getOverviewStats } from "@/lib/data";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const locale = await getRequestLocale();
  const copy = getMessages(locale);
  const overview = await getOverviewStats(locale);

  return (
    <div className="space-y-6">
      <PageHero eyebrow={copy.overview.eyebrow} title={copy.sidebar.title} description={copy.metadata.description} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overview.kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} helper={kpi.helper} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ChartCard
          title={copy.overview.bubbleTitle}
          description={copy.overview.bubbleDescription(overview.bubbleIncludedCount, overview.totalCompanyCount)}
        >
          <LazySectorBubbleChart
            data={overview.bubblePoints}
            locale={locale}
            labels={copy.charts.bubble}
          />
        </ChartCard>
        <ChartCard
          title={copy.overview.countryTitle}
          description={copy.overview.countryDescription}
        >
          <LazyDistributionBarChart
            data={overview.countryDistribution}
            locale={locale}
            labels={copy.charts.distribution}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title={copy.overview.regionTitle}
          description={copy.overview.regionDescription}
        >
          <LazyDistributionBarChart
            data={overview.regionDistribution}
            locale={locale}
            labels={copy.charts.distribution}
          />
        </ChartCard>
        <ChartCard
          title={copy.overview.attributeTitle}
          description={copy.overview.attributeDescription}
        >
          <LazyDistributionBarChart
            data={overview.attributeDistribution}
            locale={locale}
            labels={copy.charts.distribution}
          />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RankingTable title={copy.overview.topRevenueTitle} companies={overview.topRevenueCompanies} metricKey="t_o" locale={locale} />
        <RankingTable title={copy.overview.topEbitdaTitle} companies={overview.topEbitdaCompanies} metricKey="ebitda" locale={locale} />
      </section>
    </div>
  );
}
