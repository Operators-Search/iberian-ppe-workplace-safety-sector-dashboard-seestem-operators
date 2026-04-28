import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { formatCurrencyCompact, formatInteger, formatPercent } from "@/lib/format";
import { getAttributeLabel, getMessages, type Locale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ATTRIBUTE_DEFINITIONS,
  type CompaniesSearchParams,
  type CompanyAttributeKey,
  type CompanyAttributeRecord,
  type CompanyDirectoryRecord,
  type CompanyDirectoryRow,
  type CompanyFilterOptions,
  type CompanyFilters,
  type CompanyHistoryPoint,
  type CompanyHistorySeries,
  type CompanyListResult,
  type DistributionItem,
  type OverviewStats,
  type OwnershipGroupSummary,
} from "@/types/data";

const PAGE_SIZE = 20;
const DATA_REVALIDATE_SECONDS = 60 * 60;
const EXCLUDED_COMPANY_CODES = new Set(["0505561336U"]);
const HISTORY_METRIC_ORDER: CompanyHistoryPoint["metric_key"][] = [
  "volume_negocios",
  "ebitda",
  "empleados",
  "ebit",
  "net_debt",
];
const COMPANY_DIRECTORY_SELECT = `
  bvd_code,
  nombre,
  webpage,
  nif,
  pais,
  provincia,
  localidade,
  concelho,
  distrito,
  fecha_fundacion,
  situacion_actual,
  ultimo_ano_disponible,
  latest_period_end,
  empleados,
  propietario,
  propietario_final_global,
  cae_codigo,
  cae_descripcion,
  actividad_descripcion,
  english_trade_description,
  t_o,
  cagr,
  ebitda,
  ebitda_pct,
  net_debt,
  nd_ebitda,
  wc_t_o,
  company_attributes (
    bvd_code,
    attribute_key,
    attribute_label,
    value
  )
`;

type RawCompanyRow = CompanyDirectoryRecord & {
  company_attributes?: Array<CompanyAttributeRecord>;
};

const DEFAULT_ATTRIBUTE_STATE = ATTRIBUTE_DEFINITIONS.reduce(
  (accumulator, definition) => ({
    ...accumulator,
    [definition.key]: false,
  }),
  {} as Record<CompanyAttributeKey, boolean>,
);

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function parseNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getYear(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return null;
  }

  return date.getUTCFullYear();
}

function getDistribution(items: Array<string | null | undefined>, total: number, limit?: number): DistributionItem[] {
  const counts = new Map<string, number>();

  for (const item of items) {
    const normalized = item?.trim();
    if (!normalized) {
      continue;
    }

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  const sorted = Array.from(counts.entries())
    .map(([label, value]) => ({
      label,
      value,
      share: total === 0 ? 0 : value / total,
    }))
    .sort((left, right) => right.value - left.value);

  return limit ? sorted.slice(0, limit) : sorted;
}

function getMedian(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
  }

  return sorted[midpoint];
}

function createCompanyDirectoryRow(row: RawCompanyRow): CompanyDirectoryRow {
  const attributes = { ...DEFAULT_ATTRIBUTE_STATE };

  for (const attribute of row.company_attributes ?? []) {
    if (attribute.attribute_key in attributes) {
      attributes[attribute.attribute_key as CompanyAttributeKey] = attribute.value;
    }
  }

  return {
    ...row,
    attributes,
    displayRegion: row.provincia || row.distrito || row.concelho || row.localidade || "-",
  };
}

function isIncludedCompany(row: Pick<CompanyDirectoryRecord, "bvd_code">) {
  return !EXCLUDED_COMPANY_CODES.has(row.bvd_code);
}

const getCachedCompanyDirectoryRows = unstable_cache(async (): Promise<CompanyDirectoryRow[]> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .select(COMPANY_DIRECTORY_SELECT)
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`Failed to load companies: ${error.message}`);
  }

  return ((data ?? []) as RawCompanyRow[])
    .filter(isIncludedCompany)
    .map(createCompanyDirectoryRow);
}, ["company-directory-rows"], { revalidate: DATA_REVALIDATE_SECONDS });

export const getCompanyDirectoryRows = cache(async (): Promise<CompanyDirectoryRow[]> => getCachedCompanyDirectoryRows());

function matchesNumberRange(value: number | null, min: number | null, max: number | null) {
  if (min === null && max === null) {
    return true;
  }

  if (value === null) {
    return false;
  }

  if (min !== null && value < min) {
    return false;
  }

  if (max !== null && value > max) {
    return false;
  }

  return true;
}

export function parseCompaniesFilters(searchParams: CompaniesSearchParams): CompanyFilters {
  const attributeParam = searchParams.attributes;
  const rawAttributes = Array.isArray(attributeParam)
    ? attributeParam
    : attributeParam?.split(",").filter(Boolean) ?? [];
  const validAttributes = ATTRIBUTE_DEFINITIONS.map((item) => item.key);

  return {
    q: searchParams.q?.trim() ?? "",
    country: searchParams.country?.trim() ?? "",
    region: searchParams.region?.trim() ?? "",
    owner: searchParams.owner?.trim() ?? "",
    attributes: rawAttributes.filter((item): item is CompanyAttributeKey =>
      validAttributes.includes(item as CompanyAttributeKey),
    ),
    revenueMin: parseNumber(searchParams.revenueMin),
    revenueMax: parseNumber(searchParams.revenueMax),
    ebitdaMin: parseNumber(searchParams.ebitdaMin),
    ebitdaMax: parseNumber(searchParams.ebitdaMax),
    ebitdaPctMin: parseNumber(searchParams.ebitdaPctMin),
    ebitdaPctMax: parseNumber(searchParams.ebitdaPctMax),
    netDebtMin: parseNumber(searchParams.netDebtMin),
    netDebtMax: parseNumber(searchParams.netDebtMax),
    employeesMin: parseNumber(searchParams.employeesMin),
    employeesMax: parseNumber(searchParams.employeesMax),
    sort: searchParams.sort?.trim() || "revenue_desc",
    page: Math.max(1, Number(searchParams.page) || 1),
    selected: searchParams.selected?.trim() || null,
  };
}

function getFilterOptions(companies: CompanyDirectoryRow[]): CompanyFilterOptions {
  const uniqueValues = (items: Array<string | null | undefined>) =>
    Array.from(
      new Set(
        items
          .map((item) => item?.trim())
          .filter((item): item is string => Boolean(item)),
      ),
    ).sort((left, right) => left.localeCompare(right));

  return {
    countries: uniqueValues(companies.map((company) => company.pais)),
    regions: uniqueValues(companies.map((company) => company.displayRegion)),
    owners: uniqueValues(companies.map((company) => company.propietario)),
  };
}

function sortCompanies(items: CompanyDirectoryRow[], sort: string) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    switch (sort) {
      case "name_asc":
        return (left.nombre ?? "").localeCompare(right.nombre ?? "");
      case "ebitda_desc":
        return (right.ebitda ?? Number.NEGATIVE_INFINITY) - (left.ebitda ?? Number.NEGATIVE_INFINITY);
      case "employees_desc":
        return (right.empleados ?? Number.NEGATIVE_INFINITY) - (left.empleados ?? Number.NEGATIVE_INFINITY);
      case "cagr_desc":
        return (right.cagr ?? Number.NEGATIVE_INFINITY) - (left.cagr ?? Number.NEGATIVE_INFINITY);
      case "revenue_desc":
      default:
        return (right.t_o ?? Number.NEGATIVE_INFINITY) - (left.t_o ?? Number.NEGATIVE_INFINITY);
    }
  });

  return sorted;
}

function filterCompanies(items: CompanyDirectoryRow[], filters: CompanyFilters) {
  const normalizedQuery = normalizeText(filters.q);

  return items.filter((company) => {
    if (normalizedQuery && !normalizeText(company.nombre).includes(normalizedQuery)) {
      return false;
    }

    if (filters.country && company.pais !== filters.country) {
      return false;
    }

    if (filters.region && company.displayRegion !== filters.region) {
      return false;
    }

    if (filters.owner && company.propietario !== filters.owner) {
      return false;
    }

    if (!matchesNumberRange(company.t_o, filters.revenueMin, filters.revenueMax)) {
      return false;
    }

    if (!matchesNumberRange(company.ebitda, filters.ebitdaMin, filters.ebitdaMax)) {
      return false;
    }

    if (!matchesNumberRange(company.ebitda_pct, filters.ebitdaPctMin, filters.ebitdaPctMax)) {
      return false;
    }

    if (!matchesNumberRange(company.net_debt, filters.netDebtMin, filters.netDebtMax)) {
      return false;
    }

    if (!matchesNumberRange(company.empleados, filters.employeesMin, filters.employeesMax)) {
      return false;
    }

    return filters.attributes.every((attributeKey) => company.attributes[attributeKey]);
  });
}

export async function getOverviewStats(locale: Locale): Promise<OverviewStats> {
  const companies = await getCompanyDirectoryRows();
  const totalCompanies = companies.length;
  const copy = getMessages(locale);

  const totalRevenue = companies.reduce((sum, company) => sum + (company.t_o ?? 0), 0);
  const totalEbitda = companies.reduce((sum, company) => sum + (company.ebitda ?? 0), 0);
  const totalEmployees = companies.reduce((sum, company) => sum + (company.empleados ?? 0), 0);
  const cagrValues = companies
    .map((company) => company.cagr)
    .filter((value): value is number => value !== null);
  const averageCagr =
    cagrValues.length === 0 ? null : cagrValues.reduce((sum, value) => sum + value, 0) / cagrValues.length;
  const medianEbitdaPct = getMedian(
    companies.map((company) => company.ebitda_pct).filter((value): value is number => value !== null),
  );

  const attributeDistribution = ATTRIBUTE_DEFINITIONS.map((attribute) => {
    const value = companies.filter((company) => company.attributes[attribute.key]).length;
    return {
      label: getAttributeLabel(locale, attribute.key),
      value,
      share: totalCompanies === 0 ? 0 : value / totalCompanies,
    };
  });

  const bubblePoints = companies
    .filter(
      (company) =>
        company.nombre &&
        company.pais &&
        company.t_o !== null &&
        company.cagr !== null &&
        company.ebitda_pct !== null,
    )
    .map((company) => ({
      bvd_code: company.bvd_code,
      nombre: company.nombre ?? copy.companiesTable.unnamedCompany,
      pais: company.pais ?? "-",
      propietario: company.propietario,
      x: company.cagr ?? 0,
      y: company.ebitda_pct ?? 0,
      z: company.t_o ?? 0,
    }));

  return {
    kpis: [
      {
        label: copy.kpis.totalCompanies.label,
        value: formatInteger(totalCompanies, locale),
        helper: copy.kpis.totalCompanies.helper,
      },
      {
        label: copy.kpis.totalRevenue.label,
        value: formatCurrencyCompact(totalRevenue, locale),
        helper: copy.kpis.totalRevenue.helper,
      },
      {
        label: copy.kpis.totalEbitda.label,
        value: formatCurrencyCompact(totalEbitda, locale),
        helper: copy.kpis.totalEbitda.helper,
      },
      {
        label: copy.kpis.medianEbitdaPct.label,
        value: formatPercent(medianEbitdaPct, locale),
        helper: copy.kpis.medianEbitdaPct.helper,
      },
      {
        label: copy.kpis.totalEmployees.label,
        value: formatInteger(totalEmployees, locale),
        helper: copy.kpis.totalEmployees.helper,
      },
      {
        label: copy.kpis.averageCagr.label,
        value: formatPercent(averageCagr, locale),
        helper: copy.kpis.averageCagr.helper,
      },
    ],
    countryDistribution: getDistribution(
      companies.map((company) => company.pais),
      totalCompanies,
    ),
    regionDistribution: getDistribution(
      companies.map((company) => company.displayRegion),
      totalCompanies,
      12,
    ),
    attributeDistribution,
    topRevenueCompanies: [...companies]
      .filter((company) => company.t_o !== null)
      .sort((left, right) => (right.t_o ?? 0) - (left.t_o ?? 0))
      .slice(0, 10),
    topEbitdaCompanies: [...companies]
      .filter((company) => company.ebitda !== null)
      .sort((left, right) => (right.ebitda ?? 0) - (left.ebitda ?? 0))
      .slice(0, 10),
    bubblePoints,
    bubbleIncludedCount: bubblePoints.length,
    totalCompanyCount: totalCompanies,
  };
}

const getCachedCompanyHistoryPoints = unstable_cache(
  async (bvdCode: string): Promise<CompanyHistoryPoint[]> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("company_financial_history")
      .select("*")
      .eq("bvd_code", bvdCode)
      .order("metric_key", { ascending: true })
      .order("period_offset", { ascending: false });

    if (error) {
      throw new Error(`Failed to load company history: ${error.message}`);
    }

    return (data ?? []) as CompanyHistoryPoint[];
  },
  ["company-history-points"],
  { revalidate: DATA_REVALIDATE_SECONDS },
);

async function getCompanyHistorySeries(
  company: CompanyDirectoryRow | null,
  prefetchedPoints?: CompanyHistoryPoint[],
): Promise<CompanyHistorySeries[]> {
  if (!company) {
    return [];
  }

  const points = prefetchedPoints ?? (await getCachedCompanyHistoryPoints(company.bvd_code));
  const latestYear = getYear(company.latest_period_end || company.ultimo_ano_disponible);
  const byMetric = new Map<string, CompanyHistoryPoint[]>();

  for (const point of points) {
    const existing = byMetric.get(point.metric_key) ?? [];
    existing.push(point);
    byMetric.set(point.metric_key, existing);
  }

  return Array.from(byMetric.entries())
    .map(([metricKey, entries]) => {
      const sortedEntries = [...entries]
        .filter((entry) => entry.value !== null)
        .sort((left, right) => right.period_offset - left.period_offset);

      return {
        metricKey: metricKey as CompanyHistoryPoint["metric_key"],
        metricLabel: entries[0]?.metric_label ?? metricKey,
        data: sortedEntries.map((entry) => {
          const yearLabel = latestYear !== null ? String(latestYear - entry.period_offset) : `T-${entry.period_offset}`;
          return {
            periodOffset: entry.period_offset,
            yearLabel,
            value: entry.value ?? 0,
          };
        }),
      };
    })
    .filter((series) => series.data.length > 0)
    .sort((left, right) => {
      const leftIndex = HISTORY_METRIC_ORDER.indexOf(left.metricKey);
      const rightIndex = HISTORY_METRIC_ORDER.indexOf(right.metricKey);
      const normalizedLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const normalizedRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

      return normalizedLeftIndex - normalizedRightIndex;
    });
}

export async function getCompaniesPageData(searchParams: CompaniesSearchParams): Promise<CompanyListResult> {
  const filters = parseCompaniesFilters(searchParams);
  const companiesPromise = getCompanyDirectoryRows();
  const historyPointsPromise = filters.selected
    ? getCachedCompanyHistoryPoints(filters.selected)
    : Promise.resolve([] as CompanyHistoryPoint[]);
  const companies = await companiesPromise;
  const filteredCompanies = sortCompanies(filterCompanies(companies, filters), filters.sort);
  const totalItems = filteredCompanies.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(filters.page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const items = filteredCompanies.slice(startIndex, startIndex + PAGE_SIZE);
  const selectedCompany = companies.find((company) => company.bvd_code === filters.selected) ?? null;
  const selectedCompanyHistory = await getCompanyHistorySeries(
    selectedCompany,
    selectedCompany ? await historyPointsPromise : [],
  );

  return {
    items,
    totalItems,
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalPages,
    filterOptions: getFilterOptions(companies),
    filters: {
      ...filters,
      page: currentPage,
    },
    selectedCompany,
    selectedCompanyHistory,
  };
}

export async function getOwnershipGroups(): Promise<OwnershipGroupSummary[]> {
  const companies = await getCompanyDirectoryRows();
  const grouped = new Map<string, CompanyDirectoryRow[]>();

  for (const company of companies) {
    const owner = company.propietario?.trim();
    if (!owner) {
      continue;
    }

    const group = grouped.get(owner) ?? [];
    group.push(company);
    grouped.set(owner, group);
  }

  return Array.from(grouped.entries())
    .filter(([, companyGroup]) => companyGroup.length >= 2)
    .map(([owner, companyGroup]) => {
      const ebitdaPctValues = companyGroup
        .map((company) => company.ebitda_pct)
        .filter((value): value is number => value !== null);

      return {
        owner,
        companyCount: companyGroup.length,
        companies: [...companyGroup].sort((left, right) => (right.t_o ?? 0) - (left.t_o ?? 0)),
        totalRevenue: companyGroup.reduce((sum, company) => sum + (company.t_o ?? 0), 0),
        totalEbitda: companyGroup.reduce((sum, company) => sum + (company.ebitda ?? 0), 0),
        totalNetDebt: companyGroup.reduce((sum, company) => sum + (company.net_debt ?? 0), 0),
        totalEmployees: companyGroup.reduce((sum, company) => sum + (company.empleados ?? 0), 0),
        averageEbitdaPct:
          ebitdaPctValues.length === 0
            ? null
            : ebitdaPctValues.reduce((sum, value) => sum + value, 0) / ebitdaPctValues.length,
      };
    })
    .sort((left, right) => right.totalRevenue - left.totalRevenue);
}
