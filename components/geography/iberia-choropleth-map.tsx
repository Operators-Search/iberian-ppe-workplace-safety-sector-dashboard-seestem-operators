import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { formatInteger, formatPercent } from "@/lib/format";
import { getMessages, type Locale } from "@/lib/i18n";
import type { GeographyMapRegion } from "@/types/data";

const WIDTH = 920;
const HEIGHT = 640;
const PADDING = 22;
const INSET_WIDTH = 170;
const INSET_HEIGHT = 116;
const COLOR_STEPS = ["#f3f9ff", "#dceeff", "#bfe3fb", "#8fd6e6", "#57c4cb", "#26A69A"];

type MapFeature = {
  type: "Feature";
  properties: {
    name: string;
    country: GeographyMapRegion["country"];
    companyCount: number;
    shareOfScope: number;
  };
  geometry: GeographyMapRegion["geometry"];
};

function normalizeRegionName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function isCanaryFeature(feature: MapFeature) {
  const normalizedName = normalizeRegionName(feature.properties.name);
  return normalizedName === "las palmas" || normalizedName === "santa cruz de tenerife";
}

function getFillColor(companyCount: number, maxCompanyCount: number) {
  if (companyCount <= 0 || maxCompanyCount <= 0) {
    return "#eef4f7";
  }

  const stepIndex = Math.max(
    1,
    Math.min(COLOR_STEPS.length - 1, Math.ceil((companyCount / maxCompanyCount) * (COLOR_STEPS.length - 1))),
  );

  return COLOR_STEPS[stepIndex];
}

export function IberiaChoroplethMap({
  regions,
  locale,
}: {
  regions: GeographyMapRegion[];
  locale: Locale;
}) {
  const copy = getMessages(locale);
  const maxCompanyCount = regions.reduce((currentMax, region) => Math.max(currentMax, region.companyCount), 0);
  const featureCollection = {
    type: "FeatureCollection" as const,
    features: regions.map((region) => ({
      type: "Feature" as const,
      properties: {
        name: region.name,
        country: region.country,
        companyCount: region.companyCount,
        shareOfScope: region.shareOfScope,
      },
      geometry: region.geometry,
    })),
  };
  const canaryFeatures = featureCollection.features.filter(isCanaryFeature);
  const mainlandFeatures = featureCollection.features.filter((feature) => !isCanaryFeature(feature));
  const mainlandFeatureCollection = {
    type: "FeatureCollection" as const,
    features: mainlandFeatures.length > 0 ? mainlandFeatures : featureCollection.features,
  };

  const projection = geoMercator().fitExtent(
    [
      [PADDING, PADDING],
      [WIDTH - PADDING, HEIGHT - PADDING],
    ],
    mainlandFeatureCollection as GeoPermissibleObjects,
  );
  const pathGenerator = geoPath(projection);
  const canaryInset = {
    x: PADDING + 8,
    y: HEIGHT - INSET_HEIGHT - PADDING - 8,
    width: INSET_WIDTH,
    height: INSET_HEIGHT,
    padding: 10,
  };
  const canaryProjection =
    canaryFeatures.length > 0
      ? geoMercator().fitExtent(
          [
            [canaryInset.x + canaryInset.padding, canaryInset.y + canaryInset.padding],
            [
              canaryInset.x + canaryInset.width - canaryInset.padding,
              canaryInset.y + canaryInset.height - canaryInset.padding,
            ],
          ],
          {
            type: "FeatureCollection",
            features: canaryFeatures,
          } as GeoPermissibleObjects,
        )
      : null;
  const canaryPathGenerator = canaryProjection ? geoPath(canaryProjection) : null;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[radial-gradient(circle_at_top,rgba(33,150,243,0.08),rgba(255,255,255,0)_42%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,251,255,0.9))] p-3">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={copy.geography.mapTitle}>
          {mainlandFeatureCollection.features.map((feature) => {
            const pathData = pathGenerator(feature as GeoPermissibleObjects);
            if (!pathData) {
              return null;
            }

            return (
              <path
                key={`${feature.properties.country}-${feature.properties.name}`}
                d={pathData}
                fill={getFillColor(feature.properties.companyCount, maxCompanyCount)}
                stroke="#d6e4eb"
                strokeWidth={1.25}
                vectorEffect="non-scaling-stroke"
              >
                <title>
                  {`${copy.geography.tooltip.region}: ${feature.properties.name}
${copy.geography.tooltip.country}: ${feature.properties.country}
${copy.geography.tooltip.companies}: ${formatInteger(feature.properties.companyCount, locale)}
${copy.geography.tooltip.share}: ${formatPercent(feature.properties.shareOfScope, locale)}`}
                </title>
              </path>
            );
          })}
          {canaryFeatures.length > 0 ? (
            <g>
              <rect
                x={canaryInset.x}
                y={canaryInset.y}
                width={canaryInset.width}
                height={canaryInset.height}
                rx={18}
                fill="rgba(255,255,255,0.9)"
                stroke="#d6e4eb"
                strokeWidth={1.25}
              />
              {canaryFeatures.map((feature) => {
                const pathData = canaryPathGenerator?.(feature as GeoPermissibleObjects);
                if (!pathData) {
                  return null;
                }

                return (
                  <path
                    key={`${feature.properties.country}-${feature.properties.name}`}
                    d={pathData}
                    fill={getFillColor(feature.properties.companyCount, maxCompanyCount)}
                    stroke="#d6e4eb"
                    strokeWidth={1.1}
                    vectorEffect="non-scaling-stroke"
                  >
                    <title>
                      {`${copy.geography.tooltip.region}: ${feature.properties.name}
${copy.geography.tooltip.country}: ${feature.properties.country}
${copy.geography.tooltip.companies}: ${formatInteger(feature.properties.companyCount, locale)}
${copy.geography.tooltip.share}: ${formatPercent(feature.properties.shareOfScope, locale)}`}
                    </title>
                  </path>
                );
              })}
            </g>
          ) : null}
        </svg>
      </div>

      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
        <span>{formatInteger(0, locale)}</span>
        <div className="h-2 flex-1 rounded-full bg-[linear-gradient(90deg,#f3f9ff,#bfe3fb,#57c4cb,#26A69A)]" />
        <span>{formatInteger(maxCompanyCount, locale)}</span>
      </div>
      <p className="text-xs leading-5 text-[var(--muted)]">{copy.geography.mapLegend}</p>
    </div>
  );
}
