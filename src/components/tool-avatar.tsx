const PALETTES = [
  ["#2B5BFF", "#00BFA3"],
  ["#6D5CFF", "#2B5BFF"],
  ["#00A38C", "#2B5BFF"],
  ["#FF6B4A", "#FFB14A"],
  ["#0B1220", "#2B5BFF"],
  ["#00BFA3", "#6D5CFF"],
] as const;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Brand-free monogram avatar with a deterministic gradient per tool. */
export function ToolAvatar({
  name,
  slug,
  size = 44,
}: {
  name: string;
  slug: string;
  size?: number;
}) {
  const [c1, c2] = PALETTES[hashStr(slug) % PALETTES.length];
  const latin = name.match(/[A-Za-z]/)?.[0] ?? name.trim().charAt(0);
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-xl text-white font-bold select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        boxShadow: `0 6px 16px -6px ${c1}66`,
      }}
    >
      {latin.toUpperCase()}
    </span>
  );
}
