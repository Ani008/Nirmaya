DEMO RECORDING GOES HERE
========================

Put your sample patient recording in this folder and name it exactly:

    demo-recording.webm

(Full path from the repo root: frontend/public/demo/demo-recording.webm)

- The app plays it in the "Demo recording" tab, so judges can try the app without an API key.
- Keep it short (5 to 15 seconds), for example: "I have had a fever for two days".
- Any browser-playable audio works (.webm, .mp3, .m4a, .wav, .ogg). If you use another
  extension, change DEMO_AUDIO_SRC in frontend/src/config.js to match.
- Files in this folder are copied into the Docker image automatically, so nothing else is needed.
