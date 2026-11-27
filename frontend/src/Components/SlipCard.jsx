// The result slip: department, OPD room, doctor and numbered steps.
// Everything here comes from the backend's rules file.
export default function SlipCard({ slip, disclaimer, speakLabel, onSpeak }) {
  return (
    <div className="animate-fadeIn w-full rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-left">
      <p className="text-2xl font-bold text-emerald-300">{slip.department}</p>
      <p className="mt-1 text-lg text-neutral-200">
        {slip.opd} · {slip.doctor}
      </p>

      <ol className="mt-4 space-y-3">
        {slip.steps.map((step, index) => (
          <li key={index} className="flex gap-3 text-lg leading-snug text-white">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-base font-bold text-neutral-950">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-base text-neutral-400">{disclaimer}</p>

      <button
        type="button"
        onClick={onSpeak}
        className="mt-4 h-12 w-full rounded-2xl border-2 border-emerald-400 text-lg font-semibold text-emerald-300 transition hover:bg-emerald-500/15 active:scale-95"
      >
        🔊 {speakLabel}
      </button>
    </div>
  );
}
