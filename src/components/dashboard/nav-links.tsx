"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CloudUpload,
  Heart,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
} from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "סקירה", icon: LayoutDashboard },
  { href: "/dashboard/favorites", label: "מועדפים", icon: Heart },
  { href: "/dashboard/uploads", label: "העלאות", icon: CloudUpload },
  { href: "/dashboard/settings", label: "הגדרות", icon: Settings2 },
];

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...ITEMS, { href: "/admin", label: "ניהול", icon: ShieldCheck }]
    : ITEMS;

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              active
                ? "bg-ink text-white"
                : "text-ink-soft hover:bg-black/5"
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
