// Compact soundwave that lives INSIDE the record button while listening.
// Purely visual for now. In a later stage it can be driven by real microphone volume.
const BAR_COUNT = 9;

// Bell-shaped heights so the middle bars are tallest, like a real voice waveform.
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const mid = (BAR_COUNT - 1) / 2;
  const distance = Math.abs(i - mid) / mid; // 0 at centre, 1 at edges
  return {
    height: Math.round(14 + (1 - distance ** 1.4) * 30), // 14px to 44px
    duration: 0.7 + ((i * 37) % 10) / 20, // varied per bar so they don't move in sync
    delay: -((i * 0.13) % 1), // negative = start mid-cycle
  };
});

export default function SoundWave() {
  return (
    <div className="flex h-12 items-center justify-center gap-[5px]" aria-hidden="true">
      {BARS.map((bar, i) => (
        <span
          key={i}
          className="wave-bar w-[3px] rounded-full bg-white/90"
          style={{
            height: bar.height,
            animationDuration: `${bar.duration}s`,
            animationDelay: `${bar.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
