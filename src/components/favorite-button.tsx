"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export function FavoriteButton({
  slug,
  initial,
  authed,
  label = false,
}: {
  slug: string;
  initial: boolean;
  authed: boolean;
  label?: boolean;
}) {
  const [active, setActive] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!authed) {
      window.location.href = "/login";
      return;
    }
    if (busy) return;
    const next = !active;
    setActive(next);
    setBusy(true);
    try {
      const res = await fetch("/api/favorites", {
        method: next ? "POST" : "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setActive(!next); // revert optimistic update
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? "הסרה מהמועדפים" : "שמירה למועדפים"}
      className={`inline-flex items-center gap-1.5 rounded-full text-xs font-semibold transition-all px-3 py-1.5 border ${
        active
          ? "bg-rose-50 text-rose-600 border-rose-200"
          : "bg-white text-ink-soft border-line hover:border-rose-300 hover:text-rose-500"
      }`}
    >
      <Heart size={14} fill={active ? "currentColor" : "none"} />
      {label && (active ? "נשמר" : "שמירה")}
    </button>
  );
}
