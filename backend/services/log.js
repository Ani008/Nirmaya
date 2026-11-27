// Small helpers so the backend terminal tells you exactly what is happening.
const useColor = process.stdout.isTTY;
const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);

const green = paint(32);
const red = paint(31);
const yellow = paint(33);
const cyan = paint(36);
const dim = paint(2);
const bold = paint(1);

const ok = (text) => console.log(`${green("✔")} ${text}`);
const fail = (text) => console.error(`${red("✖")} ${red(text)}`);
const warn = (text) => console.warn(`${yellow("!")} ${text}`);
const step = (text) => console.log(`${cyan("→")} ${text}`);
const detail = (label, value) => console.log(`    ${dim(label.padEnd(12))} ${value}`);
const hint = (text) => console.error(`  ${yellow("Fix:")} ${text}`);
const title = (text) => console.log(`\n${bold(`──────── ${text} ────────`)}`);

module.exports = { ok, fail, warn, step, detail, hint, title, dim };
