export function KpiCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(244,251,255,0.94))] p-5 shadow-[var(--shadow)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--accent),var(--accent-alt))]" />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-3 text-sm text-[var(--muted)]">{helper}</p>
    </article>
  );
}
