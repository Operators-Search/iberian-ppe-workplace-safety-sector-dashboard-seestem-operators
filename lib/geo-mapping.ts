import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CompanyDirectoryRow, GeographyCountryScope, GeographyMapRegion } from "@/types/data";

type RegionScope = Exclude<GeographyCountryScope, "all">;
type SupportedCountry = GeographyMapRegion["country"];

type RawFeatureCollection = {
  type: "FeatureCollection";
  features: RawFeature[];
};

type RawFeature = {
  type: "Feature";
  properties?: Record<string, unknown>;
  geometry: GeographyMapRegion["geometry"];
};

type MapFeature = Pick<GeographyMapRegion, "regionKey" | "name" | "country" | "geometry">;

function loadFeatureCollection(fileName: string): RawFeatureCollection {
  const filePath = path.join(process.cwd(), "data", "geo", fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as RawFeatureCollection;
}

function normalizeRegionName(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getFeatureName(feature: RawFeature) {
  const rawName = feature.properties?.name;
  if (typeof rawName === "string" && rawName.trim()) {
    return rawName.trim();
  }

  throw new Error("Geo feature is missing a usable name property.");
}

function createMapFeatures(features: RawFeature[], country: SupportedCountry): MapFeature[] {
  return features.map((feature) => {
    const name = getFeatureName(feature);
    return {
      regionKey: normalizeRegionName(name),
      name,
      country,
      geometry: feature.geometry,
    };
  });
}

function buildAliasMap(entries: Record<string, string>) {
  return new Map(
    Object.entries(entries).map(([rawName, featureName]) => [
      normalizeRegionName(rawName),
      normalizeRegionName(featureName),
    ]),
  );
}

const SPAIN_FEATURES = createMapFeatures(loadFeatureCollection("spain-provinces.json").features, "SPAIN");
const PORTUGAL_FEATURES = createMapFeatures(loadFeatureCollection("portugal-districts.json").features, "PORTUGAL");
const MAP_FEATURES_BY_SCOPE: Record<RegionScope, MapFeature[]> = {
  spain: SPAIN_FEATURES,
  portugal: PORTUGAL_FEATURES,
};

const FEATURE_INDEX = new Map(
  [...SPAIN_FEATURES, ...PORTUGAL_FEATURES].map((feature) => [`${feature.country}:${feature.regionKey}`, feature]),
);

const REGION_ALIASES: Record<RegionScope, Map<string, string>> = {
  spain: buildAliasMap({
    Alicante: "Alacant/Alicante",
    Baleares: "Illes Balears",
    Castellon: "Castello/Castellon",
    "Castellon de la Plana": "Castello/Castellon",
    Guipuzcoa: "Gipuzkoa/Guipuzcoa",
    Jaen: "Jaen",
    "Las Palmas de Gran Canaria": "Las Palmas",
    "La Coruna": "A Coruna",
    Valencia: "Valencia/Valencia",
    Vizcaya: "Bizkaia/Vizcaya",
  }),
  portugal: buildAliasMap({
    Evora: "Evora",
    Santarem: "Santarem",
    Setubal: "Setubal",
    Braganca: "Braganca",
  }),
};

export function getCompanyCountryScope(country: string | null | undefined): RegionScope | null {
  const normalized = normalizeRegionName(country);
  if (normalized === "spain") {
    return "spain";
  }

  if (normalized === "portugal") {
    return "portugal";
  }

  return null;
}

function getDatasetRegionName(company: CompanyDirectoryRow, scope: RegionScope) {
  if (scope === "spain") {
    return company.provincia || company.displayRegion;
  }

  return company.distrito || company.provincia || company.displayRegion;
}

function toFeatureLookupKey(country: SupportedCountry, regionKey: string) {
  return `${country}:${regionKey}`;
}

function resolveFeature(scope: RegionScope, rawRegionName: string) {
  const country = scope === "spain" ? "SPAIN" : "PORTUGAL";
  const normalized = normalizeRegionName(rawRegionName);
  const directMatch = FEATURE_INDEX.get(toFeatureLookupKey(country, normalized));

  if (directMatch) {
    return directMatch;
  }

  const aliasMatch = REGION_ALIASES[scope].get(normalized);
  if (!aliasMatch) {
    return null;
  }

  return FEATURE_INDEX.get(toFeatureLookupKey(country, aliasMatch)) ?? null;
}

export function getMapFeatures(scope: GeographyCountryScope) {
  if (scope === "all") {
    return [...SPAIN_FEATURES, ...PORTUGAL_FEATURES];
  }

  return MAP_FEATURES_BY_SCOPE[scope];
}

export function resolveCompanyMapFeature(company: CompanyDirectoryRow) {
  const scope = getCompanyCountryScope(company.pais);
  if (!scope) {
    return null;
  }

  const rawRegionName = getDatasetRegionName(company, scope);
  if (!rawRegionName || rawRegionName === "-") {
    return null;
  }

  const feature = resolveFeature(scope, rawRegionName);
  if (!feature) {
    return {
      scope,
      rawRegionName,
      feature: null,
    };
  }

  return {
    scope,
    rawRegionName,
    feature,
  };
}
