"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, Plug, Search, Smartphone } from "lucide-react";
import type { Tool } from "@/db/schema";
import { formatIls, yesNo } from "@/lib/format";
import { ToolAvatar } from "@/components/tool-avatar";
import { FavoriteButton } from "@/components/favorite-button";

type SortKey = "price-asc" | "price-desc" | "name";

export function ToolExplorer({
  tools,
  favoriteSlugs,
  authed,
}: {
  tools: Tool[];
  favoriteSlugs: string[];
  authed: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [freeOnly, setFreeOnly] = useState(false);
  const favs = useMemo(() => new Set(favoriteSlugs), [favoriteSlugs]);

  const rows = useMemo(() => {
    let list = tools;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.target.toLowerCase().includes(q),
      );
    }
    if (freeOnly) list = list.filter((t) => t.freeTierAvailable);
    return [...list].sort((a, b) =>
      sort === "price-asc"
        ? a.startingPriceIls - b.startingPriceIls
        : sort === "price-desc"
          ? b.startingPriceIls - a.startingPriceIls
          : a.name.localeCompare(b.name, "he"),
    );
  }, [tools, query, sort, freeOnly]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-line">
        <label className="relative flex-1 min-w-52">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 start-3.5 text-muted-fg pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש מערכת, קטגוריה או קהל יעד…"
            className="field !ps-10 !py-2.5 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => setFreeOnly((v) => !v)}
          aria-pressed={freeOnly}
          className={`chip transition-all !py-2 ${
            freeOnly
              ? "!bg-accent !text-white !border-transparent"
              : "hover:border-accent/40 hover:text-accent"
          }`}
        >
          מסלול חינמי בלבד
        </button>
        <label className="chip !py-0 overflow-hidden cursor-pointer">
          <ArrowDownUp size={13} className="text-muted-fg" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-transparent py-2 text-xs font-semibold outline-none cursor-pointer"
          >
            <option value="price-asc">מחיר: מהזול ליקר</option>
            <option value="price-desc">מחיר: מהיקר לזול</option>
            <option value="name">לפי שם</option>
          </select>
        </label>
        <span className="text-xs text-muted-fg font-mono ms-auto" dir="ltr">
          {rows.length}/{tools.length}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="rtable">
          <thead>
            <tr>
              <th>מערכת</th>
              <th>קהל יעד</th>
              <th>מחיר התחלתי</th>
              <th>מסלול חינמי</th>
              <th>פלטפורמות</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.slug}>
                <td>
                  <div className="flex items-center gap-3">
                    <ToolAvatar name={t.name} slug={t.slug} size={40} />
                    <div>
                      <Link
                        href={`/tools/${t.slug}`}
                        className="font-bold text-ink hover:text-accent transition-colors"
                      >
                        {t.name}
                      </Link>
                      <p className="text-xs text-muted-fg mt-0.5">{t.category}</p>
                    </div>
                  </div>
                </td>
                <td className="text-ink-soft text-sm">{t.target}</td>
                <td>
                  <span className="price-mono text-accent">
                    {formatIls(t.startingPriceIls)}
                  </span>
                  <span className="text-xs text-muted-fg"> /חודש</span>
                </td>
                <td>
                  {t.freeTierAvailable ? (
                    <span className="chip !bg-teal-soft !text-teal !border-transparent font-bold">
                      כן
                    </span>
                  ) : (
                    <span className="text-muted-fg text-sm">לא</span>
                  )}
                </td>
                <td>
                  <span className="flex items-center gap-2 text-muted-fg">
                    {t.hasMobileApp && <Smartphone size={16} aria-label="אפליקציה" />}
                    {t.hasApi && <Plug size={16} aria-label="API" />}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2 justify-end">
                    <FavoriteButton
                      slug={t.slug}
                      initial={favs.has(t.slug)}
                      authed={authed}
                    />
                    <Link
                      href={`/tools/${t.slug}`}
                      className="btn btn-ghost !py-1.5 !px-3.5 !text-xs"
                    >
                      סקירה מלאה
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="!py-14 text-center text-muted-fg">
                  לא נמצאו מערכות התואמות את החיפוש.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-line">
        {rows.map((t) => (
          <div key={t.slug} className="p-4 flex items-start gap-3">
            <ToolAvatar name={t.name} slug={t.slug} size={44} />
            <div className="flex-1 min-w-0">
              <Link href={`/tools/${t.slug}`} className="font-bold block">
                {t.name}
              </Link>
              <p className="text-xs text-muted-fg mt-0.5">
                {t.target} · מסלול חינמי: {yesNo(t.freeTierAvailable)}
              </p>
              <p className="mt-1.5">
                <span className="price-mono text-accent">
                  {formatIls(t.startingPriceIls)}
                </span>
                <span className="text-xs text-muted-fg"> /חודש</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <FavoriteButton
                  slug={t.slug}
                  initial={favs.has(t.slug)}
                  authed={authed}
                  label
                />
                <Link
                  href={`/tools/${t.slug}`}
                  className="text-xs font-semibold text-accent"
                >
                  לסקירה המלאה ←
                </Link>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="p-10 text-center text-muted-fg text-sm">
            לא נמצאו מערכות התואמות את החיפוש.
          </p>
        )}
      </div>
    </div>
  );
}
