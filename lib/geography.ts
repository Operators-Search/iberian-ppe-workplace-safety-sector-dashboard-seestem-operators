import "server-only";
import { cache } from "react";
import { getCompanyDirectoryRows } from "@/lib/data";
import { formatInteger, formatPercent } from "@/lib/format";
import { getCompanyCountryScope, getMapFeatures, resolveCompanyMapFeature } from "@/lib/geo-mapping";
import { getMessages, type Locale } from "@/lib/i18n";
import type {
  GeographyCountryScope,
  GeographyMapRegion,
  GeographyPageData,
  GeographyRankingItem,
} from "@/types/data";

type GeographyBaseData = Omit<GeographyPageData, "kpis">;

function getRegionCountKey(country: GeographyMapRegion["country"], regionKey: string) {
  return `${country}:${regionKey}`;
}

export function parseGeographyCountryScope(value: string | null | undefined): GeographyCountryScope {
  if (value === "spain" || value === "portugal") {
    return value;
  }

  return "all";
}

const getGeographyBaseData = cache(async (scope: GeographyCountryScope): Promise<GeographyBaseData> => {
  const companies = await getCompanyDirectoryRows();
  const features = getMapFeatures(scope);
  const counts = new Map<string, number>();
  const unmatched = new Map<string, number>();

  const scopedCompanies = companies.filter((company) => {
    const countryScope = getCompanyCountryScope(company.pais);
    if (!countryScope) {
      return false;
    }

    return scope === "all" || countryScope === scope;
  });

  for (const company of scopedCompanies) {
    const resolved = resolveCompanyMapFeature(company);
    if (!resolved) {
      const fallbackLabel = company.displayRegion && company.displayRegion !== "-" ? company.displayRegion : "-";
      unmatched.set(fallbackLabel, (unmatched.get(fallbackLabel) ?? 0) + 1);
      continue;
    }

    if (scope !== "all" && resolved.scope !== scope) {
      continue;
    }

    if (!resolved.feature) {
      unmatched.set(resolved.rawRegionName, (unmatched.get(resolved.rawRegionName) ?? 0) + 1);
      continue;
    }

    const countKey = getRegionCountKey(resolved.feature.country, resolved.feature.regionKey);
    counts.set(countKey, (counts.get(countKey) ?? 0) + 1);
  }

  const totalCompanies = scopedCompanies.length;
  const mappedCompanies = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
  const unmappedCompanies = Math.max(totalCompanies - mappedCompanies, 0);

  const regions: GeographyMapRegion[] = features.map((feature) => {
    const companyCount = counts.get(getRegionCountKey(feature.country, feature.regionKey)) ?? 0;
    return {
      ...feature,
      companyCount,
      shareOfScope: totalCompanies === 0 ? 0 : companyCount / totalCompanies,
    };
  });

  const ranking: GeographyRankingItem[] = [...regions]
    .filter((region) => region.companyCount > 0)
    .map((region) => ({
      regionKey: region.regionKey,
      name: region.name,
      country: region.country,
      companyCount: region.companyCount,
      shareOfScope: region.shareOfScope,
    }))
    .sort((left, right) => {
      if (right.companyCount !== left.companyCount) {
        return right.companyCount - left.companyCount;
      }

      return left.name.localeCompare(right.name);
    });

  return {
    scope,
    totalCompanies,
    mappedCompanies,
    unmappedCompanies,
    activeRegions: regions.filter((region) => region.companyCount > 0).length,
    regions,
    ranking,
    unmatchedRegions: Array.from(unmatched.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
      .slice(0, 5),
  };
});

export async function getGeographyPageData(
  locale: Locale,
  scope: GeographyCountryScope,
): Promise<GeographyPageData> {
  const copy = getMessages(locale);
  const base = await getGeographyBaseData(scope);

  return {
    ...base,
    kpis: [
      {
        label: copy.geography.kpis.mappedCompanies.label,
        value: formatInteger(base.mappedCompanies, locale),
        helper: copy.geography.kpis.mappedCompanies.helper,
      },
      {
        label: copy.geography.kpis.unmappedCompanies.label,
        value: formatInteger(base.unmappedCompanies, locale),
        helper: copy.geography.kpis.unmappedCompanies.helper,
      },
      {
        label: copy.geography.kpis.coverage.label,
        value: formatPercent(base.totalCompanies === 0 ? 0 : base.mappedCompanies / base.totalCompanies, locale),
        helper: copy.geography.kpis.coverage.helper,
      },
      {
        label: copy.geography.kpis.activeRegions.label,
        value: formatInteger(base.activeRegions, locale),
        helper: copy.geography.kpis.activeRegions.helper,
      },
    ],
  };
}
