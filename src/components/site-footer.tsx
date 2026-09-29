import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getAllGuides, getAllTools } from "@/lib/data";
import { AUDIENCES } from "@/lib/content";
import { Logo } from "@/components/logo";

export async function SiteFooter() {
  const [toolList, guideList] = await Promise.all([getAllTools(), getAllGuides()]);

  return (
    <footer className="mt-24 border-t border-line bg-cream">
      <div className="container-x py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 font-extrabold text-lg">
            <Logo size={28} /> il-tools
          </div>
          <p className="text-sm text-muted-fg leading-relaxed max-w-xs">
            הפלטפורמה העצמאית להשוואת תוכנות הנהלת חשבונות, חשבוניות דיגיטליות
            וסליקה לעצמאים ועסקים בישראל.
          </p>
          <p className="chip">
            <ShieldCheck size={13} className="text-teal" />
            חיבור מאובטח · נתונים מוצפנים · עודכן ל־2026
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-muted-fg tracking-wide mb-4">
            מערכות מובילות
          </h4>
          <ul className="space-y-2.5 text-sm">
            {toolList.slice(0, 5).map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  className="text-ink-soft hover:text-accent transition-colors"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-muted-fg tracking-wide mb-4">
            מדריכים
          </h4>
          <ul className="space-y-2.5 text-sm">
            {guideList.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="text-ink-soft hover:text-accent transition-colors"
                >
                  {g.title.split(":")[0]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-muted-fg tracking-wide mb-4">
            קהל יעד
          </h4>
          <ul className="space-y-2.5 text-sm">
            {AUDIENCES.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/audiences/${a.slug}`}
                  className="text-ink-soft hover:text-accent transition-colors"
                >
                  {a.slug === "osek-patur" ? "עוסק פטור" : "עוסק מורשה"}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/register"
                className="text-ink-soft hover:text-accent transition-colors"
              >
                פתיחת חשבון חינם
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-fg">
          <p>© 2026 il-tools. כל הזכויות שמורות.</p>
          <p className="font-mono" dir="ltr">
            Built in Israel · Next.js + PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
