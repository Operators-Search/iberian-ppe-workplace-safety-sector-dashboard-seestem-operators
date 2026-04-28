export function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,251,255,0.9))] p-5 shadow-[var(--shadow)]">
      <div className="mb-5 space-y-2">
        <div className="inline-flex h-1 w-16 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-alt))]" />
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
        {description ? <p className="text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
