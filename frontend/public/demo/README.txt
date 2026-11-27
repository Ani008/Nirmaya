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

DEMO SCRIPT (what to say in the recording)
------------------------------------------
Hindi:   "मुझे दो दिन से बुखार है और पेट में दर्द हो रहा है।"
         (Mujhe do din se bukhar hai aur pet mein dard ho raha hai.)

When no Gemini key is set (or the backend can't be reached), "Analyse recording" does not
send anything to the server. It plays the normal Listening -> Understanding -> Extracting ->
Hospital map sequence and shows the predefined answer from frontend/src/lib/demoResponse.js
(General Medicine, OPD 3), in whichever language is selected. Edit that file to change it.
