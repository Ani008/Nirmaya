// Rules engine: turns a department id into the step-by-step hospital roadmap.
// Everything the patient is told about counters, fees, OPD rooms and doctors comes from
// data/hospital-rules.json, never from the AI model.
const rules = require("../data/hospital-rules.json");

const SUPPORTED_LANGS = ["mr", "hi", "en"];
const DEFAULT_DEPARTMENT = "general_medicine";

function normalizeLang(lang) {
  return SUPPORTED_LANGS.includes(lang) ? lang : "en";
}

function departmentIds() {
  return Object.keys(rules.departments);
}

// "id: what it covers" lines, used inside the Gemini prompt
function departmentHints() {
  return departmentIds()
    .map((id) => `- ${id}: ${rules.departments[id].hint}`)
    .join("\n");
}

function message(key, lang) {
  return rules.messages[normalizeLang(lang)][key];
}

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

// Build the numbered roadmap for one department in the patient's language.
function buildSlip(departmentId, langInput) {
  const lang = normalizeLang(langInput);
  const id = rules.departments[departmentId] ? departmentId : DEFAULT_DEPARTMENT;
  const dept = rules.departments[id];
  const hospital = rules.hospital;

  const values = {
    counter: hospital.counter[lang],
    fee: hospital.caseFee,
    opd: `${hospital.opdWord[lang]} ${dept.opd}`,
    doctor: dept.doctor[lang],
  };

  return {
    departmentId: id,
    department: dept.label[lang],
    opd: values.opd,
    doctor: values.doctor,
    counter: values.counter,
    steps: rules.steps[lang].map((step) => fill(step, values)),
  };
}

// Safety net that does not depend on the AI: scan what the patient said for emergency words.
function hasEmergencyKeyword(...texts) {
  const haystack = texts.filter(Boolean).join(" ").toLowerCase();
  return rules.emergencyKeywords.some((word) => haystack.includes(word.toLowerCase()));
}

module.exports = {
  normalizeLang,
  departmentIds,
  departmentHints,
  message,
  buildSlip,
  hasEmergencyKeyword,
  DEFAULT_DEPARTMENT,
};
