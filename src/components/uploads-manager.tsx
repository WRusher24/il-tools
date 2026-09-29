"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CloudUpload,
  Download,
  FileWarning,
  Loader2,
  RotateCcw,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import type { Upload, UserRole } from "@/db/schema";
import { formatBytes, formatDateTime } from "@/lib/format";

const CHUNK = 1024 * 1024;

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  csv: "text/csv",
  txt: "text/plain",
  zip: "application/zip",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

type Phase =
  | { kind: "idle" }
  | { kind: "uploading"; fileName: string; done: number; total: number }
  | { kind: "assembling"; fileName: string }
  | { kind: "done"; fileName: string; sha256?: string }
  | { kind: "error"; message: string; quota?: boolean };

export function UploadsManager({
  initialUploads,
  quota,
  role,
}: {
  initialUploads: Upload[];
  quota: { active: number; max: number };
  role: UserRole;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const resumeTarget = useRef<Upload | null>(null);
  const resumeInput = useRef<HTMLInputElement>(null);
  const cancelFlag = useRef(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [deleting, setDeleting] = useState<string | null>(null);

  const busy = phase.kind === "uploading" || phase.kind === "assembling";

  const sendChunks = useCallback(
    async (uploadId: string, file: File, totalChunks: number) => {
      // Fetch ground truth → resume exactly where we stopped.
      const statusRes = await fetch(`/api/uploads/${uploadId}`, { cache: "no-store" });
      const status = (await statusRes.json()) as { receivedIndexes?: number[] };
      const have = new Set(status.receivedIndexes ?? []);

      for (let index = 0; index < totalChunks; index += 1) {
        if (cancelFlag.current) throw new Error("__cancelled__");
        if (have.has(index)) {
          setPhase({ kind: "uploading", fileName: file.name, done: index + 1, total: totalChunks });
          continue;
        }
        const blob = file.slice(index * CHUNK, (index + 1) * CHUNK);
        const body = await blob.arrayBuffer();

        let attempt = 0;
        for (;;) {
          attempt += 1;
          const res = await fetch(`/api/uploads/${uploadId}/chunk?index=${index}`, {
            method: "PUT",
            headers: { "content-type": "application/octet-stream" },
            body,
          });
          if (res.ok) break;
          if (attempt >= 3) {
            const data = (await res.json().catch(() => null)) as { error?: string } | null;
            throw new Error(data?.error ?? `צ'אנק ${index} נכשל לאחר 3 ניסיונות`);
          }
          await new Promise((r) => setTimeout(r, 400 * attempt));
        }
        setPhase({ kind: "uploading", fileName: file.name, done: index + 1, total: totalChunks });
      }
    },
    [],
  );

  const runUpload = useCallback(
    async (file: File, resume?: Upload) => {
      cancelFlag.current = false;
      const mime = file.type || MIME_BY_EXT[file.name.split(".").pop()?.toLowerCase() ?? ""] || "";
      const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK));

      try {
        let uploadId = resume?.id;
        if (!uploadId) {
          const res = await fetch("/api/uploads/initiate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              mimeType: mime,
              sizeBytes: file.size,
              totalChunks,
            }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            uploadId?: string;
            error?: string;
            code?: string;
          };
          if (!res.ok || !data.uploadId) {
            setPhase({
              kind: "error",
              message: data.error ?? "פתיחת ההעלאה נכשלה",
              quota: data.code === "QUOTA_EXCEEDED",
            });
            return;
          }
          uploadId = data.uploadId;
        }

        await sendChunks(uploadId, file, resume?.totalChunks ?? totalChunks);

        setPhase({ kind: "assembling", fileName: file.name });
        const doneRes = await fetch(`/api/uploads/${uploadId}/complete`, { method: "POST" });
        const doneData = (await doneRes.json()) as { ok?: boolean; sha256?: string; error?: string };
        if (!doneRes.ok) throw new Error(doneData.error ?? "השלמת ההעלאה נכשלה");

        setPhase({ kind: "done", fileName: file.name, sha256: doneData.sha256 });
        router.refresh();
      } catch (err) {
        if ((err as Error).message === "__cancelled__") {
          setPhase({ kind: "idle" });
        } else {
          setPhase({ kind: "error", message: (err as Error).message ?? "שגיאה לא צפויה" });
        }
      }
    },
    [router, sendChunks],
  );

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void runUpload(file);
  }

  function onPickResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const target = resumeTarget.current;
    resumeTarget.current = null;
    if (!file || !target) return;
    if (file.name !== target.fileName || file.size !== Number(target.sizeBytes)) {
      setPhase({ kind: "error", message: "הקובץ שנבחר אינו תואם להעלאה המקורית (שם/גודל שונים)" });
      return;
    }
    void runUpload(file, target);
  }

  async function removeUpload(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/uploads/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  const progressPct =
    phase.kind === "uploading" ? Math.round((phase.done / Math.max(1, phase.total)) * 100) : 0;

  const statusChip = (u: Upload) => {
    if (u.status === "completed")
      return (
        <span className="chip !bg-teal-soft !text-teal !border-transparent font-bold">
          <CheckCircle2 size={12} /> הושלם
        </span>
      );
    if (u.status === "failed")
      return (
        <span className="chip !bg-rose-50 !text-rose-600 !border-rose-200 font-bold">
          <XCircle size={12} /> נכשל
        </span>
      );
    return (
      <span className="chip !bg-accent-soft !text-accent !border-transparent font-bold">
        <Loader2 size={12} className="animate-spin" /> {u.receivedChunks}/{u.totalChunks} צ'אנקים
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Drop card */}
      <div className="card p-7 md:p-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-lg flex items-center gap-2">
              <UploadCloud size={20} className="text-accent" /> העלאה חדשה
            </h2>
            <p className="text-sm text-muted-fg mt-1">
              PDF, תמונות, CSV, ZIP או Office · עד 50MB · העלאה בצ'אנקים עם
              המשך אוטומטי לאחר נתק.
            </p>
          </div>
          <div className="text-xs text-muted-fg font-mono" dir="ltr">
            מכסה ({role}): {quota.active + (busy ? 1 : 0)}/{quota.max} פעילות
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
            className="btn btn-primary"
          >
            <CloudUpload size={16} /> בחירת קובץ להעלאה
          </button>
          <input ref={fileInput} type="file" className="hidden" onChange={onPick} />
          <input ref={resumeInput} type="file" className="hidden" onChange={onPickResume} />
          {busy && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                cancelFlag.current = true;
                setPhase({ kind: "idle" });
              }}
            >
              עצירת העלאה (ניתן להמשך מאוחר יותר)
            </button>
          )}
        </div>

        {/* Phase UI */}
        {phase.kind === "uploading" && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold truncate max-w-70">{phase.fileName}</span>
              <span className="font-mono" dir="ltr">
                {phase.done}/{phase.total} · {progressPct}%
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill striped" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
        {phase.kind === "assembling" && (
          <p className="mt-5 text-sm text-muted-fg flex items-center gap-2">
            <Loader2 size={15} className="animate-spin text-accent" /> מאחד צ'אנקים ומחשב
            checksum עבור {phase.fileName}…
          </p>
        )}
        {phase.kind === "done" && (
          <p className="mt-5 text-sm flex items-center gap-2 text-teal font-semibold">
            <CheckCircle2 size={16} /> {phase.fileName} הועלה ואומת בהצלחה
            {phase.sha256 && (
              <span className="font-mono text-[10px] text-muted-fg font-normal" dir="ltr">
                sha256: {phase.sha256.slice(0, 16)}…
              </span>
            )}
          </p>
        )}
        {phase.kind === "error" && (
          <p className="mt-5 text-sm flex items-center gap-2 text-rose-600 font-semibold">
            <FileWarning size={16} /> {phase.message}
          </p>
        )}
        {phase.kind === "error" && phase.quota && role === "free" && (
          <p className="mt-2 text-xs text-muted-fg">
            במסלול פרימיום מתאפשרות עד 20 העלאות פעילות במקביל.
          </p>
        )}
      </div>

      {/* Uploads table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-line">
          <h2 className="font-extrabold">ההעלאות שלי</h2>
        </div>
        {initialUploads.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-fg">
            עדיין לא הועלו קבצים. ההעלאה הראשונה שלך תופיע כאן.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="rtable">
              <thead>
                <tr>
                  <th>קובץ</th>
                  <th>גודל</th>
                  <th>סטטוס</th>
                  <th>תאריך</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {initialUploads.map((u) => (
                  <tr key={u.id}>
                    <td className="max-w-60">
                      <span className="font-semibold truncate block">{u.fileName}</span>
                      <span className="text-[11px] text-muted-fg" dir="ltr">
                        {u.mimeType}
                      </span>
                    </td>
                    <td className="font-mono text-sm" dir="ltr">
                      {formatBytes(Number(u.sizeBytes))}
                    </td>
                    <td>{statusChip(u)}</td>
                    <td className="text-xs text-muted-fg whitespace-nowrap">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        {u.status === "pending" && (
                          <button
                            type="button"
                            className="btn btn-ghost !py-1.5 !px-3 !text-xs"
                            disabled={busy}
                            onClick={() => {
                              resumeTarget.current = u;
                              resumeInput.current?.click();
                            }}
                          >
                            <RotateCcw size={13} /> המשך
                          </button>
                        )}
                        {u.status === "completed" && (
                          <a
                            href={`/api/uploads/${u.id}/download`}
                            className="btn btn-ghost !py-1.5 !px-3 !text-xs"
                          >
                            <Download size={13} /> הורדה
                          </a>
                        )}
                        <button
                          type="button"
                          aria-label="מחיקת העלאה"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-fg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          disabled={deleting === u.id}
                          onClick={() => void removeUpload(u.id)}
                        >
                          {deleting === u.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
