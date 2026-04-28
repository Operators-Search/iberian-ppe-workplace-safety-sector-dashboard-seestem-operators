"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { DistributionItem } from "@/types/data";

const BAR_COLORS = ["#2196F3", "#26A69A", "#5DB7F7", "#58C5BB", "#8AD3FA", "#93E0D9"];

type DistributionBarChartProps = {
  data: DistributionItem[];
  locale: Locale;
  showPercentage?: boolean;
  labels: {
    companies: string;
    share: string;
  };
};

export function DistributionBarChart({
  data,
  locale,
  showPercentage = true,
  labels,
}: DistributionBarChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 10 }}>
          <CartesianGrid stroke="#d7e7f2" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#536273", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tick={{ fill: "#000000", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(33, 150, 243, 0.08)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }

              const item = payload[0]?.payload as DistributionItem;

              return (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow)]">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{labels.companies}: {item.value}</p>
                  {showPercentage ? (
                    <p className="text-sm text-[var(--muted)]">{labels.share}: {formatPercent(item.share, locale)}</p>
                  ) : null}
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 14, 14, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
