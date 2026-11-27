// All user-facing text lives here, keyed by language code.
// Hospital steps (counter, fee, OPD, doctor) are NOT here: they come from backend/data/hospital-rules.json.

export const LANGUAGES = [
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिंदी" },
  { code: "en", label: "English" },
];

export const DEFAULT_LANGUAGE = "en";

// Placeholder until the patient's name is captured by voice in a later stage.
export const PLACEHOLDER_NAME = {
  mr: "अनिकेत",
  hi: "अनिकेत",
  en: "Aniket",
};

export const STRINGS = {
  mr: {
    greeting: "नमस्कार",
    prompt: "टॅप करा आणि तुम्हाला कसे वाटते ते सांगा",
    tapToSpeak: "बोलण्यासाठी टॅप करा",
    languageGroup: "भाषा निवडा",
    listening: "ऐकत आहे…",
    // Shown one after another once the patient stops speaking
    steps: [
      "समजून घेत आहे…",
      "माहिती काढत आहे…",
      "हॉस्पिटलचा मार्ग तयार करत आहे…",
    ],
    speakAgain: "पुन्हा ऐका",
    emergencyBack: "मागे जा",
    micDenied: "कृपया मायक्रोफोनची परवानगी द्या आणि पुन्हा प्रयत्न करा.",
    micUnsupported: "या फोनवर रेकॉर्डिंग चालत नाही. कृपया Chrome वापरा.",
    keyNotSet: "Gemini API की सेट केलेली नाही. backend/.env मध्ये GEMINI_API_KEY जोडा.",
    serverError: "काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.",
    networkError: "सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.",
  },
  hi: {
    greeting: "नमस्ते",
    prompt: "टैप करें और बताएं आप कैसा महसूस कर रहे हैं",
    tapToSpeak: "बोलने के लिए टैप करें",
    languageGroup: "भाषा चुनें",
    listening: "सुन रहे हैं…",
    steps: [
      "समझ रहे हैं…",
      "जानकारी निकाल रहे हैं…",
      "अस्पताल का रास्ता तैयार कर रहे हैं…",
    ],
    speakAgain: "फिर से सुनें",
    emergencyBack: "वापस जाएं",
    micDenied: "कृपया माइक्रोफ़ोन की अनुमति दें और फिर कोशिश करें।",
    micUnsupported: "इस फोन पर रिकॉर्डिंग नहीं चलती। कृपया Chrome इस्तेमाल करें।",
    keyNotSet: "Gemini API की सेट नहीं है। backend/.env में GEMINI_API_KEY जोड़ें।",
    serverError: "कुछ गड़बड़ हो गई। कृपया फिर से कोशिश करें।",
    networkError: "सर्वर से संपर्क नहीं हो सका। कृपया फिर से कोशिश करें।",
  },
  en: {
    greeting: "Hello",
    prompt: "Tap and tell us how you feel",
    tapToSpeak: "Tap to speak",
    languageGroup: "Choose language",
    listening: "Listening…",
    steps: [
      "Understanding…",
      "Extracting information…",
      "Preparing your hospital map…",
    ],
    speakAgain: "Speak again",
    emergencyBack: "Go back",
    micDenied: "Please allow the microphone and try again.",
    micUnsupported: "Recording does not work on this phone. Please use Chrome.",
    keyNotSet: "Gemini API key not set. Add GEMINI_API_KEY to backend/.env.",
    serverError: "Something went wrong. Please try again.",
    networkError: "Could not reach the server. Please try again.",
  },
};
