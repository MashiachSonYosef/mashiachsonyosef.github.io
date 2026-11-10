// Names the page script declares and never reads, and style rules for classes nothing sets.
// node 04-unused.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
edit(join(process.argv[2], "zone.html"), [
// ---- the sheet: classes no element is ever given (the page, its script and the builders were searched)
[`  .receipts-btn { background: none; border: 0; border-bottom: 1px dotted var(--gold-dim);
    color: var(--link); font: inherit; font-size: 0.8rem; cursor: pointer; padding: 0; }
  .receipts-btn:hover { color: var(--ink-strong); }
`, ``],
[`  #toc .part b .he-small { color: var(--ink); font-size: 1rem; margin-left: 0.6rem; }
`, ``],
[`  .rail .src-cost { display: block; font-style: normal; font-size: 0.64rem; color: var(--faint); }
`, ``],
[`  .rail .decl-aspect { margin: 0; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .rail .decl-aspect i { font-style: normal; letter-spacing: 0; text-transform: none; color: var(--faint); }
  .rail .decl-aspect i.decl-work { font-size: 0.6rem; }
`, ``],
[`  .rail .def-order .declp { font: inherit; font-size: 0.6rem; letter-spacing: 0.04em;
    color: var(--faint); background: none; border: none; border-bottom: 1px solid var(--line);
    border-radius: 0; padding: 0 0 0.04rem; cursor: pointer; }
  .rail .def-order .declp::after { content: " \\25be"; }
  .rail .def-order .declp[aria-expanded="true"]::after { content: " \\25b4"; }
  .rail .def-order .declp:hover { color: var(--ink); border-bottom-color: var(--gold); }
  .rail .declp.decl-open[aria-expanded="true"] { color: var(--sel); border-bottom-color: var(--sel-dim); }
`, ``],
[`  .c-bar .c-hint { font-size: 0.66rem; opacity: 0.6; }
`, ``],
[`  .g .g-join { color: var(--tekhelet-dim); }
`, ``],
// ---- the script: declared, never read
[`  const KQ_SAYS = { KETIV: "ketiv first", QERE: "qere first", SOURCE: "as the source sets them" };
`, ``],
[`  const postureOf = (mId) => {
    const m = index.m_sources[mId];
    return m ? String(m.licensePosture || "") : "";
  };
`, ``],
[`  let PIECE_BOOK = null, pieceBookP = null;`, `  let pieceBookP = null;`],
[`    .then((j) => { PIECE_BOOK = j; return j; })
`, ``],
[`    const ourLicence = stem.silent.some((x) => x.aspect === "licence_material" && (x.why === "ONLY_OUR_MANIFEST_SAYS_IT" || x.why === "ONLY_OUR_DERIVED_FILE_SAYS_IT"));
`, ``],
// a pair opens on the half its line reads from; no half pressed on the card is remembered (kqLead says so),
// and the key such a memory would have used was still computed here
[`    // A PAIR OPENS ON THE HALF THE SWITCH NAMES. Whichever half is pressed,
    // the card opens on the half the pairs switch names, or the half the
    // reader pressed in the head at this place, or a ruled half, or the half
    // the line fell back to when the switch's half has no reading. The other
    // half stands in the head as it always did, one press away.
    const site = \`\${unitId}:\${wordPos}\`;
`,
`    // A PAIR OPENS ON THE HALF ITS LINE READS FROM (kqLead, below). Whichever
    // half is pressed, the card opens on a ruled half, or the half the pairs
    // switch names, or the half the line fell back to when the switch's half
    // has no reading. The other half stands in the head as it always did, one
    // press away, and a half pressed there is not remembered.
`],
]);
