import { useRef } from "react";
import StepCards from "./StepCards";
import { speak } from "../lib/speech";

// The result slip: department, OPD room, doctor, then the steps as
// Google Maps style cards (see StepCards.jsx).
// Everything here comes from the backend's rules file.
//
// Voice: each card is read aloud when it becomes the current step. The first one
// waits for the summary to finish, later ones start right after the previous tap.
// "Speak again" repeats the current card.
export default function SlipCard({ slip, disclaimer, speakLabel, strings, lang }) {
  const activeRef = useRef(0);

  const finalText = () => `${strings.allDone} ${disclaimer}`;

  function handleActiveChange(index) {
    activeRef.current = index;
    if (index === -1) speak(finalText(), lang);
    else speak(slip.steps[index], lang, index === 0); // index 0: queue after the summary
  }

  function handleSpeakAgain() {
    const index = activeRef.current;
    speak(index === -1 ? finalText() : slip.steps[index], lang);
  }

  return (
    <div className="animate-fadeIn w-full text-left">
      <p className="text-2xl font-bold text-emerald-300">{slip.department}</p>
      <p className="mt-1 text-lg text-neutral-200">
        {slip.opd} · {slip.doctor}
      </p>

      <StepCards
        steps={slip.steps}
        onActiveChange={handleActiveChange}
        labels={{
          stepOf: strings.stepOf,
          tapToConfirm: strings.tapToConfirm,
          finished: strings.finished,
          allDone: strings.allDone,
        }}
      />

      <p className="mt-4 text-base text-neutral-400">{disclaimer}</p>

      <button
        type="button"
        onClick={handleSpeakAgain}
        className="mt-4 h-12 w-full rounded-2xl border-2 border-emerald-400 text-lg font-semibold text-emerald-300 transition hover:bg-emerald-500/15 active:scale-95"
      >
        🔊 {speakLabel}
      </button>
    </div>
  );
}
