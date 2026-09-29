import Link from "next/link";
import { LayoutDashboard, LogIn } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/rbac";
import { Logo } from "@/components/logo";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight"
          >
            <Logo size={30} />
            <span>
              il-tools
              <span className="sr-only"> — השוואת כלים לעצמאים בישראל</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-soft">
            <Link href="/#tools" className="hover:text-accent transition-colors">
              מערכות
            </Link>
            <Link
              href="/#comparisons"
              className="hover:text-accent transition-colors"
            >
              ראש בראש
            </Link>
            <Link href="/#guides" className="hover:text-accent transition-colors">
              מדריכים
            </Link>
            <Link
              href="/audiences/osek-patur"
              className="hover:text-accent transition-colors"
            >
              עוסק פטור
            </Link>
            <Link
              href="/audiences/osek-mursheh"
              className="hover:text-accent transition-colors"
            >
              עוסק מורשה
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-dark !py-2.5 !px-4 text-sm">
                <LayoutDashboard size={16} />
                לוח בקרה
              </Link>
              <span
                className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${ROLE_BADGE_CLASSES[user.role]}`}
              >
                {ROLE_LABELS[user.role]}
              </span>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-ghost !py-2.5 !px-4 text-sm"
              >
                <LogIn size={15} />
                התחברות
              </Link>
              <Link href="/register" className="btn btn-primary !py-2.5 !px-4 text-sm">
                הרשמה חינם
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
