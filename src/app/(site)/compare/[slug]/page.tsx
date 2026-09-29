import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Crown, ExternalLink, Minus, X } from "lucide-react";
import { getComparisonBySlug } from "@/lib/data";
import type { Tool } from "@/db/schema";
import { FAQ_ITEMS } from "@/lib/content";
import { formatIls, yesNo } from "@/lib/format";
import { ToolAvatar } from "@/components/tool-avatar";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await getComparisonBySlug(slug);
  if (!row) return { title: "ההשוואה לא נמצאה" };
  return {
    title: `השוואה: ${row.a.name} מול ${row.b.name} — מה היתרונות?`,
    description: `השוואה ישירה בין ${row.a.name} לבין ${row.b.name}. גלו מחירים, פיצ'רים ומה מתאים לעסק שלכם במדויק.`,
    alternates: { canonical: `/compare/${row.comparison.slug}` },
  };
}

interface DiffRow {
  label: string;
  a: string;
  b: string;
  winner?: "a" | "b" | null;
}

function buildRows(a: Tool, b: Tool): DiffRow[] {
  return [
    {
      label: "מחיר התחלתי (חודשי)",
      a: formatIls(a.startingPriceIls),
      b: formatIls(b.startingPriceIls),
      winner:
        a.startingPriceIls === b.startingPriceIls
          ? null
          : a.startingPriceIls < b.startingPriceIls
            ? "a"
            : "b",
    },
    { label: "קטגוריה", a: a.category, b: b.category },
    { label: "קהל יעד", a: a.target, b: b.target },
    {
      label: "מסלול חינמי",
      a: yesNo(a.freeTierAvailable),
      b: yesNo(b.freeTierAvailable),
      winner:
        a.freeTierAvailable === b.freeTierAvailable
          ? null
          : a.freeTierAvailable
            ? "a"
            : "b",
    },
    {
      label: "אפליקציית מובייל",
      a: yesNo(a.hasMobileApp),
      b: yesNo(b.hasMobileApp),
      winner:
        a.hasMobileApp === b.hasMobileApp ? null : a.hasMobileApp ? "a" : "b",
    },
    { label: "אינטגרציית מסחר", a: a.ecommerceIntegration, b: b.ecommerceIntegration },
    { label: "תמיכה בעברית", a: a.hebrewSupport, b: b.hebrewSupport },
    {
      label: "API פתוח",
      a: yesNo(a.hasApi),
      b: yesNo(b.hasApi),
      winner: a.hasApi === b.hasApi ? null : a.hasApi ? "a" : "b",
    },
    { label: "תמיכת מע״מ ישראל", a: a.israelVatSupport, b: b.israelVatSupport },
  ];
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const row = await getComparisonBySlug(slug);
  if (!row) notFound();

  const { a, b, comparison } = row;
  const rows = buildRows(a, b);
  const winsA = rows.filter((r) => r.winner === "a").length;
  const winsB = rows.filter((r) => r.winner === "b").length;
  const leadTool = winsA === winsB ? null : winsA > winsB ? a : b;

  return (
    <main className="container-x py-10 md:py-14">
      <Reveal>
        <Link
          href="/#comparisons"
          className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-accent transition-colors"
        >
          <ArrowRight size={15} /> כל ההשוואות
        </Link>
      </Reveal>

      <Reveal delay={60} className="mt-6 text-center max-w-2xl mx-auto">
        <p className="font-mono text-xs text-accent font-semibold tracking-widest" dir="ltr">
          HEAD TO HEAD
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
          {a.name} <span className="text-muted-fg font-normal">מול</span> {b.name}
        </h1>
        <p className="mt-4 text-muted-fg leading-relaxed">
          מתלבטים בין שתי המערכות המובילות בשוק הישראלי? ריכזנו עבורכם את
          ההבדלים המרכזיים — מחיר אחר מחיר, פיצ׳ר אחר פיצ׳ר.
        </p>
      </Reveal>

      {/* Scoreboard */}
      <Reveal delay={140} className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 max-w-3xl mx-auto">
        {[
          { t: a, wins: winsA, align: "justify-end" },
          { t: b, wins: winsB, align: "justify-start" },
        ].map(({ t, wins, align }, i) => (
          <div key={t.slug} className={`card p-5 md:p-6 flex flex-col items-center gap-2 text-center ${i === 0 ? "order-1" : "order-3"}`}>
            <ToolAvatar name={t.name} slug={t.slug} size={56} />
            <p className="font-bold text-sm md:text-base leading-tight">{t.name}</p>
            <p className="price-mono text-accent" dir="ltr">
              {formatIls(t.startingPriceIls)}
              <span className="text-xs text-muted-fg font-sans"> /חודש</span>
            </p>
            <p className="text-xs text-muted-fg font-mono" dir="ltr">
              {wins} נק׳ זכייה
            </p>
            <div className="flex gap-2 mt-1">
              <Link href={`/tools/${t.slug}`} className="btn btn-ghost !py-1.5 !px-3 !text-xs">
                סקירה
              </Link>
              <a href={`/go/${t.slug}`} rel="sponsored nofollow" className="btn btn-primary !py-1.5 !px-3 !text-xs">
                <ExternalLink size={12} /> לאתר
              </a>
            </div>
          </div>
        ))}
        <span className="order-2 font-mono text-2xl font-bold text-muted-fg px-2" dir="ltr">
          VS
        </span>
      </Reveal>

      {/* Verdict */}
      {leadTool && (
        <Reveal delay={200} className="max-w-3xl mx-auto mt-6">
          <div className="card p-5 border-teal/40 bg-teal-soft flex items-center gap-3">
            <Crown size={20} className="text-teal flex-none" />
            <p className="text-sm leading-relaxed">
              <b>{leadTool.name}</b> מובילה ב־
              {Math.max(winsA, winsB)} מתוך {rows.length} הקריטריונים שהשוונו.
              שימו לב: הבחירה הנכונה תלויה בצרכי העסק שלכם — קראו את הפירוט
              המלא למטה.
            </p>
          </div>
        </Reveal>
      )}

      {/* Diff matrix */}
      <Reveal delay={260} className="max-w-3xl mx-auto mt-6 card overflow-hidden">
        <table className="rtable">
          <thead>
            <tr>
              <th className="w-1/3">{a.name}</th>
              <th className="w-1/3 text-center">קריטריון</th>
              <th className="w-1/3">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <Cell value={r.a} winner={r.winner === "a"} />
                <td className="text-center text-xs font-semibold text-muted-fg">
                  {r.label}
                </td>
                <Cell value={r.b} winner={r.winner === "b"} />
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* Descriptions */}
      <div className="max-w-3xl mx-auto mt-6 grid md:grid-cols-2 gap-5">
        {[a, b].map((t) => (
          <Reveal key={t.slug} className="card p-6 space-y-3">
            <h2 className="text-lg font-extrabold text-accent">{t.name}</h2>
            <p className="text-sm text-muted-fg leading-relaxed">{t.description}</p>
            <Link
              href={`/tools/${t.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent"
            >
              לסקירה המלאה <ArrowRight size={12} className="rotate-180" />
            </Link>
          </Reveal>
        ))}
      </div>

      {/* FAQ */}
      <Reveal className="max-w-3xl mx-auto mt-6 card p-7">
        <h2 className="font-extrabold text-xl mb-5">שאלות נפוצות</h2>
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

      <p className="sr-only">{comparison.slug}</p>
    </main>
  );
}

function Cell({ value, winner }: { value: string; winner: boolean }) {
  return (
    <td className={winner ? "bg-teal-soft" : ""}>
      <span className="flex items-center gap-1.5 text-sm font-semibold">
        {winner ? (
          <Crown size={14} className="text-teal flex-none" />
        ) : value === "לא" ? (
          <X size={13} className="text-muted-fg flex-none" />
        ) : (
          <Minus size={13} className="text-transparent flex-none" />
        )}
        {value}
      </span>
    </td>
  );
}
