import Link from "next/link";
import { buildSearchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  currentSearchParams: URLSearchParams;
};

export function Pagination({ page, totalPages, currentSearchParams }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={`/companies?${buildSearchParams(currentSearchParams, {
            page: pageNumber,
          })}`}
          scroll={false}
          className={cn(
            "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition",
            page === pageNumber
              ? "border-transparent bg-[var(--accent)] text-white"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent-soft)]/50",
          )}
        >
          {pageNumber}
        </Link>
      ))}
    </nav>
  );
}
