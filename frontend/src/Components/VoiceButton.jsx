import SoundWave from "./SoundWave";

// The big round record button at the bottom of the screen.
//
// status:
//   "idle"       -> glowing orb with a mic icon. Tap to start.
//   "listening"  -> the soundwave plays inside the orb, soft ripple around it. Tap again to stop.
//   "processing" -> dimmed and disabled while the guide prepares the slip
function MicIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

export default function VoiceButton({
  status = "idle",
  idleLabel,
  listeningLabel,
  onClick,
}) {
  const listening = status === "listening";
  const processing = status === "processing";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Outer halo ring: gives the orb depth without a heavy shadow */}
      <div
        className={[
          "rounded-full p-2 transition-opacity duration-300",
          "bg-emerald-400/[0.06] ring-1 ring-emerald-300/10",
          processing ? "opacity-40" : "opacity-100",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onClick}
          disabled={processing}
          aria-pressed={listening}
          aria-label={listening ? listeningLabel : idleLabel}
          className={[
            "relative flex h-24 w-24 items-center justify-center rounded-full text-white",
            "bg-[radial-gradient(circle_at_30%_25%,#6ee7b7_0%,#10b981_38%,#047857_100%)]",
            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-8px_16px_rgba(4,60,40,0.35),0_10px_40px_-8px_rgba(16,185,129,0.55)]",
            "transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/40",
            listening ? "animate-pulse-ring" : "",
            processing ? "cursor-not-allowed" : "active:scale-95",
          ].join(" ")}
        >
          {listening ? (
            <span className="animate-fadeIn">
              <SoundWave />
            </span>
          ) : (
            <MicIcon className="h-9 w-9 drop-shadow-[0_1px_2px_rgba(4,60,40,0.4)]" />
          )}
        </button>
      </div>

      <p
        className={[
          "text-sm tracking-wide transition-colors duration-200",
          listening ? "text-emerald-300" : "text-neutral-400",
        ].join(" ")}
      >
        {listening ? listeningLabel : idleLabel}
      </p>
    </div>
  );
}
