// require("dotenv").config();
// const express = require("express");
// const multer = require("multer");
// const cors = require("cors");
// const { GoogleGenAI } = require("@google/genai");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // audio is kept in memory (no files saved); 10 MB limit
// const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: "v1beta" });
// // Copy the current free Flash model name from Google AI Studio into .env
// const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// const PROMPT = `You are a patient-intake assistant for a government hospital OPD in India.
// The audio is a patient speaking in Marathi, Hindi, English or a mix.
// Extract the details into JSON. Rules:
// - Do NOT diagnose or give medical advice.
// - name, age (number), gender, symptoms (array, in English), duration, severity ("mild"|"moderate"|"severe"), suggested_department (e.g. General Medicine, Pediatrics, Orthopedics, Gynecology, ENT, Eye, Skin, Emergency).
// - Use null for anything not said. Do not guess.
// - emergency = true only for chest pain, breathlessness, heavy bleeding, unconsciousness, seizure, or stroke signs.
// - transcript: what the patient said, in the original language.
// - english_summary: 1-2 sentences for the doctor.`;

// const SCHEMA = {
//   type: "object",
//   properties: {
//     name: { type: "string", nullable: true },
//     age: { type: "number", nullable: true },
//     gender: { type: "string", nullable: true },
//     symptoms: { type: "array", items: { type: "string" } },
//     duration: { type: "string", nullable: true },
//     severity: { type: "string", nullable: true },
//     suggested_department: { type: "string", nullable: true },
//     emergency: { type: "boolean" },
//     transcript: { type: "string" },
//     english_summary: { type: "string" },
//   },
//   required: ["symptoms", "emergency", "transcript", "english_summary"],
// };

// app.get("/", (_req, res) => res.send("Voice intake API is running"));

// // POST /intake  (multipart form, field name: "audio")
// app.post("/intake", upload.single("audio"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No audio file (field 'audio')" });

//     // live progress in the terminal while Gemini works
//     const t0 = Date.now();
//     console.log(`\n📥 Received ${req.file.mimetype}, ${(req.file.size / 1024).toFixed(0)} KB. Sending to ${MODEL}...`);
//     const spinner = setInterval(() => {
//       process.stdout.write(`\r⏳ Processing... ${((Date.now() - t0) / 1000).toFixed(0)}s`);
//     }, 500);

//     let result;
//     try {
//       // give up after 45s instead of hanging forever
//       result = await Promise.race([
//         callGemini(req),
//         new Promise((_, reject) =>
//           setTimeout(() => reject(new Error("Timed out after 45s - Node can't reach Gemini (check internet/VPN/key/model)")), 45000)
//         ),
//       ]);
//     } finally {
//       clearInterval(spinner);
//     }
//     console.log(`\r✅ Done in ${((Date.now() - t0) / 1000).toFixed(1)}s            `);

//     const data = JSON.parse(result.text);
//     console.log(data);
//     return res.json(data);
//   } catch (err) {
//     console.error("\n❌ Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// function callGemini(req) {
//   return (async () => {
//     const result = await ai.models.generateContent({
//       model: MODEL,
//       contents: [
//         {
//           role: "user",
//           parts: [
//             { inlineData: { mimeType: req.file.mimetype || "audio/mp4", data: req.file.buffer.toString("base64") } },
//             { text: PROMPT },
//           ],
//         },
//       ],
//       config: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.1 },
//     });
//     return result;
//   })();
// }

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Listening on ${PORT}`));


const url = "https://example.com/api/health";

async function checkApi() {
  try {
    const response = await fetch(url);

    if (response.ok) {
      console.log("API is UP, status:", response.status);
    } else {
      console.log("API has a problem, status:", response.status);
    }
  } catch (error) {
    console.log("API is DOWN:", error.message);
  }
}

checkApi();
setInterval(checkApi, 30000);