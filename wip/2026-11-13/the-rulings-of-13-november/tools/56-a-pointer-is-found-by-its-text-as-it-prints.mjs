// A PRESSED POINTER PRINTED BARE ON THE LINE. The page finds a reading's entry in the pointer map by its text. The
// pill hands in its row's text as the source wrote it; a ruled line hands in the reading as it prints, where a "/"
// of the source's is " + ". The two were set side by side as written, a closing period aside, so a pointer whose
// text holds a "/" resolved on its pill («to speak (say words) (Feminine singular imperative of ...)») and, once
// that pill was pressed, stood on the line as the bare pointer («Feminine singular imperative of ... + ... »). Of
// the 1,524 pointers the map of 13 November resolves, 58 hold one (127 of 2,268 under the map before it).
// The entry is now found by the text as it prints, on both sides.
// node 56-a-pointer-is-found-by-its-text-as-it-prints.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  [`  const noDot = (t) => String(t).replace(/\\.$/u, "");
  // the pointer entry for a reading: by the route key, then the source where
  // one is named, then the text's own bytes (a closing period not counted)
  const formOfFor = (key, m, text) => {
    const l = FORM_OF && key ? FORM_OF.keys[key] : null;
    if (!l) return null;
    const ts = new Set([String(text), noDot(text), Array.isArray(text) ? spanJoin(text) : String(text)].map(noDot));
    const mids = Array.isArray(m) ? m.map(String) : m ? [String(m)] : [];
    return l.find((e) => mids.includes(e.m) && ts.has(noDot(e.t))) || l.find((e) => ts.has(noDot(e.t))) || null;
  };
`,
   `  // the pointer entry for a reading: by the route key, then the source where
  // one is named, then the text as it prints (spanJoin: a closing period is
  // not counted, and a "/" of the source's prints " + "). The pill hands in
  // its row's text as written; a ruled line and a baked lead hold the
  // reading as it prints. Until 13 November 2026 the two were set side by
  // side as written, so a pointer whose text holds a "/" resolved on its
  // pill and stood bare on the line once that pill was pressed (58 of the
  // 1,524 pointers the map resolves hold one).
  const formOfFor = (key, m, text) => {
    const l = FORM_OF && key ? FORM_OF.keys[key] : null;
    if (!l) return null;
    const t = spanJoin(text);
    const mids = Array.isArray(m) ? m.map(String) : m ? [String(m)] : [];
    return l.find((e) => mids.includes(e.m) && spanJoin(e.t) === t) || l.find((e) => spanJoin(e.t) === t) || null;
  };
`],
]);
