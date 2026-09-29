import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/data";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/rbac";
import { Logo } from "@/components/logo";
import { DashboardNav } from "@/components/dashboard/nav-links";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { NotificationBell } from "@/components/dashboard/notification-bell";

export const dynamic = "force-dynamic";

/** Guarded dashboard shell — session required for every child route. */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const unread = await getUnreadCount(user.id);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ink text-white">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold">
            <Logo size={28} /> il-tools
            <span className="text-white/40 text-xs font-normal hidden md:inline">
              / לוח בקרה
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span
              className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${ROLE_BADGE_CLASSES[user.role]}`}
            >
              {ROLE_LABELS[user.role]}
            </span>
            <NotificationBell initialUnread={unread} />
            <span className="hidden md:block text-sm text-white/70 max-w-36 truncate">
              {user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-x pt-5">
        <DashboardNav isAdmin={user.role === "admin"} />
      </div>

      <main className="container-x py-8 flex-1 w-full">{children}</main>

      <footer className="border-t border-line py-5">
        <p className="container-x text-xs text-muted-fg">
          © 2026 il-tools · החשבון מוגן בהצפנה ובמגבלות קצב
        </p>
      </footer>
    </div>
  );
}
