import { OwnershipGroupCard } from "@/components/ownership-groups/group-card";
import { PageHero } from "@/components/layout/page-hero";
import { getOwnershipGroups } from "@/lib/data";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function OwnershipGroupsPage() {
  const locale = await getRequestLocale();
  const copy = getMessages(locale);
  const groups = await getOwnershipGroups();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={copy.ownershipPage.eyebrow}
        title={copy.ownershipPage.title}
        description={copy.ownershipPage.description}
      />

      <section className="grid gap-5">
        {groups.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)] shadow-[var(--shadow)]">
            {copy.ownershipPage.empty}
          </div>
        ) : (
          groups.map((group, index) => (
            <OwnershipGroupCard key={group.owner} group={group} defaultOpen={index === 0} locale={locale} />
          ))
        )}
      </section>
    </div>
  );
}
