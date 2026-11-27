// Sends the patient's audio to Gemini and gets back structured data (not free text).
// Gemini only listens and extracts. The hospital steps come from the rules file.
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");
const { departmentIds, departmentHints, DEFAULT_DEPARTMENT } = require("./rules");
const log = require("./log");

// Check the current free Flash model name in Google AI Studio and override it in .env if needed.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const TIMEOUT_MS = 45000;

const LANGUAGE_NAMES = { mr: "Marathi", hi: "Hindi", en: "English" };

function geminiConfigured() {
  return Boolean((process.env.GEMINI_API_KEY || "").trim());
}

// Created on first use so the server can start (and show its main screen) without any key.
let client = null;
function getClient() {
  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiVersion: "v1beta",
    });
  }
  return client;
}

function buildPrompt(lang) {
  const language = LANGUAGE_NAMES[lang] || "English";
  return `You are a patient-intake assistant for a government hospital OPD in Maharashtra, India.
The audio is a patient (or a family member) speaking in Marathi, Hindi, English, or a mix of them.

Return JSON only. Rules:
- Never invent details. If something was not said, use null (or an empty list).
- Do NOT diagnose and do NOT suggest medicines or treatment.
- intelligible: false if the audio is silent, only noise, or you cannot make out the words.
- relevant: false if the speech has nothing to do with a health problem or a hospital visit.
- name, age (a number), gender ("male", "female" or "other"), duration (like "2 days"): only if said.
- symptoms: short English phrases, for example ["fever", "body ache"].
- emergency: true ONLY for chest pain, trouble breathing, heavy bleeding, fainting, seizure, or stroke signs.
- department: choose exactly one id from this list. If unsure, use "${DEFAULT_DEPARTMENT}".
${departmentHints()}
- transcript: what was said, in the original language.
- summary: ONE short sentence in ${language}, for example name, age, symptoms and duration, using only what was said.
- possibleCause: ONE short, simple sentence in ${language} saying what the symptoms MAY be related to. Use soft words like "may" or "could". Never be certain. No medicine names. Use null if there is not enough information.
Write summary and possibleCause in ${language}, in plain words without medical jargon.`;
}

const SCHEMA = {
  type: "object",
  properties: {
    intelligible: { type: "boolean" },
    relevant: { type: "boolean" },
    name: { type: "string", nullable: true },
    age: { type: "number", nullable: true },
    gender: { type: "string", nullable: true },
    symptoms: { type: "array", items: { type: "string" } },
    duration: { type: "string", nullable: true },
    emergency: { type: "boolean" },
    department: { type: "string", enum: departmentIds() },
    transcript: { type: "string" },
    summary: { type: "string" },
    possibleCause: { type: "string", nullable: true },
  },
  required: [
    "intelligible",
    "relevant",
    "symptoms",
    "emergency",
    "department",
    "transcript",
    "summary",
  ],
};

// "audio/webm;codecs=opus" -> "audio/webm"
function cleanMimeType(mime) {
  return (mime || "audio/webm").split(";")[0].trim() || "audio/webm";
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const e = new Error(`Gemini did not answer within ${ms / 1000}s (check internet, key and model name)`);
      e.code = "GEMINI_TIMEOUT";
      reject(e);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Gemini's ApiError message is often a JSON string: '{"error":{"code":400,"message":"..."}}'
function readableMessage(err) {
  const raw = String((err && err.message) || err || "");
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) return parsed.error.message;
  } catch {
    /* not JSON, use as is */
  }
  return raw;
}

// Turns any Gemini failure into { code, problem, fix } so the terminal says what to do next.
function explainGeminiError(err) {
  const status = err && err.status;
  const msg = readableMessage(err);
  const low = msg.toLowerCase();
  const netCode = err?.cause?.code || err?.code;

  if (err && err.code === "GEMINI_TIMEOUT") {
    return { code: "GEMINI_TIMEOUT", problem: msg, fix: "Check your internet connection. Large audio can also be slow; try a shorter recording." };
  }
  if (err && err.code === "GEMINI_EMPTY") {
    return { code: "GEMINI_EMPTY", problem: msg, fix: "Gemini blocked or returned nothing. Try again; if it repeats, change GEMINI_MODEL." };
  }
  if (err && err.code === "GEMINI_BAD_JSON") {
    return { code: "GEMINI_BAD_JSON", problem: msg, fix: "The model did not follow the JSON format. Try again or use a newer GEMINI_MODEL." };
  }
  if (["ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"].includes(netCode) || low.includes("fetch failed")) {
    return { code: "NO_INTERNET", problem: `Could not reach Google (${netCode || "network error"}).`, fix: "Check the internet connection, VPN or proxy on the machine running the backend." };
  }
  if (low.includes("api key not valid") || low.includes("api_key_invalid") || (status === 400 && low.includes("api key"))) {
    return { code: "BAD_API_KEY", problem: "Gemini says the API key is not valid.", fix: "Copy the key again from Google AI Studio into backend/.env (GEMINI_API_KEY=...) with no quotes or spaces, then restart the backend." };
  }
  if (status === 401 || status === 403) {
    if (low.includes("location") || low.includes("region")) {
      return { code: "REGION", problem: msg, fix: "Gemini is not available from this location. Try another network or a VPN." };
    }
    return { code: "KEY_REJECTED", problem: msg, fix: "The key was rejected. Check it is a Gemini API key from AI Studio and that the Generative Language API is enabled for it." };
  }
  if (status === 404) {
    return { code: "BAD_MODEL", problem: `Model "${MODEL}" was not found for this key.`, fix: "Fix GEMINI_MODEL in backend/.env (copy the exact model name from Google AI Studio) and restart." };
  }
  if (status === 429) {
    return { code: "QUOTA", problem: "Rate limit or free quota reached.", fix: "Wait a minute and try again, or use a different key/model." };
  }
  if (status === 400 && (low.includes("mime") || low.includes("audio") || low.includes("unsupported"))) {
    return { code: "BAD_AUDIO", problem: msg, fix: "Gemini did not accept this audio format. Test with backend/test.ogg (npm run test:gemini) to confirm the key works; if only webm fails, the audio needs converting to ogg/mp3/wav." };
  }
  if (status === 400) {
    return { code: "BAD_REQUEST", problem: msg, fix: "Gemini rejected the request. Read the message above; it usually names the field." };
  }
  if (status >= 500) {
    return { code: "GEMINI_DOWN", problem: msg || `Gemini server error (${status}).`, fix: "Gemini is overloaded or down. Wait a few seconds and try again." };
  }
  return { code: "GEMINI_ERROR", problem: msg || "Unknown error", fix: "See the message above." };
}

// Runs once at startup: checks the key and the model name without sending any audio.
async function checkGemini() {
  if (!geminiConfigured()) {
    log.warn("GEMINI_API_KEY is empty. Add it to backend/.env and restart. Recordings will be saved but not analysed.");
    return false;
  }
  try {
    await withTimeout(getClient().models.get({ model: MODEL }), 15000);
    log.ok(`Gemini key works and model "${MODEL}" exists`);
    return true;
  } catch (err) {
    const e = explainGeminiError(err);
    log.fail(`Gemini check failed [${e.code}]: ${e.problem}`);
    log.hint(e.fix);
    return false;
  }
}

async function callGemini({ audioBase64, mimeType, lang }) {
  return withTimeout(
    getClient().models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: audioBase64 } },
            { text: buildPrompt(lang) },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        temperature: 0.1,
      },
    }),
    TIMEOUT_MS
  );
}

// Sends the audio file to Gemini and returns the parsed JSON. Throws an error with a .gemini
// field ({ code, problem, fix }) so callers can print and return something clear.
async function analyzeAudio({ filePath, mimeType, lang }) {
  const cleanMime = cleanMimeType(mimeType);
  const audio = fs.readFileSync(filePath);
  log.step(`Sending ${(audio.length / 1024).toFixed(0)} KB of ${cleanMime} to Gemini (model: ${MODEL})...`);

  let response;
  try {
    try {
      response = await callGemini({ audioBase64: audio.toString("base64"), mimeType: cleanMime, lang });
    } catch (err) {
      // Gemini sometimes answers 503 "overloaded". One quick retry usually fixes it.
      if (err && err.status === 503) {
        log.warn("Gemini is busy (503). Retrying once...");
        await new Promise((r) => setTimeout(r, 1500));
        response = await callGemini({ audioBase64: audio.toString("base64"), mimeType: cleanMime, lang });
      } else {
        throw err;
      }
    }

    const text = (response.text || "").trim();
    if (!text) {
      const reason =
        response.promptFeedback?.blockReason ||
        response.candidates?.[0]?.finishReason ||
        "no text returned";
      const e = new Error(`Gemini returned an empty answer (${reason}).`);
      e.code = "GEMINI_EMPTY";
      throw e;
    }

    log.ok("Gemini replied");
    console.log(log.dim(text));

    try {
      return JSON.parse(text);
    } catch {
      const e = new Error("Gemini's answer was not valid JSON.");
      e.code = "GEMINI_BAD_JSON";
      throw e;
    }
  } catch (err) {
    err.gemini = explainGeminiError(err);
    throw err;
  }
}

module.exports = { analyzeAudio, checkGemini, explainGeminiError, geminiConfigured, MODEL };
