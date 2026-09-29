import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck, Zap } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "התחברות" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex-1 grid lg:grid-cols-2">
      <aside className="hidden lg:flex relative overflow-hidden bg-ink text-white flex-col justify-between p-12">
        <div className="absolute -top-20 -start-20 w-96 h-96 bg-accent/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 end-0 w-80 h-80 bg-teal/25 blur-[120px] rounded-full" />
        <Link href="/" className="relative flex items-center gap-2.5 font-extrabold text-lg">
          <Logo size={30} /> il-tools
        </Link>
        <div className="relative space-y-6">
          <h2 className="text-3xl font-extrabold leading-tight">
            ברוכים השבים.
            <br />
            ההשוואות שלכם מחכות.
          </h2>
          <ul className="space-y-3 text-white/70 text-sm">
            <li className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-teal" /> הפעלה מאובטחת עם
              סיסמה מגובבת ב־scrypt
            </li>
            <li className="flex items-center gap-2.5">
              <Zap size={16} className="text-teal" /> התראות ועדכוני פעילות בזמן
              אמת
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-white/40" dir="ltr">
          il-tools.co.il — secured session
        </p>
      </aside>

      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-soft text-accent mb-4">
              <KeyRound size={22} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              התחברות לחשבון
            </h1>
            <p className="text-sm text-muted-fg mt-2">
              עוד אין לכם חשבון?{" "}
              <Link href="/register" className="text-accent font-semibold">
                הרשמה חינם
              </Link>
            </p>
          </div>

          <div className="card p-7">
            <AuthForm mode="login" />
          </div>

          <div className="mt-5 card !bg-cream p-5 text-xs leading-relaxed text-muted-fg">
            <p className="font-bold text-ink mb-1.5">חשבונות הדגמה (RBAC):</p>
            <p dir="ltr" className="font-mono">
              admin@il-tools.co.il / Admin12345!
            </p>
            <p dir="ltr" className="font-mono">
              premium@il-tools.co.il / Premium12345!
            </p>
            <p dir="ltr" className="font-mono">free@il-tools.co.il / Free12345!</p>
          </div>
        </div>
      </section>
    </main>
  );
}
