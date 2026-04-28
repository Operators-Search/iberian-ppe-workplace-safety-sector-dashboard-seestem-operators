import Image from "next/image";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-4xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">{description}</p>
          ) : null}
        </div>

        <div className="hidden shrink-0 rounded-[24px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(33,150,243,0.08),rgba(38,166,154,0.08))] p-3 shadow-[var(--shadow)] sm:flex">
          <Image
            src="/brand/seestem-mark.png"
            alt="SEESTEM mark"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
