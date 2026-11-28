import { useEffect, useRef, useState } from "react";

// Google Maps style step-by-step cards.
// - Cards sit in one horizontally scrollable row.
// - Only the current card (plus the ones already confirmed) is shown.
// - Tapping the current card marks it "Finished" and the next card slides in.
//
// Props:
//   steps          array of strings (the slip steps from the backend)
//   labels         { stepOf: "Step {n} of {total}", tapToConfirm, finished, allDone }
//   onActiveChange optional (index) => void, fired once each time the current step
//                  changes (index is -1 when every step is done). Used for voice narration.
export default function StepCards({ steps, labels, onActiveChange }) {
  const [doneCount, setDoneCount] = useState(0); // cards confirmed so far
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);
  const onActiveChangeRef = useRef(onActiveChange);
  const announced = useRef(null); // last step index reported, so it is never reported twice
  onActiveChangeRef.current = onActiveChange;

  const total = steps.length;
  const allDone = doneCount >= total;
  const activeIndex = allDone ? -1 : doneCount;
  const visibleCount = allDone ? total : doneCount + 1;

  // Slide the newest card into view whenever a new one appears
  useEffect(() => {
    const scroller = scrollerRef.current;
    const card = cardRefs.current[visibleCount - 1];
    if (!scroller || !card) return;
    scroller.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  }, [visibleCount]);

  useEffect(() => {
    if (announced.current === activeIndex) return;
    announced.current = activeIndex;
    onActiveChangeRef.current?.(activeIndex);
  }, [activeIndex]);

  const stepLabel = (n) =>
    labels.stepOf.replace("{n}", n).replace("{total}", total);

  return (
    <div className="mt-4">
      <div
        ref={scrollerRef}
        className="no-scrollbar relative flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
      >
        {steps.slice(0, visibleCount).map((text, index) => {
          const done = index < doneCount;
          const active = index === activeIndex;
          return (
            <button
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              type="button"
              disabled={!active}
              onClick={() => setDoneCount((c) => c + 1)}
              aria-label={active ? `${stepLabel(index + 1)}. ${labels.tapToConfirm}` : undefined}
              className={[
                "animate-fadeIn flex w-[82%] shrink-0 snap-center flex-col justify-between rounded-3xl p-5 text-left transition",
                done
                  ? "bg-[#0b3d38] text-white/70"
                  : "bg-[#00574f] text-white active:scale-[0.98]",
              ].join(" ")}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium tracking-wide text-emerald-200/80">
                    {stepLabel(index + 1)}
                  </span>
                  {done && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-neutral-950">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xl leading-snug">{text}</p>
              </div>

              <p
                className={[
                  "mt-5 text-sm font-semibold",
                  done ? "text-emerald-300" : "text-white/70",
                ].join(" ")}
              >
                {done ? `✓ ${labels.finished}` : labels.tapToConfirm}
              </p>
            </button>
          );
        })}
      </div>

      {/* progress dots */}
      <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
        {steps.map((_, i) => (
          <span
            key={i}
            className={[
              "h-1.5 rounded-full transition-all",
              i < doneCount ? "w-1.5 bg-emerald-400" : i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/25",
            ].join(" ")}
          />
        ))}
      </div>

      {allDone && (
        <p className="animate-fadeIn mt-3 text-center text-base font-semibold text-emerald-300">
          {labels.allDone}
        </p>
      )}
    </div>
  );
}
