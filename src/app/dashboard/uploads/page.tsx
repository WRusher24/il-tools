import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { countActiveUploads, getUserUploads } from "@/lib/data";
import { maxActiveUploads } from "@/lib/rbac";
import { UploadsManager } from "@/components/uploads-manager";

export const metadata: Metadata = { title: "לוח בקרה — העלאות" };
export const dynamic = "force-dynamic";

export default async function UploadsPage() {
  const user = (await getSessionUser())!;
  const [uploads, active] = await Promise.all([
    getUserUploads(user.id),
    countActiveUploads(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          העלאת קבצים מאובטחת
        </h1>
        <p className="text-sm text-muted-fg mt-1">
          מערכת העלאות אסינכרונית בצ'אנקים: מעקב התקדמות חי, המשך לאחר נתק,
          אימות SHA-256 ומכסות לפי מסלול.
        </p>
      </div>
      <UploadsManager
        initialUploads={uploads}
        quota={{ active, max: maxActiveUploads(user) }}
        role={user.role}
      />
    </div>
  );
}
