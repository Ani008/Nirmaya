import { useEffect, useRef, useState } from "react";
import { DEMO_AUDIO_SRC } from "../config";

// Replaces the record button in "Demo recording" mode: play the sample recording, or upload one.
// UI only for now: "Analyse" just reports which recording was chosen through onAnalyse.

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
    </svg>
  );
}

function AudioPlayer({ src, onMissing }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => onMissing());
    else audio.pause();
  }

  return (
    <div className="flex items-center gap-3">
      {/* key={src} restarts the element when the source changes */}
      <audio
        key={src}
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={onMissing}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition active:scale-95",
          "bg-[radial-gradient(circle_at_30%_25%,#6ee7b7_0%,#10b981_40%,#047857_100%)]",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_6px_20px_-6px_rgba(16,185,129,0.6)]",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/40",
        ].join(" ")}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.05"
          value={current}
          onChange={(e) => {
            const t = Number(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = t;
            setCurrent(t);
          }}
          aria-label="Seek"
          className="h-1.5 w-full cursor-pointer accent-emerald-400"
        />
        <div className="flex justify-between text-xs tabular-nums text-neutral-400">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default function DemoPanel({ strings, onAnalyse }) {
  const [upload, setUpload] = useState(null); // { file, url }
  const [demoMissing, setDemoMissing] = useState(false);
  const inputRef = useRef(null);

  // Free the temporary URL of an uploaded file when it is replaced or the panel closes
  useEffect(() => {
    return () => {
      if (upload) URL.revokeObjectURL(upload.url);
    };
  }, [upload]);

  function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allows choosing the same file again
    if (!file) return;
    setUpload({ file, url: URL.createObjectURL(file) });
  }

  const usingUpload = Boolean(upload);
  const src = usingUpload ? upload.url : DEMO_AUDIO_SRC;
  const showMissing = !usingUpload && demoMissing;

  return (
    <div className="animate-fadeIn w-full rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left">
      <p className="text-base font-semibold text-white">{strings.demoTitle}</p>
      <p className="mt-0.5 text-sm text-neutral-400">{strings.demoSubtitle}</p>

      <div className="mt-4">
        {showMissing ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-3 py-3 text-sm text-neutral-400">
            <p>{strings.demoMissing}</p>
            <p className="mt-1 break-all text-xs text-neutral-500">frontend/public/demo/demo-recording.webm</p>
          </div>
        ) : (
          <AudioPlayer key={src} src={src} onMissing={() => !usingUpload && setDemoMissing(true)} />
        )}
      </div>

      {usingUpload && (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-neutral-400">
          <span className="truncate">{upload.file.name}</span>
          <button
            type="button"
            onClick={() => setUpload(null)}
            className="shrink-0 underline underline-offset-4 hover:text-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          >
            {strings.demoUseSample}
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-11 rounded-full border border-white/15 bg-white/[0.04] px-3 text-sm font-semibold text-neutral-100 transition hover:bg-white/[0.08] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
        >
          {usingUpload ? strings.uploadChange : strings.upload}
        </button>
        <button
          type="button"
          disabled={showMissing}
          onClick={() => onAnalyse({ source: usingUpload ? "upload" : "demo", file: usingUpload ? upload.file : null })}
          className="h-11 rounded-full bg-emerald-500 px-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          {strings.analyse}
        </button>
      </div>
    </div>
  );
}
