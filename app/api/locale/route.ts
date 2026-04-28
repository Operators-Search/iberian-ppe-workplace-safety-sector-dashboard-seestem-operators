import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, resolveLocale } from "@/lib/i18n";

export async function POST(request: Request) {
  const payload = (await request.json()) as { locale?: string };
  const locale = resolveLocale(payload.locale);
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return Response.json({ locale });
}
