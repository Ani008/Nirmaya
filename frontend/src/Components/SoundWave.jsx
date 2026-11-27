// Horizontal soundwave: a row of bars that bounce up and down.
// Purely visual for now. In a later stage it can be driven by real microphone volume.
const BAR_COUNT = 25;

// Bell-shaped heights so the middle bars are tallest, like a real voice waveform.
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const mid = (BAR_COUNT - 1) / 2;
  const distance = Math.abs(i - mid) / mid; // 0 at centre, 1 at edges
  return {
    height: Math.round(28 + (1 - distance ** 1.5) * 92), // 28px to 120px
    duration: 0.7 + ((i * 37) % 10) / 20, // 0.7s to 1.15s, varied per bar
    delay: -((i * 0.13) % 1), // negative = start mid-cycle, so no "all at once" start
  };
});

export default function SoundWave() {
  return (
    <div
      className="flex h-32 items-center justify-center gap-1.5"
      aria-hidden="true"
    >
      {BARS.map((bar, i) => (
        <span
          key={i}
          className="wave-bar w-1.5 rounded-full bg-gradient-to-t from-emerald-600 to-emerald-300"
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
