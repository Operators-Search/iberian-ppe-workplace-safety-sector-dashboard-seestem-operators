"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  locale,
  label,
  options,
}: {
  locale: Locale;
  label: string;
  options: Record<Locale, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function updateLocale(nextLocale: Locale) {
    await fetch("/api/locale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locale: nextLocale }),
    });
    router.refresh();
  }

  function handleChange(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      void updateLocale(nextLocale);
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow)]">
        {LOCALES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleChange(option)}
            disabled={isPending}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition",
              option === locale
                ? "bg-[linear-gradient(135deg,var(--accent),var(--accent-alt))] text-white"
                : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]",
            )}
          >
            {options[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
