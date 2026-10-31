// Tabulate overlapping def-field period tests over route occurrences, to find the order the words leave open.
import { loadRows, isLetter } from "./common.mjs";
import { analyze } from "./classify.mjs";
const rows = loadRows(); const cache = new Map(); const combos = {}; const ex = {};
for (const r of rows) {
  let a = cache.get(r.def); if (!a) { a = analyze(r.def); cache.set(r.def, a); }
  if (a.field !== "def") continue;
  const off = r.route === r.def ? 0 : r.def.indexOf(r.route); const s = r.def;
  for (let k = 0; k < r.route.length; k++) {
    const i = off + k; if (s[i] !== ".") continue;
    if (s[i - 1] === "." || s[i + 1] === ".") continue;
    if (s.slice(i - 3, i + 1) === "i.e." || s.slice(i - 1, i + 3) === "i.e.") continue;
    if (s.slice(i - 3, i) === "etc") continue;
    const after = s.slice(i + 1);
    const f = [];
    if (isLetter(s[i - 1]) && (s[i + 1] === ")" || s[i + 1] === "," || /^\s*\p{Ll}/u.test(after))) f.push("abbr");
    if (s[i + 1] === ")") f.push("aside");
    if (i === s.length - 1 || /^ [\p{Lu}֐-׿\p{N}]/u.test(after)) f.push("sent");
    if (s[i - 1] === " " && !/^\s*\p{Ll}/u.test(after)) f.push("trace");
    if (s[i - 1] === " " && /^ \p{Ll}/u.test(after)) f.push("stray");
    const k2 = f.join("+") || "none"; combos[k2] = (combos[k2] || 0) + 1;
    (ex[k2] ??= []).length < 4 && ex[k2].push(r.key + ": " + s.slice(Math.max(0, i - 20), i + 15));
  }
}
console.log(combos); console.log(ex);
