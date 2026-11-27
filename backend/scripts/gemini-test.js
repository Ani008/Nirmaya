// Quick check without the phone or the UI: sends one audio file straight to Gemini and prints the answer.
//   npm run test:gemini                      uses backend/test.ogg
//   npm run test:gemini -- path/to/file.webm
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { analyzeAudio, checkGemini, MODEL } = require("../services/gemini");
const log = require("../services/log");

const MIME = { ".webm": "audio/webm", ".ogg": "audio/ogg", ".m4a": "audio/mp4", ".mp3": "audio/mpeg", ".wav": "audio/wav" };

(async () => {
  const file = path.resolve(process.argv[2] || path.join(__dirname, "..", "test.ogg"));
  if (!fs.existsSync(file)) {
    log.fail(`File not found: ${file}`);
    process.exit(1);
  }
  log.title(`Gemini test (${MODEL})`);
  log.step(`File: ${file}`);

  if (!(await checkGemini())) process.exit(1);

  try {
    const mimeType = MIME[path.extname(file).toLowerCase()] || "audio/webm";
    const data = await analyzeAudio({ filePath: file, mimeType, lang: "en" });
    log.ok("Done");
    log.detail("heard", `"${data.transcript}"`);
    log.detail("health topic", data.relevant ? "yes" : "no");
    log.detail("summary", data.summary);
    log.detail("department", data.department);
  } catch (err) {
    const e = err.gemini || { code: "ERROR", problem: err.message, fix: "" };
    log.fail(`[${e.code}] ${e.problem}`);
    log.hint(e.fix);
    process.exit(1);
  }
})();
