// Three-line menu button for the top-left corner of the home screen.
// UI only for now: pass `onClick` when there is a menu to open.
export default function MenuButton({ onClick, label = "Menu" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-11 w-11 items-center justify-center rounded-2xl",
        "border border-white/10 bg-white/[0.04] text-neutral-300 transition",
        "hover:bg-white/[0.08] hover:text-white active:scale-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M4 7h16" />
        <path d="M4 12h10" />
        <path d="M4 17h16" />
      </svg>
    </button>
  );
}
