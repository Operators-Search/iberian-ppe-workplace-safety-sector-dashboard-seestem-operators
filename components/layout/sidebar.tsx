import { BrandLockup } from "@/components/layout/brand-lockup";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SidebarNavLink } from "@/components/layout/sidebar-nav-link";
import { getMessages, type Locale } from "@/lib/i18n";

export function Sidebar({ locale }: { locale: Locale }) {
  const copy = getMessages(locale);
  const navItems = [
    { href: "/overview", label: copy.sidebar.nav.overview },
    { href: "/companies", label: copy.sidebar.nav.companies },
    { href: "/geography", label: copy.sidebar.nav.geography },
    { href: "/ownership-groups", label: copy.sidebar.nav.ownershipGroups },
  ];

  return (
    <aside className="border-b border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,251,255,0.9))] px-4 py-5 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-[300px] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div className="flex h-full flex-col gap-8">
        <div className="space-y-4">
          <BrandLockup locale={locale} variant="inline" />
          <div className="space-y-2">
            <h1 className="max-w-[18rem] text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {copy.sidebar.title}
            </h1>
            <p className="max-w-[18rem] text-sm leading-6 text-[var(--muted)]">
              {copy.sidebar.description}
            </p>
          </div>
        </div>

        <LanguageSwitcher
          locale={locale}
          label={copy.language.label}
          options={copy.language.options}
        />

        <nav className="grid gap-2">
          {navItems.map((item) => (
            <SidebarNavLink key={item.href} href={item.href}>
              {item.label}
            </SidebarNavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
