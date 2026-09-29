import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  Plug,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { FAQ_ITEMS } from "@/lib/content";
import {
  getComparisonsForTool,
  getToolBySlug,
  getUserFavoriteSlugs,
} from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { formatIls, yesNo } from "@/lib/format";
import { ToolAvatar } from "@/components/tool-avatar";
import { FavoriteButton } from "@/components/favorite-button";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: "המערכת לא נמצאה" };
  return {
    title: `סקירה ומדריך: ${tool.name} — מחירים ופיצ'רים`,
    description: `קראו את הביקורת המלאה על ${tool.name}. גלו מחירים, תמיכה בעוסק פטור ומורשה, וקישורי הצטרפות.`,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const [tool, user] = await Promise.all([getToolBySlug(slug), getSessionUser()]);
  if (!tool) notFound();

  const [related, favoriteSlugs] = await Promise.all([
    getComparisonsForTool(tool.id),
    user ? getUserFavoriteSlugs(user.id) : Promise.resolve([]),
  ]);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: String(tool.startingPriceIls),
      priceCurrency: "ILS",
    },
    description: tool.description,
  };

  const specs: { label: string; value: string; ok?: boolean }[] = [
    { label: "קטגוריה", value: tool.category },
    { label: "קהל יעד", value: tool.target },
    { label: "מסלול חינמי", value: yesNo(tool.freeTierAvailable), ok: tool.freeTierAvailable },
    { label: "אפליקציית מובייל", value: yesNo(tool.hasMobileApp), ok: tool.hasMobileApp },
    { label: "אינטגרציית מסחר", value: tool.ecommerceIntegration },
    { label: "תמיכה בעברית", value: tool.hebrewSupport, ok: true },
    { label: "API פתוח", value: yesNo(tool.hasApi), ok: tool.hasApi },
    { label: "תמיכת מע״מ ישראל", value: tool.israelVatSupport, ok: true },
  ];

  return (
    <main className="container-x py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <Link
          href="/#tools"
          className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-accent transition-colors"
        >
          <ArrowRight size={15} /> חזרה לטבלת ההשוואה
        </Link>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        {/* Main column */}
        <div className="space-y-6">
          <Reveal className="card p-7 md:p-9">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex items-center gap-4">
                <ToolAvatar name={tool.name} slug={tool.slug} size={64} />
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {tool.name}
                  </h1>
                  <p className="text-sm text-muted-fg mt-1">{tool.category}</p>
                </div>
              </div>
              <div className="text-start">
                <p className="price-mono text-3xl text-accent" dir="ltr">
                  {formatIls(tool.startingPriceIls)}
                </p>
                <p className="text-xs text-muted-fg mt-1">מחיר התחלתי / חודש</p>
              </div>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              {tool.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={`/go/${tool.slug}`}
                rel="sponsored nofollow"
                className="btn btn-primary"
              >
                מעבר לאתר הרשמי <ExternalLink size={15} />
              </a>
              <FavoriteButton
                slug={tool.slug}
                initial={favoriteSlugs.includes(tool.slug)}
                authed={Boolean(user)}
                label
              />
              <span className="chip">
                <ShieldCheck size={13} className="text-teal" /> קישור מנותב ומאומת
              </span>
            </div>
          </Reveal>

          {/* Spec sheet */}
          <Reveal className="card p-7 md:p-9">
            <h2 className="font-extrabold text-xl mb-5">מפרט מלא</h2>
            <dl className="grid sm:grid-cols-2 gap-3">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-4 py-3"
                >
                  <dt className="text-sm text-muted-fg">{s.label}</dt>
                  <dd className="text-sm font-semibold flex items-center gap-1.5 text-end">
                    {s.ok === true && <BadgeCheck size={15} className="text-teal" />}
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-center gap-4 text-xs text-muted-fg">
              <span className="flex items-center gap-1.5">
                <Smartphone size={14} /> אפליקציה
              </span>
              <span className="flex items-center gap-1.5">
                <Plug size={14} /> API
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck size={14} /> מאומת מול רשות המסים
              </span>
            </div>
          </Reveal>

          {/* FAQ */}
          <Reveal className="card p-7 md:p-9">
            <h2 className="font-extrabold text-xl mb-5">
              שאלות נפוצות על הנהלת חשבונות דיגיטלית
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((f) => (
                <details key={f.q} className="faq">
                  <summary>
                    {f.q}
                    <span className="faq-chevron text-muted-fg">⌄</span>
                  </summary>
                  <div className="faq-body">{f.a}</div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Sidebar */}
        <div className="space-y-5 lg:sticky lg:top-24">
          {related.length > 0 && (
            <Reveal className="card p-6">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                השוואות עם {tool.name}
              </h3>
              <div className="space-y-2">
                {related.map(({ comparison, a, b }) => {
                  const other = a.slug === tool.slug ? b : a;
                  return (
                    <Link
                      key={comparison.slug}
                      href={`/compare/${comparison.slug}`}
                      className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 hover:border-accent/40 hover:bg-accent-soft transition-all text-sm font-semibold"
                    >
                      <ToolAvatar name={other.name} slug={other.slug} size={28} />
                      <span className="flex-1 truncate">מול {other.name}</span>
                      <ArrowLeft size={14} className="text-accent" />
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          )}

          <Reveal className="card p-6 bg-ink !border-ink text-white">
            <h3 className="font-bold">מתלבטים?</h3>
            <p className="text-sm text-white/65 mt-2 leading-relaxed">
              פתחו חשבון חינם, שמרו את {tool.name} למועדפים והשוו מול עד שתי
              מערכות נוספות בלוח הבקרה האישי.
            </p>
            <Link
              href={user ? "/dashboard" : "/register"}
              className="btn bg-white text-ink mt-5 w-full hover:-translate-y-0.5"
            >
              {user ? "ללוח הבקרה" : "פתיחת חשבון"}
            </Link>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
