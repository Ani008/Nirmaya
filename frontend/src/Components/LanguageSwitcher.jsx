import { LANGUAGES } from "../i18n/strings";

// Compact pill selector: मराठी / हिंदी / English. Works like a radio group.
// `disabled` locks it while the patient is speaking or the slip is being prepared.
export default function LanguageSwitcher({ value, onChange, label, disabled = false }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={[
        "mx-auto grid w-fit grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1",
        "transition-opacity",
        disabled ? "pointer-events-none opacity-40" : "",
      ].join(" ")}
    >
      {LANGUAGES.map((lang) => {
        const selected = lang.code === value;
        return (
          <button
            key={lang.code}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(lang.code)}
            className={[
              "h-9 min-w-[4.5rem] rounded-full px-4 text-sm font-semibold transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
              selected
                ? "bg-emerald-500/20 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(110,231,183,0.35)]"
                : "text-neutral-400 hover:text-neutral-200",
            ].join(" ")}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
