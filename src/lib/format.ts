const ilsNumber = new Intl.NumberFormat("he-IL");

export function formatIls(amount: number): string {
  return `₪${ilsNumber.format(amount)}`;
}

export function yesNo(value: boolean): string {
  return value ? "כן" : "לא";
}

const dateFmt = new Intl.DateTimeFormat("he-IL", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(date: Date | string): string {
  return dateFmt.format(new Date(date));
}

const relFmt = new Intl.RelativeTimeFormat("he-IL", { numeric: "auto" });

export function timeAgo(date: Date | string): string {
  const then = new Date(date).getTime();
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "עכשיו";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return relFmt.format(-diffMin, "minute");
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return relFmt.format(-diffH, "hour");
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return relFmt.format(-diffD, "day");
  return dateFmt.format(new Date(date));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
