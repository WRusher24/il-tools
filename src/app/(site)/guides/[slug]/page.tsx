import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { getAllGuides, getGuideBySlug } from "@/lib/data";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "המדריך לא נמצא" };
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const [guide, all] = await Promise.all([getGuideBySlug(slug), getAllGuides()]);
  if (!guide) notFound();

  const others = all.filter((g) => g.slug !== guide.slug);
  // Authored HTML always flows through the allowlist sanitizer before render.
  const safeHtml = sanitizeRichHtml(guide.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    inLanguage: "he",
    datePublished: guide.createdAt,
  };

  return (
    <main className="container-x py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        <Reveal>
          <Link
            href="/#guides"
            className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-accent transition-colors"
          >
            <ArrowRight size={15} /> כל המדריכים
          </Link>
          <div className="mt-6 flex items-center gap-3 text-xs text-muted-fg">
            <span className="chip !text-[11px]">מדריך מקצועי</span>
            <span className="flex items-center gap-1">
              <Clock3 size={13} /> {guide.readingMinutes} דקות קריאה
            </span>
          </div>
          <h1 className="mt-4 text-3xl md:text-[2.6rem] font-extrabold leading-[1.2] tracking-tight">
            {guide.title}
          </h1>
          <p className="mt-4 text-lg text-muted-fg leading-relaxed">
            {guide.description}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <article className="card p-7 md:p-10 mt-8">
            {/* Sanitized server-side; never raw client HTML. */}
            <div
              className="prose-he"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </article>
        </Reveal>

        {others.length > 0 && (
          <Reveal delay={200} className="mt-10">
            <h2 className="font-extrabold text-lg mb-4">המשך קריאה</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {others.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="card card-hover p-5 group"
                >
                  <h3 className="font-bold leading-snug group-hover:text-accent transition-colors">
                    {g.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    למדריך <ArrowLeft size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
