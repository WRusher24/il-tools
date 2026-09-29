import type { Metadata, Viewport } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — השוואת תוכנות הנהלת חשבונות ומדריכים לעצמאים בישראל`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "השוו בין תוכנות הנהלת החשבונות המובילות בישראל: מחירים, פיצ'רים, מסלולים חינמיים ומדריכים מקצועיים לעוסק פטור ועוסק מורשה. מעודכן לשנת 2026.",
  openGraph: {
    siteName: SITE_NAME,
    locale: "he_IL",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
