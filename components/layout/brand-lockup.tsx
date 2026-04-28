import Image from "next/image";
import Link from "next/link";
import { getMessages, type Locale } from "@/lib/i18n";

const LOGO_SOURCE = "/brand/seestem-logo.png";

export function BrandLockup({
  locale,
  variant = "card",
}: {
  locale: Locale;
  variant?: "card" | "inline";
}) {
  const copy = getMessages(locale);
  const logo = (
    <Image
      src={LOGO_SOURCE}
      alt="SEESTEM Operators"
      width={variant === "inline" ? 190 : 220}
      height={variant === "inline" ? 52 : 60}
      className={variant === "inline" ? "h-auto w-full max-w-[190px]" : "h-auto w-full max-w-[220px]"}
      priority
    />
  );

  if (variant === "inline") {
    return (
      <div className="space-y-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
          {copy.brand.poweredBy}
        </p>
        <Link
          href="https://seestem.eu/es"
          target="_blank"
          rel="noreferrer"
          aria-label="Open SEESTEM website in a new tab"
          className="block rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.82)] px-4 py-3 shadow-[var(--shadow)] transition hover:border-[var(--accent)] hover:bg-[rgba(255,255,255,0.96)]"
        >
          {logo}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(33,150,243,0.08),rgba(38,166,154,0.08))] p-4 shadow-[var(--shadow)]">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
        {copy.brand.poweredBy}
      </p>
      <div className="mt-3">{logo}</div>
    </div>
  );
}
