// dumps keyed 60-char windows of every occurrence of the non-dividing small shapes, for reading the meanings
// usage: node dump-small.mjs <by-source jsonl>
import fs from "node:fs";
const rows = fs.readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const want = { "-": (s, i) => !(/\p{L}|\)/u.test(s[i - 1] || "") && /\p{L}/u.test(s[i + 1] || "")), "(": () => true, ".": () => true, "’": (s, i) => !(s[i + 1] === "s" && !/\p{L}/u.test(s[i + 2] || "")), "?": () => true, "‛": () => true, "…": () => true, "&": () => true, "‘": () => true, "׳": () => true, "̌": () => true, ",": (s, i) => i === s.length - 1 || !/\s/u.test(s[i + 1]) };
const seen = new Set();
for (const r of rows) { const s = r.route; for (let i = 0; i < s.length; i++) { const f = want[s[i]]; if (f && f(s, i)) { const k = s[i] + r.key + s; if (seen.has(k)) continue; seen.add(k); console.log(JSON.stringify(s[i]) + " " + r.key + " | " + s.slice(Math.max(0, i - 30), i + 30)); } } }
let ex = 0; const exs = []; for (const r of rows) if (r.route.endsWith("!")) { ex++; if (exs.length < 43) exs.push(r.key + " | " + r.route.slice(-40)); }
console.log("exclamation routes", ex); console.log(exs.join("\n"));
