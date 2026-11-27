require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { analyzeAudio, geminiConfigured, MODEL } = require("./services/gemini");
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

// The app must start and show its screen with no secret keys, so a missing key is
// reported per request instead of crashing the server.
function requireGeminiKey(_req, res, next) {
  if (geminiConfigured()) return next();
  return res.status(503).json({
    error: "GEMINI_KEY_NOT_SET",
    message: "Gemini API key not set. Add GEMINI_API_KEY to backend/.env and restart.",
  });
}

app.get("/", (_req, res) => res.send("Nirmaya API is running"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, geminiKeySet: geminiConfigured(), model: MODEL });
});

// POST /voice  (multipart form: "audio" file + "lang" = mr | hi | en)
app.post("/voice", requireGeminiKey, upload.single("audio"), async (req, res) => {
  const lang = normalizeLang(req.body && req.body.lang);

  if (!req.file) {
    return res.status(400).json({ error: "NO_AUDIO", message: "No audio file (field 'audio')." });
  }

  const started = Date.now();
  console.log(`Received ${req.file.mimetype}, ${(req.file.size / 1024).toFixed(0)} KB, lang=${lang}`);

  // 1. Silence or a tap with no speech
  if (req.file.size < MIN_AUDIO_BYTES) {
    return res.json({ status: "no_speech", message: message("noSpeech", lang) });
  }

  // 2. Ask Gemini to listen and extract structured details
  let data;
  try {
    data = await analyzeAudio({ filePath: req.file.path, mimeType: req.file.mimetype, lang });
  } catch (err) {
    console.error("Gemini error:", err.message);
    return res.status(502).json({ error: "GEMINI_ERROR", message: err.message });
  }
  console.log(`Gemini done in ${((Date.now() - started) / 1000).toFixed(1)}s`);

  const patient = {
    name: data.name ?? null,
    age: data.age ?? null,
    gender: data.gender ?? null,
    symptoms: data.symptoms || [],
    duration: data.duration ?? null,
  };

  // 3. Could not hear / not about health
  if (!data.intelligible) {
    return res.json({ status: "no_speech", message: message("noSpeech", lang) });
  }
  if (!data.relevant) {
    return res.json({ status: "unrelated", message: message("unrelated", lang) });
  }

  // 4. Emergency: the model flag OR our own keyword check. Skip everything else.
  if (data.emergency || hasEmergencyKeyword(data.transcript, patient.symptoms.join(" "))) {
    return res.json({
      status: "emergency",
      message: message("emergency", lang),
      patient,
      transcript: data.transcript,
    });
  }

  // 5. Normal case: roadmap comes from the rules file
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
    console.log(`Nirmaya API on port ${PORT} (Gemini key ${geminiConfigured() ? "set" : "NOT set"}, model ${MODEL})`);
  });
}

module.exports = app;
