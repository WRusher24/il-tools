import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bell, CloudUpload, Heart } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import {
  getRecentActivity,
  getUnreadCount,
  getUserFavoriteTools,
  getUserNotifications,
  getUserUploads,
} from "@/lib/data";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { NotificationsList } from "@/components/dashboard/notifications-list";

export const metadata: Metadata = { title: "לוח בקרה — סקירה" };
export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const user = (await getSessionUser())!; // layout guarantees session
  const [favorites, notifications, uploads, activity, unread] =
    await Promise.all([
      getUserFavoriteTools(user.id),
      getUserNotifications(user.id, 15),
      getUserUploads(user.id),
      getRecentActivity(15),
      getUnreadCount(user.id),
    ]);

  const activeUploads = uploads.filter((u) => u.status === "pending").length;
  const doneUploads = uploads.filter((u) => u.status === "completed").length;

  const stats = [
    {
      href: "/dashboard/favorites",
      icon: Heart,
      label: "מערכות מועדפות",
      value: favorites.length,
      accent: "text-rose-500 bg-rose-50",
    },
    {
      href: "/dashboard#notifications",
      icon: Bell,
      label: "התראות שלא נקראו",
      value: unread,
      accent: "text-accent bg-accent-soft",
    },
    {
      href: "/dashboard/uploads",
      icon: CloudUpload,
      label: "העלאות (פעילות / הושלמו)",
      value: `${activeUploads} / ${doneUploads}`,
      accent: "text-teal bg-teal-soft",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          שלום, {user.name}
        </h1>
        <p className="text-sm text-muted-fg mt-1">
          כל הפעילות, ההתראות וההשוואות שלך — במקום אחד, בזמן אמת.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card card-hover p-5 flex items-center gap-4">
            <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${s.accent}`}>
              <s.icon size={20} />
            </span>
            <div>
              <p className="font-mono text-2xl font-semibold" dir="ltr">
                {s.value}
              </p>
              <p className="text-xs text-muted-fg mt-0.5 flex items-center gap-1">
                {s.label} <ArrowLeft size={11} />
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <ActivityFeed initial={activity} />
        <NotificationsList initial={notifications} />
      </div>
    </div>
  );
}
