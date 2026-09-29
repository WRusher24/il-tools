export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="lg-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2B5BFF" />
          <stop offset="100%" stopColor="#00BFA3" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0B1220" />
      <rect x="14" y="30" width="8" height="20" rx="3" fill="url(#lg-mark)" opacity="0.65" />
      <rect x="28" y="20" width="8" height="30" rx="3" fill="url(#lg-mark)" opacity="0.85" />
      <rect x="42" y="12" width="8" height="38" rx="3" fill="url(#lg-mark)" />
    </svg>
  );
}
