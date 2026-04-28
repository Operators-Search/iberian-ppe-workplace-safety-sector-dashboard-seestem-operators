export function ChartPlaceholder({
  heightClassName,
}: {
  heightClassName: string;
}) {
  return (
    <div className={`${heightClassName} w-full animate-pulse rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)]`} />
  );
}
