// Placeholder app logo. Swap the inner SVG for an <img src="..."/> when the real logo is ready.
export default function Logo({ size = 96 }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-[0_0_60px_-10px_rgba(16,185,129,0.55)]"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Nirmaya"
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.5}
        height={size * 0.5}
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* medical cross */}
        <path d="M12 4v16M4 12h16" />
      </svg>
    </div>
  );
}
