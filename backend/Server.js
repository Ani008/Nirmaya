require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { analyzeAudio, checkGemini, geminiConfigured, MODEL } = require("./services/gemini");
const log = require("./services/log");
const { normalizeLang, message, buildSlip, hasEmergencyKeyword } = require("./services/rules");

const app = express();
app.use(cors());
app.use(express.json());

// Demo setup: recordings are saved on disk in backend/uploads (git-ignored).
// For real patients this should change to in-memory processing with no storage.
const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXTENSIONS = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const mime = (file.mimetype || "").split(";")[0];
      const ext = EXTENSIONS[mime] || "webm";
      cb(null, `${Date.now()}-${crypto.randomBytes(3).toString("hex")}.${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// Anything smaller than this is a tap with no speech in it
const MIN_AUDIO_BYTES = 2000;

app.get("/", (_req, res) => res.send("Nirmaya API is running"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, geminiKeySet: geminiConfigured(), model: MODEL });
});

// POST /voice  (multipart form: "audio" file + "lang" = mr | hi | en)
// The upload runs first, so the recording is saved even when the Gemini key is missing.
app.post("/voice", upload.single("audio"), async (req, res) => {
  const lang = normalizeLang(req.body && req.body.lang);

  if (!req.file) {
    return res.status(400).json({ error: "NO_AUDIO", message: "No audio file (field 'audio')." });
  }

  log.title("New recording");
  log.ok(`Saved ${req.file.filename} (${(req.file.size / 1024).toFixed(0)} KB, ${req.file.mimetype}, lang=${lang})`);

  // 1. No Gemini key: the file is still saved in uploads/, the patient gets a clear message
  if (!geminiConfigured()) {
    log.fail("GEMINI_API_KEY is not set, so the audio was saved but not analysed.");
    log.hint("Add GEMINI_API_KEY to backend/.env and restart the backend.");
    return res.status(503).json({
      error: "GEMINI_KEY_NOT_SET",
      message: "Gemini API key not set. Add GEMINI_API_KEY to backend/.env and restart.",
    });
  }

  // 2. Silence or a tap with no speech
  if (req.file.size < MIN_AUDIO_BYTES) {
    log.warn(`Recording is only ${req.file.size} bytes. Too short to contain speech, not sent to Gemini.`);
    return res.json({ status: "no_speech", message: message("noSpeech", lang) });
  }

  // 3. Ask Gemini to listen and extract structured details
  const started = Date.now();
  let data;
  try {
    data = await analyzeAudio({ filePath: req.file.path, mimeType: req.file.mimetype, lang });
  } catch (err) {
    const e = err.gemini || { code: "GEMINI_ERROR", problem: err.message, fix: "See the message above." };
    log.fail(`Gemini failed [${e.code}]: ${e.problem}`);
    log.hint(e.fix);
    return res.status(502).json({ error: e.code, message: `${e.problem} ${e.fix}` });
  }
  log.ok(`Gemini answered in ${((Date.now() - started) / 1000).toFixed(1)}s`);

  const patient = {
    name: data.name ?? null,
    age: data.age ?? null,
    gender: data.gender ?? null,
    symptoms: data.symptoms || [],
    duration: data.duration ?? null,
  };

  log.detail("heard", `"${data.transcript || ""}"`);
  log.detail("understood", data.intelligible ? "yes" : "no (silence or unclear)");
  log.detail("health topic", data.relevant ? "yes" : "no");
  log.detail("summary", data.summary || "-");
  log.detail("possible", data.possibleCause || "-");
  log.detail("symptoms", patient.symptoms.join(", ") || "-");
  log.detail("department", data.department || "-");
  log.detail("emergency", data.emergency ? "YES" : "no");

  // 4. Could not hear / not about health
  if (!data.intelligible) {
    log.warn("Gemini could not make out any words (silence or noise).");
    return res.json({ status: "no_speech", message: message("noSpeech", lang) });
  }
  if (!data.relevant) {
    log.warn("Gemini heard you fine, but it is not a health problem, so the app shows the 'unrelated' message.");
    log.warn("For a real test, say something like: \"I have had fever and body ache for two days\".");
    return res.json({ status: "unrelated", message: message("unrelated", lang) });
  }

  // 5. Emergency: the model flag OR our own keyword check. Skip everything else.
  if (data.emergency || hasEmergencyKeyword(data.transcript, patient.symptoms.join(" "))) {
    log.warn("EMERGENCY detected. The app will show the red alert.");
    return res.json({
      status: "emergency",
      message: message("emergency", lang),
      patient,
      transcript: data.transcript,
    });
  }

  // 6. Normal case: roadmap comes from the rules file
  log.ok("Roadmap built. Sending result to the app.");
  return res.json({
    status: "ok",
    patient,
    transcript: data.transcript,
    summary: data.summary,
    possibleCause: data.possibleCause || null,
    disclaimer: message("disclaimer", lang),
    slip: buildSlip(data.department, lang),
  });
});

// Express 5 error handler (for example: file too large)
app.use((err, _req, res, _next) => {
  console.error("Request error:", err.message);
  const tooLarge = err.code === "LIMIT_FILE_SIZE";
  res.status(tooLarge ? 413 : 500).json({
    error: tooLarge ? "AUDIO_TOO_LARGE" : "SERVER_ERROR",
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

// Only listen when run directly, so tests can import the app.
if (require.main === module) {
  app.listen(PORT, () => {
    log.title("Nirmaya API");
    log.ok(`Listening on port ${PORT} (model ${MODEL}, Gemini key ${geminiConfigured() ? "set" : "NOT set"})`);
    checkGemini();
  });
}

module.exports = app;
