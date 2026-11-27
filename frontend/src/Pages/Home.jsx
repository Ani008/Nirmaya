import { useEffect, useRef, useState } from "react";
import Logo from "../Components/Logo";
import MenuButton from "../Components/MenuButton";
import LanguageSwitcher from "../Components/LanguageSwitcher";
import VoiceButton from "../Components/VoiceButton";
import ProcessingStatus from "../Components/ProcessingStatus";
import ChatBubble from "../Components/ChatBubble";
import SlipCard from "../Components/SlipCard";
import ApiKeyNotice from "../Components/ApiKeyNotice";
import DemoPanel from "../Components/DemoPanel";
import EmergencyAlert from "../Components/EmergencyAlert";
import useRecorder from "../hooks/useRecorder";
import { sendVoice, getHealth } from "../lib/api";
import { getDemoResponse } from "../lib/demoResponse";
import { DEMO_LINK } from "../config";
import { speak, stopSpeaking } from "../lib/speech";
import {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  PLACEHOLDER_NAME,
  STRINGS,
} from "../i18n/strings";

const STORAGE_KEY = "nirmaya_lang";
const STEP_DURATION_MS = 1600; // how long "Understanding…" stays before "Extracting information…"
const MAP_PREP_MS = 1800; // "Preparing your hospital map…" pause before the slip appears
const DEMO_LISTEN_MS = 2200; // demo mode: how long the "Listening…" orb shows
const DEMO_THINK_MS = 3400; // demo mode: "Understanding…" + "Extracting information…" before the result

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let messageCounter = 0;

function loadLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch {
    /* storage unavailable, fall back to default */
  }
  return DEFAULT_LANGUAGE;
}

export default function Home() {
  const [lang, setLang] = useState(loadLanguage);
  // "idle" -> "listening" -> "processing" -> back to "idle"
  const [phase, setPhase] = useState("idle");
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [emergency, setEmergency] = useState(null); // emergency message text, or null
  const [keyMissing, setKeyMissing] = useState(false); // backend has no Gemini API key
  const [mode, setMode] = useState("live"); // "live" | "demo" (demo only matters while keyMissing)
  const [noticeCollapsed, setNoticeCollapsed] = useState(false); // notice shrinks to an icon after "Analyse"
  const { start, stop } = useRecorder();
  const scrollRef = useRef(null);
  const t = STRINGS[lang];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  // Ask the backend once whether a Gemini key is set, to decide if the red notice is needed.
  // No reachable backend at all (for example a frontend-only Vercel deploy) also means
  // requests can't reach Gemini, so the demo option is offered in that case too.
  useEffect(() => {
    getHealth().then((health) => {
      if (!health || health.geminiKeySet === false) setKeyMissing(true);
    });
  }, []);

  // While we wait for the server, move from "Understanding…" to "Extracting information…".
  useEffect(() => {
    if (phase !== "processing" || step !== 0) return;
    const timer = setTimeout(() => setStep(1), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase, step]);

  // Keep the newest message in view
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  function addMessage(message) {
    setMessages((prev) => [...prev, { id: ++messageCounter, ...message }]);
  }

  function guideText(text) {
    addMessage({ from: "guide", kind: "text", text });
  }

  // Renders a /api/voice style result (live from the backend, or the predefined demo one).
  async function showResult(data, currentLang) {
    if (data.status === "emergency") {
      setEmergency(data.message);
      speak(data.message, currentLang);
    } else if (data.status === "ok") {
      addMessage({ from: "user", kind: "text", text: data.transcript });
      addMessage({
        from: "guide",
        kind: "summary",
        summary: data.summary,
        possibleCause: data.possibleCause,
      });
      speak([data.summary, data.possibleCause].filter(Boolean).join(" "), currentLang);

      setStep(2); // "Preparing your hospital map…"
      await sleep(MAP_PREP_MS);

      const spokenSlip = `${data.slip.steps.join(" ")} ${data.disclaimer}`;
      addMessage({
        from: "guide",
        kind: "slip",
        slip: data.slip,
        disclaimer: data.disclaimer,
        spokenSlip,
        lang: currentLang,
      });
      speak(spokenSlip, currentLang, true);
    } else {
      // "no_speech" or "unrelated": the backend sends the exact sentence to show
      guideText(data.message);
      speak(data.message, currentLang);
    }
  }

  // Sends the recording to the backend and shows whatever comes back.
  async function submit(blob, currentLang) {
    const text = STRINGS[currentLang];
    try {
      if (!blob || blob.size === 0) throw new Error("EMPTY_RECORDING");
      const data = await sendVoice(blob, currentLang);
      await showResult(data, currentLang);
    } catch (err) {
      console.error("Voice request failed:", err);
      if (err.code === "GEMINI_KEY_NOT_SET") {
        setKeyMissing(true);
        guideText(text.keyNotSet);
      }
      else if (err.code === "NETWORK") guideText(text.networkError);
      else guideText(text.serverError);
    } finally {
      setPhase("idle");
      setStep(0);
    }
  }

  async function handleVoiceClick() {
    if (phase === "idle") {
      stopSpeaking();
      try {
        await start();
        setPhase("listening");
      } catch (err) {
        if (err.message === "INSECURE_CONTEXT") guideText(t.micInsecure);
        else if (err.message === "RECORDING_UNSUPPORTED") guideText(t.micUnsupported);
        else guideText(t.micDenied);
      }
    } else if (phase === "listening") {
      setStep(0);
      setPhase("processing");
      const blob = await stop();
      submit(blob, lang);
    }
  }

  function closeEmergency() {
    stopSpeaking();
    setEmergency(null);
  }

  // Demo mode (no Gemini key): nothing is sent to the server. We play the same
  // "Listening…" -> "Understanding…" -> "Extracting information…" -> "Preparing your hospital map…"
  // sequence as a live request, then show the predefined result from lib/demoResponse.js.
  // The sample and any uploaded recording both get this same predefined answer.
  async function handleDemoAnalyse() {
    if (phase !== "idle") return;
    const currentLang = lang;
    setNoticeCollapsed(true);
    stopSpeaking();
    try {
      setPhase("listening");
      await sleep(DEMO_LISTEN_MS);
      setStep(0);
      setPhase("processing"); // the existing effect moves step 0 -> 1 after STEP_DURATION_MS
      await sleep(DEMO_THINK_MS);
      await showResult(getDemoResponse(currentLang), currentLang);
    } finally {
      setPhase("idle");
      setStep(0);
    }
  }

  const hasChat = messages.length > 0;
  const demoActive = keyMissing && mode === "demo";

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      {/* Top bar */}
      <header className="flex h-11 shrink-0 items-center justify-between">
        <MenuButton />
        {keyMissing && noticeCollapsed && (
          <ApiKeyNotice collapsed onExpand={() => setNoticeCollapsed(false)} strings={t} />
        )}
      </header>

      {keyMissing && !noticeCollapsed && (
        <ApiKeyNotice
          mode={mode}
          onModeChange={setMode}
          disabled={phase !== "idle"}
          demoLink={DEMO_LINK}
          strings={t}
        />
      )}

      {/* Chat area */}
      <section
        ref={scrollRef}
        className="no-scrollbar flex-1 overflow-y-auto text-center"
        aria-live="polite"
      >
        <div
          className={[
            "flex min-h-full flex-col",
            hasChat ? "justify-end gap-4 py-2" : "items-center justify-center",
          ].join(" ")}
        >
          {!hasChat && phase === "idle" && (
            <div className="animate-fadeIn flex flex-col items-center">
              <Logo />
              {/* key makes the greeting fade in again whenever the language changes */}
              <div key={lang} className="animate-fadeIn mt-8 px-2">
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  {t.greeting} {PLACEHOLDER_NAME[lang]}
                </h1>
                <p className="mt-3 text-base leading-relaxed text-neutral-400">
                  {demoActive ? t.demoPrompt : t.prompt}
                </p>
              </div>
            </div>
          )}

          {messages.map((m) => {
            if (m.kind === "slip") {
              return (
                <SlipCard
                  key={m.id}
                  slip={m.slip}
                  disclaimer={m.disclaimer}
                  speakLabel={STRINGS[m.lang].speakAgain}
                  onSpeak={() => speak(m.spokenSlip, m.lang)}
                />
              );
            }
            if (m.kind === "summary") {
              return (
                <ChatBubble key={m.id} from="guide">
                  <p className="font-semibold">{m.summary}</p>
                  {m.possibleCause && (
                    <p className="mt-2 text-neutral-300">{m.possibleCause}</p>
                  )}
                </ChatBubble>
              );
            }
            return (
              <ChatBubble key={m.id} from={m.from}>
                {m.text}
              </ChatBubble>
            );
          })}

          {phase === "processing" && <ProcessingStatus steps={t.steps} step={step} />}
        </div>
      </section>

      {/* Bottom controls */}
      <section className="flex flex-col items-center gap-6 pt-3">
        <LanguageSwitcher
          value={lang}
          onChange={setLang}
          label={t.languageGroup}
          disabled={phase !== "idle"}
        />
        {demoActive && phase === "idle" ? (
          <DemoPanel strings={t} onAnalyse={handleDemoAnalyse} />
        ) : (
          <VoiceButton
            status={phase}
            idleLabel={t.tapToSpeak}
            listeningLabel={t.listening}
            onClick={demoActive ? undefined : handleVoiceClick}
          />
        )}
      </section>

      {emergency && (
        <EmergencyAlert message={emergency} backLabel={t.emergencyBack} onBack={closeEmergency} />
      )}
    </main>
  );
}
