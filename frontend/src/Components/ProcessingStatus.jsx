// Spinner + current status text ("Understanding…", "Extracting information…") + progress dots.
export default function ProcessingStatus({ steps, step }) {
  return (
    <div className="animate-fadeIn flex flex-col items-center gap-6 px-2 py-4">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400"
        aria-hidden="true"
      />
      {/* key on step makes each new status text fade in */}
      <p key={step} className="animate-fadeIn text-2xl font-semibold text-white">
        {steps[step]}
      </p>
      <div className="flex gap-2" aria-hidden="true">
        {steps.map((_, i) => (
          <span
            key={i}
            className={[
              "h-2 rounded-full transition-all duration-300",
              i === step ? "w-6 bg-emerald-400" : i < step ? "w-2 bg-emerald-600" : "w-2 bg-white/20",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
