import type { User, UserRole } from "@/db/schema";

/** Hebrew display labels for roles. */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "מנהל",
  premium: "פרימיום",
  free: "חינם",
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: "bg-rose-50 text-rose-700 ring-rose-200",
  premium: "bg-amber-50 text-amber-700 ring-amber-200",
  free: "bg-slate-100 text-slate-600 ring-slate-200",
};

/**
 * Centralized capability matrix. Every privileged code-path consults this
 * table instead of scattering role checks across the codebase.
 */
export const CAPABILITIES = {
  /** Downloads of the full comparison dataset as CSV. */
  exportDataset: ["admin", "premium"] as UserRole[],
  /** Per-role count of concurrently active (pending) uploads allowed. */
  maxActiveUploads: {
    admin: 50,
    premium: 20,
    free: 2,
  } as Record<UserRole, number>,
  /** Admin console access. */
  adminConsole: ["admin"] as UserRole[],
};

export function can(user: User, action: keyof typeof CAPABILITIES): boolean {
  if (action === "maxActiveUploads") return true; // quota, not a gate
  const allowed = CAPABILITIES[action] as UserRole[];
  return allowed.includes(user.role);
}

export function maxActiveUploads(user: User): number {
  return CAPABILITIES.maxActiveUploads[user.role];
}
