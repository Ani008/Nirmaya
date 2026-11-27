# Nirmaya

A voice-first patient guide for hospital OPDs in Maharashtra. The patient speaks their
problem in Marathi, Hindi or English, and the app tells them which department to visit and
the exact steps: registration counter, case paper, OPD room and doctor.

## How it works

1. The browser records the patient's voice and sends it to the backend.
2. Gemini listens and extracts structured details (name, age, symptoms, duration, department).
   It does not write the hospital steps and it does not diagnose.
3. The backend looks up the steps in its own rules file, `backend/data/hospital-rules.json`
   (counter, fee, OPD room, doctor, wording in all three languages).
4. The app shows the roadmap in chat and reads it aloud. Emergency words trigger a full-screen
   red alert.

## Run with Docker (one command)

```
docker compose up --build
```

Open http://localhost:8080. The app starts without any secret keys. To enable voice
understanding, copy `backend/.env.example` to `backend/.env`, set `GEMINI_API_KEY`, and
restart. Without a key the app shows a "key not set" message when you try to speak.

## Run without Docker

```
cd backend && npm install && npm start        # API on http://localhost:5000
cd frontend && npm install && npm run dev     # app on http://localhost:5173
```

## Demo notes

- Hospital data in `backend/data/hospital-rules.json` is sample data.
- Recordings are saved to `backend/uploads/` for the demo only (git-ignored).
- The microphone needs `localhost` or HTTPS.
