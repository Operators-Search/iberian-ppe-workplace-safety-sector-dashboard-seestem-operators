"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { formatCurrencyCompact, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { SectorBubblePoint } from "@/types/data";

const COUNTRY_COLORS: Record<string, string> = {
  PORTUGAL: "#26A69A",
  SPAIN: "#2196F3",
};

export function SectorBubbleChart({
  data,
  locale,
  labels,
}: {
  data: SectorBubblePoint[];
  locale: Locale;
  labels: {
    country: string;
    turnover: string;
    cagr: string;
    ebitdaPct: string;
    owner: string;
    noOwner: string;
  };
}) {
  const countries = Array.from(new Set(data.map((point) => point.pais)));

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 8 }}>
          <CartesianGrid stroke="#d7e7f2" />
          <XAxis
            dataKey="x"
            type="number"
            name={labels.cagr}
            tickFormatter={(value: number) => formatPercent(value, locale)}
            tick={{ fill: "#536273", fontSize: 12 }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name={labels.ebitdaPct}
            tickFormatter={(value: number) => formatPercent(value, locale)}
            tick={{ fill: "#536273", fontSize: 12 }}
          />
          <ZAxis dataKey="z" type="number" name={labels.turnover} range={[80, 2800]} />
          <Tooltip
            cursor={{ strokeDasharray: "4 4" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }

              const item = payload[0]?.payload as SectorBubblePoint;

              return (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow)]">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item.nombre}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{labels.country}: {item.pais}</p>
                  <p className="text-sm text-[var(--muted)]">{labels.turnover}: {formatCurrencyCompact(item.z, locale)}</p>
                  <p className="text-sm text-[var(--muted)]">{labels.cagr}: {formatPercent(item.x, locale)}</p>
                  <p className="text-sm text-[var(--muted)]">{labels.ebitdaPct}: {formatPercent(item.y, locale)}</p>
                  <p className="text-sm text-[var(--muted)]">{labels.owner}: {item.propietario ?? labels.noOwner}</p>
                </div>
              );
            }}
          />
          {countries.map((country) => (
            <Scatter
              key={country}
              name={country}
              data={data.filter((item) => item.pais === country)}
              fill={COUNTRY_COLORS[country] ?? "#2196F3"}
              fillOpacity={0.72}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
