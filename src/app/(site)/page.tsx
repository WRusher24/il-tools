import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  Database,
  LineChart,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { getAllGuides, getAllTools, getComparisons } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { AUDIENCES } from "@/lib/content";
import { formatIls } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { ToolAvatar } from "@/components/tool-avatar";
import { ToolExplorer } from "@/components/tool-explorer";
import { getUserFavoriteSlugs } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tools, comparisons, guides, user] = await Promise.all([
    getAllTools(),
    getComparisons(),
    getAllGuides(),
    getSessionUser(),
  ]);
  const favoriteSlugs = user ? await getUserFavoriteSlugs(user.id) : [];
  const heroPreview = tools.slice(0, 4);
  const freeCount = tools.filter((t) => t.freeTierAvailable).length;

  return (
    <main>
      {/* ------------------------------------------------------------ HERO */}
      <section className="mesh grid-lines relative overflow-hidden">
        <div className="container-x relative py-16 md:py-24 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] items-center">
          <div>
            <Reveal>
              <p className="chip !bg-white/70 backdrop-blur">
                <span className="live-dot" />
                מעודכן לשנת 2026 · כולל רפורמת חשבוניות ישראל
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-[1.08] tracking-tight">
                כל כלי הנהלת החשבונות בישראל.
                <br />
                <span className="text-gradient">במבט אחד.</span>
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-lg text-muted-fg leading-relaxed max-w-xl">
                מחירים, פיצ'רים, מסלולים חינמיים ותאימות לרשות המסים — ריכזנו
                עבורכם את המערכות המובילות לעוסק פטור, עוסק מורשה וחברות, עם
                סקירות מעמיקות והשוואות ראש בראש.
              </p>
            </Reveal>
            <Reveal delay={260} className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="#tools" className="btn btn-primary">
                <LineChart size={17} />
                לטבלת ההשוואה
              </Link>
              <Link href="#guides" className="btn btn-ghost">
                <BookOpenCheck size={17} />
                מדריכים לעצמאים
              </Link>
            </Reveal>
            <Reveal delay={340}>
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                {[
                  { num: String(tools.length || 9), label: "מערכות נסקרו" },
                  { num: String(freeCount || 3), label: "מסלולים חינמיים" },
                  { num: "100%", label: "תוכן בעברית" },
                ].map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-mono text-2xl md:text-3xl font-semibold text-ink" dir="ltr">
                      {s.num}
                    </dd>
                    <dd className="text-xs text-muted-fg mt-1">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Floating comparison preview */}
          <Reveal delay={220} className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-accent/20 to-teal/20 blur-3xl rounded-full" />
              <div className="relative card p-5 float-y">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-sm">השוואה חיה</p>
                  <span className="chip !text-[11px] !py-1">
                    <span className="live-dot" /> חי
                  </span>
                </div>
                <div className="space-y-2.5">
                  {heroPreview.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tools/${t.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3 hover:border-accent/40 hover:shadow-card transition-all"
                    >
                      <ToolAvatar name={t.name} slug={t.slug} size={34} />
                      <span className="flex-1 font-semibold text-sm truncate">
                        {t.name}
                      </span>
                      {t.freeTierAvailable && (
                        <span className="chip !bg-teal-soft !text-teal !border-transparent !text-[10px] !py-0.5 font-bold">
                          חינמי
                        </span>
                      )}
                      <span className="price-mono text-accent text-sm" dir="ltr">
                        {formatIls(t.startingPriceIls)}
                      </span>
                    </Link>
                  ))}
                </div>
                <p className="mt-4 text-[11px] text-muted-fg flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-teal" />
                  הנתונים נמשכים ישירות מבסיס הנתונים החי של il-tools
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Ticker */}
        <div className="border-y border-line bg-white/70 backdrop-blur overflow-hidden">
          <div className="marquee-track py-3">
            {[...tools, ...tools].map((t, i) => (
              <span key={`${t.slug}-${i}`} className="tick-item">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                {t.name}
                <b dir="ltr">{formatIls(t.startingPriceIls)}/חודש</b>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ TOOL TABLE */}
      <section id="tools" className="container-x pt-20 scroll-mt-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs text-accent font-semibold tracking-widest" dir="ltr">
              01 / CATALOG
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 tracking-tight">
              טבלת ההשוואה המלאה
            </h2>
          </div>
          <p className="text-sm text-muted-fg max-w-sm leading-relaxed">
            חפשו, סננו ומיינו בזמן אמת. שמרו מערכות מועדפות לחשבונכם ובצעו
            השוואות מעמיקות.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="card overflow-hidden">
            <ToolExplorer
              tools={tools}
              favoriteSlugs={favoriteSlugs}
              authed={Boolean(user)}
            />
          </div>
        </Reveal>
      </section>

      {/* ----------------------------------------------------- COMPARISONS */}
      <section id="comparisons" className="container-x pt-20 scroll-mt-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs text-accent font-semibold tracking-widest" dir="ltr">
              02 / HEAD&nbsp;TO&nbsp;HEAD
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 tracking-tight flex items-center gap-3">
              השוואות ראש בראש <Scale className="text-accent" size={28} />
            </h2>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {comparisons.map(({ comparison, a, b }, i) => (
            <Reveal key={comparison.slug} delay={i * 90}>
              <Link
                href={`/compare/${comparison.slug}`}
                className="card card-hover block p-6 h-full group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ToolAvatar name={a.name} slug={a.slug} size={38} />
                    <span className="font-bold text-sm truncate">{a.name}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-muted-fg border border-line rounded-full px-2 py-1" dir="ltr">
                    VS
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sm truncate">{b.name}</span>
                    <ToolAvatar name={b.name} slug={b.slug} size={38} />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="font-mono font-semibold text-accent" dir="ltr">
                    {formatIls(a.startingPriceIls)} – {formatIls(b.startingPriceIls)}
                  </span>
                  <span className="text-accent font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    להשוואה <ArrowLeft size={14} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- AUDIENCES */}
      <section className="container-x pt-20">
        <div className="grid md:grid-cols-2 gap-5">
          {AUDIENCES.map((aud, i) => (
            <Reveal key={aud.slug} delay={i * 100}>
              <div className={`card card-hover h-full p-8 relative overflow-hidden ${i === 0 ? "" : "bg-ink !border-ink text-white"}`}>
                <span className={`font-mono text-[11px] font-semibold tracking-widest ${i === 0 ? "text-accent" : "text-teal"}`} dir="ltr">
                  {i === 0 ? "O-PATUR" : "O-MURSHEH"}
                </span>
                <h3 className="text-2xl font-extrabold mt-3 tracking-tight">
                  {aud.slug === "osek-patur" ? "עוסק פטור" : "עוסק מורשה וחברות"}
                </h3>
                <p className={`mt-3 text-sm leading-relaxed ${i === 0 ? "text-muted-fg" : "text-white/65"}`}>
                  {aud.desc}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {aud.bullets.slice(0, 3).map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check size={16} className={`mt-0.5 flex-none ${i === 0 ? "text-teal" : "text-teal"}`} />
                      <span className={i === 0 ? "text-ink-soft" : "text-white/80"}>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/audiences/${aud.slug}`}
                  className={`btn mt-7 ${i === 0 ? "btn-primary" : "bg-white text-ink hover:shadow-lift hover:-translate-y-0.5"}`}
                >
                  להמלצות המלאות <ArrowLeft size={15} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- GUIDES */}
      <section id="guides" className="container-x pt-20 scroll-mt-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs text-accent font-semibold tracking-widest" dir="ltr">
              03 / GUIDES
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 tracking-tight">
              מדריכים מקצועיים לעצמאים
            </h2>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {guides.map((g, i) => (
            <Reveal key={g.slug} delay={i * 90}>
              <Link
                href={`/guides/${g.slug}`}
                className="card card-hover block p-6 h-full group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-fg" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="chip !text-[11px]">{g.readingMinutes} דק׳ קריאה</span>
                </div>
                <h3 className="font-extrabold text-lg mt-4 leading-snug group-hover:text-accent transition-colors">
                  {g.title}
                </h3>
                <p className="text-sm text-muted-fg mt-2.5 leading-relaxed">
                  {g.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                  קריאת המדריך <ArrowLeft size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- WHY US */}
      <section className="container-x pt-20">
        <Reveal className="card p-8 md:p-10 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Database,
              title: "נתונים חיים, לא דפים סטטיים",
              body: "הקטלוג מוגיש ישירות מבסיס נתונים — עדכון מחיר אחד משתקף מיד בכל דפי האתר, ההשוואות וה־API.",
            },
            {
              icon: ShieldCheck,
              title: "אבטחה ברמה ארגונית",
              body: "סיסמאות מגובבות ב־scrypt, הפעלות מוצפנות, הגנת CSRF, מגבלות קצב וסניטיזציית HTML קפדנית בכל קלט.",
            },
            {
              icon: Zap,
              title: "מהירות של דור הבא",
              body: "רינדור שרת, streaming בזמן אמת ועדכוני מלאי מיידיים — חוויית שימוש חלקה בכל מכשיר.",
            },
          ].map((f, i) => (
            <div key={f.title} className="flex gap-4" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="flex-none inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent-soft text-accent">
                <f.icon size={20} />
              </span>
              <div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="text-sm text-muted-fg leading-relaxed mt-1.5">{f.body}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="container-x pt-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink text-white p-10 md:p-14">
            <div className="absolute -top-24 -start-24 w-80 h-80 bg-accent/30 blur-[110px] rounded-full" />
            <div className="absolute -bottom-28 -end-16 w-80 h-80 bg-teal/25 blur-[110px] rounded-full" />
            <div className="relative max-w-2xl">
              <p className="chip !bg-white/10 !border-white/15 !text-white/80">
                <Sparkles size={13} className="text-teal" />
                חשבון אישי · ללא תשלום
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-4 tracking-tight leading-tight">
                שמרו השוואות, העלו מסמכים וקבלו עדכונים בזמן אמת
              </h2>
              <p className="mt-4 text-white/65 leading-relaxed">
                הצטרפו ל־il-tools כדי לשמור מערכות מועדפות, לעקוב אחר שינויי
                מחירים, להעלות קבצים בצ'אנקים מאובטחים ולקבל התראות חריפות ישר
                ללוח הבקרה האישי.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={user ? "/dashboard" : "/register"} className="btn bg-white text-ink hover:-translate-y-0.5 hover:shadow-lift">
                  <Users size={16} />
                  {user ? "מעבר ללוח הבקרה" : "פתיחת חשבון חינם"}
                </Link>
                <Link href="/audiences/osek-patur" className="btn border border-white/20 text-white hover:bg-white/10">
                  מתחילים כעוסק פטור
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
