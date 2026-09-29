import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, CloudUpload, Crown, Heart, UserPlus } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "הרשמה" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex-1 grid lg:grid-cols-2">
      <aside className="hidden lg:flex relative overflow-hidden bg-ink text-white flex-col justify-between p-12">
        <div className="absolute -bottom-20 -start-20 w-96 h-96 bg-accent/30 blur-[120px] rounded-full" />
        <div className="absolute top-0 end-0 w-80 h-80 bg-teal/25 blur-[120px] rounded-full" />
        <Link href="/" className="relative flex items-center gap-2.5 font-extrabold text-lg">
          <Logo size={30} /> il-tools
        </Link>
        <div className="relative space-y-6">
          <h2 className="text-3xl font-extrabold leading-tight">
            חשבון אחד.
            <br />
            כל הכלים שלכם מסודרים.
          </h2>
          <ul className="space-y-3 text-white/70 text-sm">
            <li className="flex items-center gap-2.5">
              <Heart size={16} className="text-teal" /> שמירת מערכות מועדפות
            </li>
            <li className="flex items-center gap-2.5">
              <Bell size={16} className="text-teal" /> התראות על שינויי מחירים
              ורפורמות
            </li>
            <li className="flex items-center gap-2.5">
              <CloudUpload size={16} className="text-teal" /> העלאת מסמכים
              בצ'אנקים מאובטחים עם מעקב התקדמות
            </li>
            <li className="flex items-center gap-2.5">
              <Crown size={16} className="text-teal" /> שדרוג לפרימיום לייצוא
              נתונים ומכסות מורחבות
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-white/40" dir="ltr">
          GDPR-minded · data stays in the EU region cluster
        </p>
      </aside>

      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-soft text-accent mb-4">
              <UserPlus size={22} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              פתיחת חשבון חינם
            </h1>
            <p className="text-sm text-muted-fg mt-2">
              כבר רשומים?{" "}
              <Link href="/login" className="text-accent font-semibold">
                להתחברות
              </Link>
            </p>
          </div>
          <div className="card p-7">
            <AuthForm mode="register" />
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-fg leading-relaxed">
            בלחיצה על ״פתיחת חשבון״ אתם מאשרים את תנאי השימוש. הסיסמה נשמרת
            מגובבת (scrypt) ולעולם לא בטקסט גלוי.
          </p>
        </div>
      </section>
    </main>
  );
}
