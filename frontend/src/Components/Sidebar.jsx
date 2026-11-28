import { useEffect } from "react";
import { X, Plus, FileText, Pill } from "lucide-react";

// Slide-in menu drawer (opens from the top-left menu button).
// - "New" clears the chat and returns to the start screen.
// - The other two features are placeholders until they are built.
// - The bottom holds the Nirmaya declaration, a short summary and the team name.
export default function Sidebar({ open, onClose, onNew, newDisabled, strings }) {
  // Close with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const items = [
    { key: "new", icon: Plus, label: strings.menuNew, onClick: onNew, disabled: newDisabled },
    { key: "report", icon: FileText, label: strings.menuReport, soon: true },
    { key: "meds", icon: Pill, label: strings.menuMedicines, soon: true },
  ];

  return (
    <div
      className={[
        "fixed inset-0 z-40 transition-[visibility] duration-300",
        open ? "visible" : "invisible",
      ].join(" ")}
      aria-hidden={!open}
    >
      {/* dimmed background, tap to close */}
      <div
        onClick={onClose}
        className={[
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={strings.menuOpen}
        className={[
          "absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col",
          "border-r border-white/10 bg-[#0d1411] px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex h-11 shrink-0 items-center justify-between">
          <span className="font-serif text-3xl tracking-tight text-white">nirmaya.ai</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={strings.menuClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-400 transition hover:bg-white/[0.06] hover:text-white active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Features */}
        <nav className="mt-6 flex flex-col gap-1">
          {items.map(({ key, icon: Icon, label, onClick, disabled, soon }) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              disabled={soon || disabled}
              className={[
                "flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2 text-left text-s transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                soon || disabled
                  ? "cursor-default text-neutral-400"
                  : "text-white hover:bg-white/[0.06] active:scale-[0.98]",
              ].join(" ")}
            >
              <Icon size={22} className="shrink-0" aria-hidden="true" />
              <span className="flex-1 leading-snug">{label}</span>
              {soon && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                  {strings.menuSoon}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Declaration, summary, team */}
        <div className="mt-auto pt-8">
          <p className="text-[1.4rem] font-semibold leading-tight tracking-tight text-white/25">
            {strings.menuTagline}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-400">{strings.menuAbout}</p>
          <p className="mt-5 text-xs font-medium tracking-wide text-neutral-500">
            {strings.menuTeam}
          </p>
        </div>
      </aside>
    </div>
  );
}
