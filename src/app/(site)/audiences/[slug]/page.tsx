import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { AUDIENCES, FAQ_ITEMS } from "@/lib/content";
import { getAllTools, getUserFavoriteSlugs } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { formatIls } from "@/lib/format";
import { ToolAvatar } from "@/components/tool-avatar";
import { FavoriteButton } from "@/components/favorite-button";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const aud = AUDIENCES.find((a) => a.slug === slug);
  if (!aud) return { title: "העמוד לא נמצא" };
  return {
    title: aud.title,
    description: aud.desc,
    alternates: { canonical: `/audiences/${aud.slug}` },
  };
}

export default async function AudiencePage({ params }: Props) {
  const { slug } = await params;
  const aud = AUDIENCES.find((a) => a.slug === slug);
  if (!aud) notFound();

  const [tools, user] = await Promise.all([getAllTools(), getSessionUser()]);
  const favoriteSlugs = user ? await getUserFavoriteSlugs(user.id) : [];

  const recommended = [...tools].sort((x, y) => {
    if (aud.recommended === "free-first") {
      return (
        Number(y.freeTierAvailable) - Number(x.freeTierAvailable) ||
        x.startingPriceIls - y.startingPriceIls
      );
    }
    return Number(y.hasApi) - Number(x.hasApi) || x.startingPriceIls - y.startingPriceIls;
  });
  const topPick = recommended[0];
  const rest = recommended.slice(1);

  return (
    <main>
      {/* Hero */}
      <section className="mesh grid-lines border-b border-line">
        <div className="container-x py-14 md:py-20 max-w-3xl">
          <Reveal>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-accent transition-colors"
            >
              <ArrowRight size={15} /> חזרה להשוואה הכללית
            </Link>
            <p className="font-mono text-xs text-accent font-semibold tracking-widest mt-8" dir="ltr">
              {aud.slug === "osek-patur" ? "OSEK PATUR" : "OSEK MURSHEH"} · 2026
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-[1.15] tracking-tight">
              {aud.h1}
            </h1>
            <p className="mt-5 text-lg text-muted-fg leading-relaxed">{aud.desc}</p>
          </Reveal>
          <Reveal delay={140}>
            <ul className="mt-8 grid sm:grid-cols-2 gap-3">
              {aud.bullets.map((b) => (
                <li key={b} className="card !rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-ink-soft">
                  <Check size={16} className="text-teal mt-0.5 flex-none" />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Top pick */}
      {topPick && (
        <section className="container-x pt-12">
          <Reveal>
            <div className="card card-hover relative overflow-hidden p-7 md:p-9 border-accent/30">
              <span className="absolute top-5 end-5 chip !bg-accent !text-white !border-transparent font-bold">
                <Sparkles size={12} /> ההמלצה שלנו
              </span>
              <div className="flex flex-wrap items-center gap-5">
                <ToolAvatar name={topPick.name} slug={topPick.slug} size={60} />
                <div className="flex-1 min-w-56">
                  <h2 className="text-xl md:text-2xl font-extrabold">{topPick.name}</h2>
                  <p className="text-sm text-muted-fg mt-1">
                    {topPick.category} · {topPick.target}
                  </p>
                </div>
                <div className="text-start">
                  <p className="price-mono text-3xl text-accent" dir="ltr">
                    {formatIls(topPick.startingPriceIls)}
                  </p>
                  <p className="text-xs text-muted-fg">מחיר התחלתי / חודש</p>
                </div>
              </div>
              <p className="mt-5 text-ink-soft leading-relaxed max-w-3xl">
                {topPick.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/tools/${topPick.slug}`} className="btn btn-primary">
                  לסקירה המלאה <ArrowLeft size={15} />
                </Link>
                <a href={`/go/${topPick.slug}`} rel="sponsored nofollow" className="btn btn-ghost">
                  לאתר הרשמי
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Full ranked list */}
      <section className="container-x pt-12">
        <h2 className="text-2xl font-extrabold mb-6">כל המערכות — בדירוג המותאם עבורכם</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((t, i) => (
            <Reveal key={t.slug} delay={Math.min(i, 6) * 60}>
              <div className="card card-hover p-5 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <ToolAvatar name={t.name} slug={t.slug} size={40} />
                  <div className="min-w-0">
                    <Link href={`/tools/${t.slug}`} className="font-bold truncate block hover:text-accent transition-colors">
                      {t.name}
                    </Link>
                    <p className="text-xs text-muted-fg truncate">{t.target}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">
                  <span className="price-mono text-accent" dir="ltr">
                    {formatIls(t.startingPriceIls)}
                  </span>
                  <span className="text-xs text-muted-fg"> /חודש</span>
                  {t.freeTierAvailable && (
                    <span className="chip !bg-teal-soft !text-teal !border-transparent !text-[10px] font-bold ms-2">
                      מסלול חינמי
                    </span>
                  )}
                </p>
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                  <FavoriteButton
                    slug={t.slug}
                    initial={favoriteSlugs.includes(t.slug)}
                    authed={Boolean(user)}
                    label
                  />
                  <Link href={`/tools/${t.slug}`} className="text-xs font-semibold text-accent inline-flex items-center gap-1">
                    סקירה <ArrowLeft size={12} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pt-14 max-w-3xl">
        <h2 className="text-2xl font-extrabold mb-5">שאלות נפוצות</h2>
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
      </section>
    </main>
  );
}
