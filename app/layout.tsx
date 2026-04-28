import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { getMessages } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getMessages(locale);

  return {
    title: copy.metadata.title,
    description: copy.metadata.description,
    icons: {
      icon: [{ url: "/brand/seestem-mark.png", type: "image/png" }],
      shortcut: "/brand/seestem-mark.png",
      apple: "/brand/seestem-mark.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale}>
      <body>
        <div className={`${manrope.variable} ${plexMono.variable} min-h-screen bg-transparent`}>
          <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col lg:flex-row">
            <Sidebar locale={locale} />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
