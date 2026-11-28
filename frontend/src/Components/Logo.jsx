import { Stethoscope } from "lucide-react";

// App logo: a plain stethoscope, no background tile.
// Swap for an <img src="..."/> when the real logo is ready.
export default function Logo({ size = 96 }) {
  return (
    <div
      className="flex items-center justify-center text-emerald-300"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Nirmaya"
    >
      <Stethoscope size={size * 0.85} strokeWidth={1.6} aria-hidden="true" />
    </div>
  );
}
