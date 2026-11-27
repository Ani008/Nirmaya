// Reads text aloud using the phone's built-in voices (no cost, no API key).
// Hindi and English voices are common. A Marathi voice is missing on some phones,
// in that case the text is still shown on screen.
const VOICE_LANG = { mr: "mr-IN", hi: "hi-IN", en: "en-IN" };

// queue=false (default): stop whatever is being read and start fresh.
// queue=true: wait for the current sentence to finish, then read this one.
export function speak(text, lang, queue = false) {
  if (!("speechSynthesis" in window) || !text) return;

  if (!queue) window.speechSynthesis.cancel();

  const target = VOICE_LANG[lang] || "en-IN";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = target;
  utterance.rate = 0.9; // a little slower, easier for elderly listeners

  const voice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(target.slice(0, 2).toLowerCase()));
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
