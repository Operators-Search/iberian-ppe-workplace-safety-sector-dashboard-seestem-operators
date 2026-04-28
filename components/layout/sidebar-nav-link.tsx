"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SidebarNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-medium transition duration-200",
        active
          ? "border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-alt))] text-white shadow-[var(--shadow)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[linear-gradient(135deg,rgba(33,150,243,0.08),rgba(38,166,154,0.08))]",
      )}
    >
      {children}
    </Link>
  );
}
