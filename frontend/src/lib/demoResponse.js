// Predefined result for "Demo recording" mode.
// Used when the backend has no Gemini API key: the request never leaves the app, and this
// response is shown instead. It has exactly the same shape as the backend's /api/voice reply,
// so Home.jsx renders it with the same code path as a live result.
//
// Sample script for the demo recording (frontend/public/demo/demo-recording.webm):
//   hi: "मुझे दो दिन से बुखार है और पेट में दर्द हो रहा है।"
//   (Mujhe do din se bukhar hai aur pet mein dard ho raha hai.)
//
// The slip mirrors backend/data/hospital-rules.json (General Medicine, OPD 3).
// If you change that file, update the values below too.

const CASE_FEE = 50;

const DEMO_RESPONSES = {
  hi: {
    transcript: "मुझे दो दिन से बुखार है और पेट में दर्द हो रहा है।",
    summary: "आपको दो दिन से बुखार है और पेट में दर्द हो रहा है।",
    possibleCause: "यह किसी संक्रमण या पेट की गड़बड़ी से जुड़ा हो सकता है।",
    disclaimer: "यह केवल एक मार्गदर्शन है। डॉक्टर आपकी जाँच करेंगे।",
    slip: {
      departmentId: "general_medicine",
      department: "जनरल मेडिसिन",
      opd: "ओपीडी 3",
      doctor: "डॉ. रुत्विक पाटील",
      counter: "पंजीकरण काउंटर 1",
      steps: [
        "पंजीकरण काउंटर 1 पर जाइए। कोई भी पहचान पत्र या पुराना अस्पताल कार्ड साथ रखिए।",
        `₹${CASE_FEE} जमा करें और अपना केस पेपर लीजिए।`,
        "ओपीडी 3 में जाइए और डॉ. रुत्विक पाटील से मिलिए।",
        "अपना केस पेपर और फाइल डॉक्टर को दीजिए।",
      ],
    },
  },
  mr: {
    transcript: "मला दोन दिवसांपासून ताप आहे आणि पोटात दुखत आहे.",
    summary: "तुम्हाला दोन दिवसांपासून ताप आहे आणि पोटात दुखत आहे.",
    possibleCause: "हे एखाद्या संसर्गामुळे किंवा पोटाच्या त्रासामुळे असू शकते.",
    disclaimer: "हे फक्त मार्गदर्शन आहे. डॉक्टर तुमची तपासणी करतील.",
    slip: {
      departmentId: "general_medicine",
      department: "जनरल मेडिसिन",
      opd: "ओपीडी 3",
      doctor: "डॉ. रुत्विक पाटील",
      counter: "नोंदणी काउंटर 1",
      steps: [
        "नोंदणी काउंटर 1 येथे जा. कोणतेही ओळखपत्र किंवा जुने हॉस्पिटल कार्ड सोबत घ्या.",
        `₹${CASE_FEE} भरा आणि तुमचा केस पेपर घ्या.`,
        "ओपीडी 3 मध्ये जा आणि डॉ. रुत्विक पाटील यांना भेटा.",
        "तुमचा केस पेपर आणि फाईल डॉक्टरांना द्या.",
      ],
    },
  },
  en: {
    transcript: "I have had a fever for two days and my stomach is hurting.",
    summary: "You have had a fever for two days and stomach pain.",
    possibleCause: "This may be related to an infection or a stomach upset.",
    disclaimer: "This is a guide. The doctor will examine you.",
    slip: {
      departmentId: "general_medicine",
      department: "General Medicine",
      opd: "OPD 3",
      doctor: "Dr. Rutwik Patil",
      counter: "Registration Counter 1",
      steps: [
        "Go to Registration Counter 1. Carry any ID or an old hospital card.",
        `Pay ₹${CASE_FEE} and collect your case paper.`,
        "Go to OPD 3 and meet Dr. Rutwik Patil.",
        "Give your case paper and file to the doctor.",
      ],
    },
  },
};

// Returns the predefined "ok" result in the chosen language (falls back to English).
export function getDemoResponse(lang) {
  const data = DEMO_RESPONSES[lang] || DEMO_RESPONSES.en;
  return {
    status: "ok",
    patient: {
      name: null,
      age: null,
      gender: null,
      symptoms: ["fever", "stomach pain"],
      duration: "2 days",
    },
    ...data,
  };
}
