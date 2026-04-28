"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyCompact, formatInteger } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { CompanyHistorySeries } from "@/types/data";

const LINE_COLORS: Record<CompanyHistorySeries["metricKey"], string> = {
  volume_negocios: "#2196F3",
  net_debt: "#167FD1",
  ebitda: "#26A69A",
  ebit: "#1F8A80",
  empleados: "#2196F3",
};

function formatHistoryValue(metricKey: CompanyHistorySeries["metricKey"], value: number, locale: Locale) {
  if (metricKey === "empleados") {
    return formatInteger(value, locale);
  }

  return formatCurrencyCompact(value, locale);
}

export function CompanyHistoryChart({
  series,
  locale,
  metricLabel,
  labels,
}: {
  series: CompanyHistorySeries;
  locale: Locale;
  metricLabel: string;
  labels: {
    year: string;
    value: string;
  };
}) {
  const strokeColor = LINE_COLORS[series.metricKey] ?? "#2196F3";

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{metricLabel}</h3>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#d7e7f2" />
            <XAxis dataKey="yearLabel" tick={{ fill: "#536273", fontSize: 12 }} />
            <YAxis
              tickFormatter={(value: number) => formatHistoryValue(series.metricKey, value, locale)}
              tick={{ fill: "#536273", fontSize: 12 }}
              width={80}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const item = payload[0];

                return (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow)]">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{metricLabel}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{labels.year}: {label}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {labels.value}: {formatHistoryValue(series.metricKey, Number(item.value), locale)}
                    </p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={3}
              dot={{ r: 4, fill: strokeColor }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
