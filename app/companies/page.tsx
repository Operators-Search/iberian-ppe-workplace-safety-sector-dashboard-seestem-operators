import Link from "next/link";
import { CompanyDetailPanel } from "@/components/companies/company-detail-panel";
import { CompanyFiltersForm } from "@/components/companies/filters-form";
import { USE_COMPACT_COMPANIES_LAYOUT } from "@/components/companies/layout-options";
import { CompaniesTable } from "@/components/companies/companies-table";
import { Pagination } from "@/components/companies/pagination";
import { PageHero } from "@/components/layout/page-hero";
import { getCompaniesPageData } from "@/lib/data";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { buildSearchParams, toUrlSearchParams } from "@/lib/search-params";
import type { CompaniesSearchParams } from "@/types/data";

export const dynamic = "force-dynamic";

type CompaniesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const locale = await getRequestLocale();
  const copy = getMessages(locale);
  const resolvedSearchParams = (await searchParams) as CompaniesSearchParams;
  const currentSearchParams = toUrlSearchParams(
    resolvedSearchParams as Record<string, string | string[] | undefined>,
  );
  const data = await getCompaniesPageData(resolvedSearchParams);

  return (
    <div className="space-y-6">
      <PageHero eyebrow={copy.companiesPage.eyebrow} title={copy.companiesPage.title} />

      <CompanyFiltersForm filters={data.filters} options={data.filterOptions} locale={locale} />

      <section
        className={
          USE_COMPACT_COMPANIES_LAYOUT
            ? "grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]"
            : "grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]"
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">
              {copy.companiesPage.showing(data.items.length, data.totalItems)}
            </p>
            <Link
              href={`/companies?${buildSearchParams(currentSearchParams, { selected: null })}`}
              scroll={false}
              className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
            >
              {copy.companiesPage.clearSelection}
            </Link>
          </div>

          <CompaniesTable
            companies={data.items}
            currentSearchParams={currentSearchParams}
            sort={data.filters.sort}
            selectedCompanyCode={data.selectedCompany?.bvd_code ?? null}
            locale={locale}
          />

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            currentSearchParams={currentSearchParams}
          />
        </div>

        <div className={USE_COMPACT_COMPANIES_LAYOUT ? "2xl:sticky 2xl:top-8 2xl:self-start" : "xl:sticky xl:top-8 xl:self-start"}>
          <CompanyDetailPanel company={data.selectedCompany} history={data.selectedCompanyHistory} locale={locale} />
        </div>
      </section>
    </div>
  );
}
