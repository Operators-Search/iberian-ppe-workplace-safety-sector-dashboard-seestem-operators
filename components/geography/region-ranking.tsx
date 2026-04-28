import { formatInteger, formatPercent } from "@/lib/format";
import { getMessages, type Locale } from "@/lib/i18n";
import type { GeographyRankingItem } from "@/types/data";

export function RegionRanking({
  items,
  locale,
}: {
  items: GeographyRankingItem[];
  locale: Locale;
}) {
  const copy = getMessages(locale);

  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--border)] px-4 py-8 text-sm text-[var(--muted)]">
        {copy.geography.noRanking}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[var(--border)]">
      <div className="grid grid-cols-[minmax(0,2.3fr)_72px_84px_64px] gap-2 border-b border-[var(--border)] bg-[rgba(33,150,243,0.05)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
        <span>{copy.geography.ranking.region}</span>
        <span>{copy.geography.ranking.country}</span>
        <span className="text-right">{copy.geography.ranking.companies}</span>
        <span className="text-right">{copy.geography.ranking.share}</span>
      </div>
      <ol className="divide-y divide-[var(--border)]">
        {items.slice(0, 12).map((item) => (
          <li
            key={`${item.country}-${item.regionKey}`}
            className="grid grid-cols-[minmax(0,2.3fr)_72px_84px_64px] gap-2 px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <div className="min-w-0">
              <p className="break-words font-medium leading-5">{item.name}</p>
            </div>
            <span className="text-[var(--muted)]">{item.country}</span>
            <span className="text-right font-medium tabular-nums">{formatInteger(item.companyCount, locale)}</span>
            <span className="text-right text-[var(--muted)] tabular-nums">{formatPercent(item.shareOfScope, locale)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
