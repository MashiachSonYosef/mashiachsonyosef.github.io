// Print every semicolon.rendering_separator and every list_end whose note is not a note-opener, keyed, windowed.
import { loadRows } from "./common.mjs";
import { analyze, useLabels } from "./classify.mjs";
useLabels("draft");
const seen = new Set();
for (const r of loadRows()) { if (r.route !== r.def || seen.has(r.def)) continue; seen.add(r.def); const a = analyze(r.def);
  for (const [i, x] of a.shape) if (x === "semicolon.rendering_separator") console.log("SEMI", r.key, "|", r.def.slice(Math.max(0, i - 28), i + 28)); }
