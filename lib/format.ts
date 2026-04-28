import { getNumberLocale, type Locale } from "@/lib/i18n";

const EMPTY_VALUE = "—";

type FormatterSet = {
  compactCurrency: Intl.NumberFormat;
  fullCurrency: Intl.NumberFormat;
  integer: Intl.NumberFormat;
  decimal: Intl.NumberFormat;
  percent: Intl.NumberFormat;
  date: Intl.DateTimeFormat;
};

const formatterCache = new Map<Locale, FormatterSet>();

function getFormatters(locale: Locale): FormatterSet {
  const cached = formatterCache.get(locale);
  if (cached) {
    return cached;
  }

  const numberLocale = getNumberLocale(locale);
  const formatters: FormatterSet = {
    compactCurrency: new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 1,
    }),
    fullCurrency: new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }),
    integer: new Intl.NumberFormat(numberLocale, {
      maximumFractionDigits: 0,
    }),
    decimal: new Intl.NumberFormat(numberLocale, {
      maximumFractionDigits: 2,
    }),
    percent: new Intl.NumberFormat(numberLocale, {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
    date: new Intl.DateTimeFormat(numberLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  };

  formatterCache.set(locale, formatters);
  return formatters;
}

export function formatCurrencyCompact(value: number | null | undefined, locale: Locale = "en") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return getFormatters(locale).compactCurrency.format(value);
}

export function formatCurrency(value: number | null | undefined, locale: Locale = "en") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return getFormatters(locale).fullCurrency.format(value);
}

export function formatInteger(value: number | null | undefined, locale: Locale = "en") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return getFormatters(locale).integer.format(value);
}

export function formatPercent(value: number | null | undefined, locale: Locale = "en") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return getFormatters(locale).percent.format(value);
}

export function formatRatio(value: number | null | undefined, locale: Locale = "en") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return getFormatters(locale).decimal.format(value);
}

export function formatDate(value: string | null | undefined, locale: Locale = "en") {
  if (!value) {
    return EMPTY_VALUE;
  }

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return EMPTY_VALUE;
  }

  return getFormatters(locale).date.format(date);
}
