// Talks to the backend. In dev, Vite proxies /api to localhost:5000; in Docker, nginx does.

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Sends the recorded audio and the selected language. Returns the backend's JSON.
export async function sendVoice(blob, lang) {
  const form = new FormData();
  const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
  form.append("audio", blob, `recording.${ext}`);
  form.append("lang", lang);

  let response;
  try {
    response = await fetch("/api/voice", { method: "POST", body: form });
  } catch {
    throw new ApiError("NETWORK", "Could not reach the server.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON error page */
  }

  if (!response.ok) {
    // No JSON body means the request never reached our API (for example the backend is not running)
    if (!data) throw new ApiError("NETWORK", "Could not reach the server.");
    throw new ApiError(data.error || "SERVER_ERROR", data.message || "Server error");
  }
  return data;
}

// Asks the backend whether a Gemini key is set. Returns null when the backend cannot be reached.
export async function getHealth() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
