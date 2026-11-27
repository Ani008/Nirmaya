// Red notice shown when the backend has no Gemini API key.
// Lets the visitor choose between the live app and a demo recording.
const MODES = ["live", "demo"];

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export default function ApiKeyNotice({
  mode,
  onModeChange,
  disabled = false,
  demoLink,
  strings,
}) {
  const labels = { live: strings.modeLive, demo: strings.modeDemo };

  return (
    <div
      role="alert"
      className="mt-3 shrink-0 rounded-2xl border border-red-400/25 bg-red-500/10 p-3.5 text-left"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-red-400">
          <WarningIcon />
        </span>
        <div>
          <p className="text-sm font-semibold text-red-200">{strings.keyMissingTitle}</p>
          <p className="mt-0.5 text-sm leading-snug text-red-100/70">{strings.keyMissingBody}</p>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label={strings.modeGroup}
        className={[
          "mt-3 grid grid-cols-2 gap-1 rounded-full bg-black/25 p-1 transition-opacity",
          disabled ? "pointer-events-none opacity-50" : "",
        ].join(" ")}
      >
        {MODES.map((key) => {
          const selected = key === mode;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onModeChange(key)}
              className={[
                "h-9 rounded-full px-3 text-sm font-semibold transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70",
                selected
                  ? "bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
                  : "text-red-100/60 hover:text-red-50",
              ].join(" ")}
            >
              {labels[key]}
            </button>
          );
        })}
      </div>

      <a
        href={demoLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm font-medium text-red-100 underline decoration-red-300/40 underline-offset-4 transition hover:decoration-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70"
      >
        {strings.demoLink}
      </a>
    </div>
  );
}
