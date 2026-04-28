export function PageLoading({
  cards = 3,
  includeSidebar = true,
}: {
  cards?: number;
  includeSidebar?: boolean;
}) {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <div className="space-y-3">
          <div className="h-3 w-32 rounded-full bg-[var(--surface-muted)]" />
          <div className="h-10 w-2/3 rounded-2xl bg-[var(--surface-muted)]" />
          {includeSidebar ? <div className="h-5 w-1/2 rounded-xl bg-[var(--surface-muted)]" /> : null}
        </div>
      </section>

      <section className={`grid gap-4 ${cards >= 4 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]"
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="h-[360px] rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]" />
        <div className="h-[360px] rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]" />
      </section>
    </div>
  );
}
