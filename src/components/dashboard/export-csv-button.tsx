"use client";

import { useState } from "react";
import { Crown, FileSpreadsheet, Lock } from "lucide-react";

export function ExportCsvButton({ enabled }: { enabled: boolean }) {
  const [message, setMessage] = useState<string | null>(null);

  async function download() {
    if (!enabled) {
      setMessage("ייצוא הדאטה המלא זמין במסלול פרימיום.");
      return;
    }
    const res = await fetch("/api/export/tools.csv");
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? "הייצוא נכשל");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "il-tools-dataset.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <button
        type="button"
        onClick={download}
        className={`btn w-full ${enabled ? "btn-primary" : "btn-ghost"}`}
      >
        {enabled ? <FileSpreadsheet size={16} /> : <Lock size={15} />}
        ייצוא טבלת ההשוואה ל־CSV
      </button>
      {!enabled && (
        <p className="mt-2 text-[11px] text-muted-fg flex items-center gap-1">
          <Crown size={11} className="text-amber-500" /> תכונת פרימיום
        </p>
      )}
      {message && <p className="mt-2 text-xs text-rose-600">{message}</p>}
    </div>
  );
}
