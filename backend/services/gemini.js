// Sends the patient's audio to Gemini and gets back structured data (not free text).
// Gemini only listens and extracts. The hospital steps come from the rules file.
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");
const { departmentIds, departmentHints, DEFAULT_DEPARTMENT } = require("./rules");

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
    timer = setTimeout(
      () => reject(new Error(`Gemini did not answer within ${ms / 1000}s (check internet, key and model name)`)),
      ms
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function analyzeAudio({ filePath, mimeType, lang }) {
  const audioBase64 = fs.readFileSync(filePath).toString("base64");

  const response = await withTimeout(
    getClient().models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: cleanMimeType(mimeType), data: audioBase64 } },
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

  return JSON.parse(response.text);
}

module.exports = { analyzeAudio, geminiConfigured, MODEL };
