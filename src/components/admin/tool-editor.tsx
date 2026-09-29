"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import type { Tool } from "@/db/schema";

export function ToolEditor({ tool }: { tool: Tool }) {
  const [price, setPrice] = useState(tool.startingPriceIls);
  const [freeTier, setFreeTier] = useState(tool.freeTierAvailable);
  const [hasApi, setHasApi] = useState(tool.hasApi);
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const router = useRouter();

  const dirty =
    price !== tool.startingPriceIls ||
    freeTier !== tool.freeTierAvailable ||
    hasApi !== tool.hasApi;

  async function save() {
    setState("busy");
    try {
      const res = await fetch("/api/admin/tools", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: tool.slug,
          startingPriceIls: price,
          freeTierAvailable: freeTier,
          hasApi,
        }),
      });
      if (!res.ok) throw new Error();
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2200);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <label className="flex items-center gap-1.5 text-xs text-muted-fg">
        ₪
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="field !w-20 !py-1.5 !px-2.5 text-sm font-mono"
          dir="ltr"
          aria-label="מחיר התחלתי"
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={freeTier}
          onChange={(e) => setFreeTier(e.target.checked)}
          className="accent-[#2b5bff] w-4 h-4"
        />
        מסלול חינמי
      </label>
      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={hasApi}
          onChange={(e) => setHasApi(e.target.checked)}
          className="accent-[#2b5bff] w-4 h-4"
        />
        API
      </label>
      <button
        type="button"
        onClick={save}
        disabled={!dirty || state === "busy"}
        className="btn btn-dark !py-1.5 !px-3.5 !text-xs disabled:opacity-40"
      >
        {state === "busy" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : state === "saved" ? (
          <Check size={13} className="text-teal" />
        ) : null}
        {state === "saved" ? "נשמר" : state === "error" ? "שגיאה" : "שמירה"}
      </button>
    </div>
  );
}
