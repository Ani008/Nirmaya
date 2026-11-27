import { useCallback, useEffect, useRef } from "react";

// Picks the best audio format this browser can record.
// Chrome/Android: webm (opus). Safari/iPhone: mp4. Both are accepted by the backend.
function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

export default function useRecorder() {
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const releaseMic = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Asks for microphone permission (first time only) and starts recording.
  // Throws if the permission is denied or the browser can't record.
  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      throw new Error("RECORDING_UNSUPPORTED");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.start();
    recorderRef.current = recorder;
  }, []);

  // Stops recording and resolves with the audio Blob (or null if nothing was recording).
  const stop = useCallback(
    () =>
      new Promise((resolve) => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === "inactive") {
          releaseMic();
          resolve(null);
          return;
        }
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          releaseMic();
          recorderRef.current = null;
          resolve(blob);
        };
        recorder.stop();
      }),
    [releaseMic]
  );

  // Switch the mic off if the page is closed while recording
  useEffect(() => releaseMic, [releaseMic]);

  return { start, stop };
}
