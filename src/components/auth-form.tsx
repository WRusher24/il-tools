"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          mode === "register" ? { name, email, password } : { email, password },
        ),
      });
      const data = (await res.json().catch(() => null)) as {
        ok: boolean;
        error?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "אירעה שגיאה. נסו שוב.");
        setBusy(false);
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError("שגיאת רשת. בדקו את החיבור ונסו שוב.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {mode === "register" && (
        <label className="block">
          <span className="text-sm font-semibold">שם מלא</span>
          <input
            className="field mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ישראל ישראלי"
            autoComplete="name"
            required
            minLength={2}
            maxLength={60}
          />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-semibold">אימייל</span>
        <input
          className="field mt-1.5"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">סיסמה</span>
        <input
          className="field mt-1.5"
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "register" ? "לפחות 8 תווים, אות וספרה" : "••••••••"}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
          minLength={mode === "register" ? 8 : 1}
        />
      </label>

      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3.5 py-2.5">
          <AlertCircle size={15} className="flex-none" /> {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary w-full !py-3.5">
        {busy && <Loader2 size={16} className="animate-spin" />}
        {mode === "register" ? "פתיחת חשבון חינם" : "התחברות"}
      </button>
    </form>
  );
}
