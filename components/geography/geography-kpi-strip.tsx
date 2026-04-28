import { KpiCard } from "@/components/kpi-card";
import type { KpiStat } from "@/types/data";

export function GeographyKpiStrip({ kpis }: { kpis: KpiStat[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} helper={kpi.helper} />
      ))}
    </section>
  );
}
