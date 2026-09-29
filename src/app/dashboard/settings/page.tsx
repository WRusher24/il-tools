import type { Metadata } from "next";
import { Check, Crown, Fingerprint, ShieldCheck, UserRound } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PLAN_PERKS } from "@/lib/content";
import { formatDateTime } from "@/lib/format";
import { can, ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/rbac";
import { ExportCsvButton } from "@/components/dashboard/export-csv-button";

export const metadata: Metadata = { title: "לוח בקרה — הגדרות" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = (await getSessionUser())!;
  const premium = can(user, "exportDataset");

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      {/* Profile */}
      <div className="card p-7 space-y-5">
        <h2 className="font-extrabold text-lg flex items-center gap-2">
          <UserRound size={19} className="text-accent" /> פרופיל
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <dt className="text-muted-fg">שם</dt>
            <dd className="font-semibold">{user.name}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-line pb-3">
            <dt className="text-muted-fg">אימייל</dt>
            <dd className="font-semibold font-mono text-xs" dir="ltr">
              {user.email}
            </dd>
          </div>
          <div className="flex items-center justify-between border-b border-line pb-3">
            <dt className="text-muted-fg">מסלול</dt>
            <dd>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${ROLE_BADGE_CLASSES[user.role]}`}
              >
                {ROLE_LABELS[user.role]}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-fg">הצטרף/ה</dt>
            <dd className="font-semibold">{formatDateTime(user.createdAt)}</dd>
          </div>
        </dl>

        <div className="rounded-xl border border-line bg-cream p-4 text-xs leading-relaxed text-muted-fg flex gap-2.5">
          <Fingerprint size={16} className="text-teal flex-none mt-0.5" />
          ההפעלה שלך מאובטחת: אסימון מוצפן בעוגיית httpOnly למשך 30 יום,
          והסיסמה מגובבת באלגוריתם scrypt עם מלח ייחודי.
        </div>
      </div>

      {/* Plan */}
      <div className="space-y-6">
        <div className="card p-7">
          <h2 className="font-extrabold text-lg flex items-center gap-2">
            <Crown size={19} className="text-amber-500" /> המסלול שלך —{" "}
            {ROLE_LABELS[user.role]}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {PLAN_PERKS[user.role === "free" ? "free" : "premium"].map((perk) => (
              <li key={perk} className="flex items-start gap-2 text-sm text-ink-soft">
                <Check size={15} className="text-teal mt-0.5 flex-none" />
                {perk}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <ExportCsvButton enabled={premium} />
          </div>
          {user.role === "free" && (
            <p className="mt-3 text-[11px] text-muted-fg leading-relaxed">
              לשדרוג לפרימיום בחשבון ההדגמה — בקשו ממנהל המערכת לשנות את תפקידך
              במסך הניהול (admin@il-tools.co.il).
            </p>
          )}
        </div>

        <div className="card p-7">
          <h2 className="font-extrabold text-lg flex items-center gap-2">
            <ShieldCheck size={19} className="text-teal" /> אבטחה ופרטיות
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-fg list-disc ps-5 leading-relaxed">
            <li>כל הבקשות המשנות מצב עוברות אימות מקור (CSRF) בשכבת ה־edge.</li>
            <li>קלטים מאומתים בסכמות Zod קפדניות לפני כל גישה לבסיס הנתונים.</li>
            <li>HTML עובר סניטיזציה ברשימת היתר בצד שרת בלבד.</li>
            <li>מגבלות קצב פעילות על התחברות, הרשמה, העלאות וייצוא.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
