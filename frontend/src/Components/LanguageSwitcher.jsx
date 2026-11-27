import { LANGUAGES } from "../i18n/strings";

// Three large buttons: मराठी / हिंदी / English. Works like a radio group.
// `disabled` locks it while the patient is speaking or the slip is being prepared.
export default function LanguageSwitcher({ value, onChange, label, disabled = false }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={[
        "grid grid-cols-3 gap-3 transition-opacity",
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
              "h-14 rounded-2xl border-2 text-lg font-semibold transition",
              "active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
              selected
                ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                : "border-white/15 bg-white/5 text-neutral-200 hover:bg-white/10",
            ].join(" ")}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
