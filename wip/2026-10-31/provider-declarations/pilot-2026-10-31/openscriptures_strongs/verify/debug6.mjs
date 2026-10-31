// In draft-label mode: which untagged definition commas would move to after_label / name under looser readings of the words.
import { loadRows, traceAt } from "./common.mjs";
import { analyze, useLabels } from "./classify.mjs";
import { draftIsLabel } from "./labels.mjs";
useLabels("draft");
const rows = loadRows(); const cache = new Map(); const tally = {}; const ex = {};
const D_LEAD_ANY = (t) => { const w = t.trim().split(/\s+/); for (let k = 1; k <= Math.min(4, w.length); k++) if (draftIsLabel(w.slice(0, k).join(" "))) return true; return false; };
const D_TAIL_ANY = (t) => { const w = t.trim().split(/\s+/); for (let k = 1; k <= Math.min(4, w.length); k++) if (draftIsLabel(w.slice(-k).join(" "))) return true; return false; };
for (const r of rows) {
  let a = cache.get(r.def); if (!a) { a = analyze(r.def); cache.set(r.def, a); }
  if (a.field !== "def") continue; const s = r.def;
  const off = r.route === r.def ? 0 : s.indexOf(r.route);
  for (let k = 0; k < r.route.length; k++) {
    const i = off + k; const sh = a.shape.get(i);
    if (sh !== "comma.def_short_series" && sh !== "comma.def_clause") continue;
    let b = -1; for (const x of a.seps) if (x < i) b = x; const pb = s.slice(b + 1, i).trim();
    const t = [D_LEAD_ANY(pb) && "lead", D_TAIL_ANY(pb) && "tail", /^\p{Lu}/u.test(pb) && "cap", draftIsLabel(pb.replace(/^\([^()]*\)\s*/u, "")) && "afterGroup", draftIsLabel(pb.replace(/\s*\([^()]*\)\s*/gu, " ").trim()) && "groupsOut"].filter(Boolean).join("+") || "none";
    const key = sh + ":" + t; tally[key] = (tally[key] || 0) + 1; (ex[key] ??= []).length < 6 && ex[key].push(r.key + ": " + pb.slice(-45));
  }
}
console.log(tally); for (const [k, v] of Object.entries(ex)) if (!k.endsWith(":none")) console.log(k, v);
