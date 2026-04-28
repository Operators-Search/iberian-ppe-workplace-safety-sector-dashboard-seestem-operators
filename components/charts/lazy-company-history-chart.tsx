"use client";

import dynamic from "next/dynamic";
import { ChartPlaceholder } from "@/components/charts/chart-placeholder";

export const LazyCompanyHistoryChart = dynamic(
  () => import("@/components/charts/company-history-chart").then((module) => module.CompanyHistoryChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder heightClassName="h-[220px]" />,
  },
);
