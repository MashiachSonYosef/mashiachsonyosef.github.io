import { loadRows, isDigit } from "./common.mjs";
import { analyze } from "./classify.mjs";
const rows = loadRows(); const cache = new Map();
for (const r of rows) {
  let a = cache.get(r.def); if (!a) { a = analyze(r.def); cache.set(r.def, a); }
  if (a.field !== "def") continue; const s = r.def;
  const off = r.route === r.def ? 0 : r.def.indexOf(r.route);
  for (let k = 0; k < r.route.length; k++) {
    const i = off + k; const f = a.flags.get(i); const sh = a.shape.get(i);
    if (f && !f.name && !f.ie && !f.etc) { let b = -1; for (const x of a.seps) if (x < i) b = x; const pb = s.slice(b + 1, i).trim(); if (/\p{Lu}/u.test(pb)) console.log("TAGGED-NOT-NAME", sh, "|", r.key, "|", pb.slice(0, 50)); }
    if (s[i] === "," && a.p.depth[i] === 0 && !f && /\s/u.test(s[i - 1])) console.log("WS-BEFORE-NO-TRACE", sh, "|", r.key, "|", JSON.stringify(s.slice(Math.max(0, i - 20), i + 10)));
  }
}
