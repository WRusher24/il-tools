import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Database, ShieldCheck, Users } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import {
  countUsers,
  getAllTools,
  getAllUsers,
  getRecentActivity,
} from "@/lib/data";
import { can, ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/rbac";
import { formatDateTime, formatIls, timeAgo } from "@/lib/format";
import { Logo } from "@/components/logo";
import { ToolAvatar } from "@/components/tool-avatar";
import { RoleSelect } from "@/components/admin/role-select";
import { ToolEditor } from "@/components/admin/tool-editor";

export const metadata: Metadata = { title: "מסוף ניהול" };
export const dynamic = "force-dynamic";

/** Admin-only console — enforced twice: here (UX) and in the API (security). */
export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!can(user, "adminConsole")) redirect("/dashboard");

  const [users, tools, activity, totalUsers] = await Promise.all([
    getAllUsers(),
    getAllTools(),
    getRecentActivity(20),
    countUsers(),
  ]);

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <header className="bg-ink text-white">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-extrabold">
            <Logo size={28} /> il-tools
            <span className="text-white/40 text-xs font-normal">/ ניהול</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowRight size={15} /> חזרה ללוח הבקרה
          </Link>
        </div>
      </header>

      <main className="container-x py-10 space-y-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <ShieldCheck size={26} className="text-accent" /> מסוף ניהול
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            ניהול משתמשים (RBAC), עריכת קטלוג חיה ומעקב פעילות — מוגן ברמת DAO
            וברמת API.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Users,
              label: "משתמשים רשומים",
              value: totalUsers,
              sub: `פרימיום: ${roleCounts.premium ?? 0} · מנהלים: ${roleCounts.admin ?? 0}`,
            },
            { icon: Database, label: "מערכות בקטלוג", value: tools.length, sub: "עריכה חיה למטה" },
            { icon: ShieldCheck, label: "אירועי פעילות אחרונים", value: activity.length, sub: "זרם בזמן אמת" },
          ].map((s) => (
            <div key={s.label} className="card p-5 flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent-soft text-accent">
                <s.icon size={20} />
              </span>
              <div>
                <p className="font-mono text-2xl font-semibold" dir="ltr">
                  {s.value}
                </p>
                <p className="text-xs text-muted-fg mt-0.5">{s.label}</p>
                <p className="text-[11px] text-muted-fg">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Users + RBAC */}
        <section className="card overflow-hidden">
          <div className="p-5 border-b border-line flex items-center justify-between">
            <h2 className="font-extrabold">משתמשים והרשאות</h2>
            <span className="chip !text-[11px]">שינוי תפקיד משודר בזמן אמת</span>
          </div>
          <div className="overflow-x-auto">
            <table className="rtable">
              <thead>
                <tr>
                  <th>משתמש</th>
                  <th>אימייל</th>
                  <th>תפקיד נוכחי</th>
                  <th>הצטרף/ה</th>
                  <th>שינוי תפקיד</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold">{u.name}</td>
                    <td className="font-mono text-xs" dir="ltr">
                      {u.email}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${ROLE_BADGE_CLASSES[u.role]}`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="text-xs text-muted-fg whitespace-nowrap">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td>
                      <RoleSelect userId={u.id} current={u.role} disabled={u.id === user.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Catalog editor */}
        <section className="card overflow-hidden">
          <div className="p-5 border-b border-line flex items-center justify-between">
            <h2 className="font-extrabold">עריכת קטלוג חיה</h2>
            <span className="chip !text-[11px]">שמירה → כל דפי האתר מתעדכנים מיד</span>
          </div>
          <ul className="divide-y divide-line">
            {tools.map((t) => (
              <li key={t.slug} className="p-4 flex flex-wrap items-center gap-4 hover:bg-cream transition-colors">
                <ToolAvatar name={t.name} slug={t.slug} size={38} />
                <div className="min-w-40 flex-1">
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-[11px] text-muted-fg font-mono" dir="ltr">
                    /tools/{t.slug} · {formatIls(t.startingPriceIls)}
                  </p>
                </div>
                <ToolEditor tool={t} />
              </li>
            ))}
          </ul>
        </section>

        {/* Activity audit */}
        <section className="card overflow-hidden">
          <div className="p-5 border-b border-line">
            <h2 className="font-extrabold">יומן פעילות</h2>
          </div>
          <ul className="divide-y divide-line max-h-96 overflow-y-auto">
            {activity.map((ev) => (
              <li key={ev.id} className="px-5 py-3 flex items-start gap-3 text-sm">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-accent/60 flex-none" />
                <p className="flex-1">
                  <b>{ev.actorName}</b> {ev.message}
                </p>
                <span className="text-[11px] text-muted-fg whitespace-nowrap">
                  {timeAgo(ev.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
