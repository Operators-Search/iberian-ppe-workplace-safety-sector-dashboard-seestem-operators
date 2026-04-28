"use client";

import dynamic from "next/dynamic";
import { ChartPlaceholder } from "@/components/charts/chart-placeholder";

export const LazyDistributionBarChart = dynamic(
  () => import("@/components/charts/distribution-bar-chart").then((module) => module.DistributionBarChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder heightClassName="h-[320px]" />,
  },
);
