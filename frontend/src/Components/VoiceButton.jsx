// The one big press-to-record button at the bottom of the screen.
//
// status:
//   "idle"       -> green button with mic icon and "Tap to speak"
//   "listening"  -> stop icon and small "Listening…" text, pulsing ring. Tap again to stop.
//   "processing" -> disabled while the guide prepares the slip
function MicIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
    </svg>
  );
}

function StopIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="3" />
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
    <button
      type="button"
      onClick={onClick}
      disabled={processing}
      aria-pressed={listening}
      className={[
        "flex h-16 w-full items-center justify-center gap-3 rounded-full bg-emerald-500 text-neutral-950 transition",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50",
        listening
          ? "animate-pulse-ring"
          : "shadow-[0_8px_30px_-6px_rgba(16,185,129,0.6)]",
        processing
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-emerald-400 active:scale-[0.98]",
      ].join(" ")}
    >
      {listening ? (
        <>
          <StopIcon className="h-6 w-6" />
          <span className="text-base font-semibold">{listeningLabel}</span>
        </>
      ) : (
        <>
          <MicIcon className="h-7 w-7" />
          <span className="text-xl font-bold">{idleLabel}</span>
        </>
      )}
    </button>
  );
}
