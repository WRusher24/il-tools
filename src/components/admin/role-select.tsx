"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/db/schema";

export function RoleSelect({
  userId,
  current,
  disabled,
}: {
  userId: string;
  current: UserRole;
  disabled: boolean;
}) {
  const [value, setValue] = useState<UserRole>(current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function change(next: UserRole) {
    const prev = value;
    setValue(next);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, role: next }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setValue(prev);
        setError(data?.error ?? "העדכון נכשל");
      } else {
        router.refresh();
      }
    } catch {
      setValue(prev);
      setError("שגיאת רשת");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <select
        value={value}
        disabled={disabled || busy}
        onChange={(e) => void change(e.target.value as UserRole)}
        className="field !w-auto !py-1.5 !px-3 text-xs font-semibold"
        aria-label="שינוי תפקיד"
      >
        <option value="free">חינם</option>
        <option value="premium">פרימיום</option>
        <option value="admin">מנהל</option>
      </select>
      {busy && <Loader2 size={14} className="animate-spin text-muted-fg" />}
      {error && <span className="text-[11px] text-rose-600">{error}</span>}
    </span>
  );
}
