"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.assign("/");
    }
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
      title="התנתקות"
    >
      <LogOut size={15} />
      <span className="hidden sm:inline">התנתקות</span>
    </button>
  );
}
