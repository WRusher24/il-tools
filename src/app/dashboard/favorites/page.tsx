import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserFavoriteTools } from "@/lib/data";
import { formatIls } from "@/lib/format";
import { ToolAvatar } from "@/components/tool-avatar";
import { FavoriteButton } from "@/components/favorite-button";

export const metadata: Metadata = { title: "לוח בקרה — מועדפים" };
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = (await getSessionUser())!;
  const tools = await getUserFavoriteTools(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Heart size={24} className="text-rose-500" /> המערכות המועדפות שלי
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            ההשוואה האישית שלך — הסרה מתבצעת בלחיצה אחת.
          </p>
        </div>
        <Link href="/#tools" className="btn btn-ghost !py-2 text-sm">
          הוספת מערכות <ArrowLeft size={14} />
        </Link>
      </div>

      {tools.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-bold text-lg">עוד לא שמרת מערכות</p>
          <p className="text-sm text-muted-fg mt-2 max-w-sm mx-auto leading-relaxed">
            גללו לטבלת ההשוואה בעמוד הבית ולחצו על לב ליד כל מערכת כדי לבנות את
            הרשימה האישית שלכם.
          </p>
          <Link href="/#tools" className="btn btn-primary mt-6">
            לטבלת ההשוואה
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tools.map((t) => (
            <div key={t.slug} className="card card-hover p-5">
              <div className="flex items-center gap-3.5">
                <ToolAvatar name={t.name} slug={t.slug} size={46} />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/tools/${t.slug}`}
                    className="font-bold truncate block hover:text-accent transition-colors"
                  >
                    {t.name}
                  </Link>
                  <p className="text-xs text-muted-fg mt-0.5 truncate">
                    {t.category} · {t.target}
                  </p>
                </div>
                <p className="price-mono text-accent" dir="ltr">
                  {formatIls(t.startingPriceIls)}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                <FavoriteButton slug={t.slug} initial authed label />
                <a
                  href={`/go/${t.slug}`}
                  rel="sponsored nofollow"
                  className="text-xs font-semibold text-accent"
                >
                  לאתר הרשמי ←
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
