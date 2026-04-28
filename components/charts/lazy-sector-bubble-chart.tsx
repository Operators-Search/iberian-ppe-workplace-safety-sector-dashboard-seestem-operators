"use client";

import dynamic from "next/dynamic";
import { ChartPlaceholder } from "@/components/charts/chart-placeholder";

export const LazySectorBubbleChart = dynamic(
  () => import("@/components/charts/sector-bubble-chart").then((module) => module.SectorBubbleChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder heightClassName="h-[420px]" />,
  },
);
