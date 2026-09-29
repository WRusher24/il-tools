import { z } from "zod";

/**
 * Boundary validation schemas — the single choke-point through which every
 * external input passes (equivalent of Pydantic models in the Python world).
 * Route handlers parse with these before touching business logic.
 */

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "השם קצר מדי")
    .max(60, "השם ארוך מדי")
    .regex(/^[^\p{C}]+$/u, "תווים לא חוקיים בשם"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("כתובת אימייל לא תקינה")
    .max(120),
  password: z
    .string()
    .min(8, "סיסמה חייבת להכיל לפחות 8 תווים")
    .max(72, "סיסמה ארוכה מדי") // scrypt input cap
    .regex(/[A-Za-zא-ת]/, "הסיסמה חייבת לכלול אות")
    .regex(/[0-9]/, "הסיסמה חייבת לכלול ספרה"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(1).max(72),
});

export const favoriteSchema = z.object({
  slug: z.string().regex(SLUG_RE, "מזהה מערכת לא תקין"),
});

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_CHUNKS = 200;

export const ALLOWED_UPLOAD_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/csv",
  "text/plain",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const initiateUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "שם קובץ חסר")
    .max(180, "שם קובץ ארוך מדי")
    .regex(/^[^\p{C}/\\]+$/u, "שם הקובץ מכיל תווים לא חוקיים"),
  mimeType: z
    .string()
    .refine((m) => ALLOWED_UPLOAD_MIME.has(m), "סוג קובץ לא נתמך"),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_BYTES, "הקובץ חורג ממגבלת 50MB"),
  totalChunks: z.number().int().min(1).max(MAX_CHUNKS),
});

export const chunkIndexSchema = z.coerce.number().int().min(0).max(MAX_CHUNKS - 1);

export const adminRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "premium", "free"]),
});

export const adminToolSchema = z.object({
  slug: z.string().regex(SLUG_RE),
  name: z.string().trim().min(2).max(120).optional(),
  startingPriceIls: z.number().int().min(0).max(100000).optional(),
  freeTierAvailable: z.boolean().optional(),
  hasMobileApp: z.boolean().optional(),
  hasApi: z.boolean().optional(),
  description: z.string().trim().min(10).max(600).optional(),
});

/** Convenience: flatten Zod issues into a single Hebrew message. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "קלט לא תקין";
}
