#!/usr/bin/env node
// LEDGER: N B Y
// the license shown for each work, the groupings the door lists, and the addresses it links to.
//
// Synthesis lane · front-door-rule-v1-the-door-lists-what-the-zones-carry
//
// The site's front door, built from the zones rather than typed — both of its
// faces: the page a reader arrives at, and the README somebody browsing the
// repository arrives at. Both said the same kind of thing and both went stale
// the same way, so both are now read out of the zones at build time.
//
// It was typed. Two books were named by hand with their section counts written
// out beside them, and when a third work arrived — the commentary, 181 units
// across 58 works on Genesis and 817 on I Kings — the door did not mention it,
// because nothing was going to notice that it should. A door somebody
// maintains by hand is a door that is out of date the moment it is not
// maintained, and nobody can tell by looking.
//
// So it reads the zones and says what is in them. Add a book and it appears.
// Add a commentary and it appears under its book with its own count.
//
// Two rules this page keeps, and keeps by construction rather than by memory:
//
//   1. It prints no Hebrew it cannot stand behind. A book's own title is
//      corpus text; it appears here exactly as its zone carries it — the
//      ledger's word — with the store's licensed reading beside it under
//      "commonly force read as", the same two-row frame as the masthead
//      inside. The title is a doorway: pressing it opens the book, where the
//      same word opens its full record. A work whose ledger has not named a
//      title shows the open slot instead, in the masthead's own words. No
//      other Hebrew may appear, and the guard below holds the page to that.
//   2. Every number names its grain and its pinned source. Physical and
//      named-shelf C0 counts come from the sealed physical handoff; the
//      rendered count is recomputed from the COMPspan records actually
//      carried by the built zones. Those grains are never made to impersonate one
//      another.
//
//   --zones  directory of built zones        (default data/zones)
//   --out    directory to write the door into (default deploy-root)
//   --physical-handoff exact compact physical count handoff
//   --count-bindings    exact atlas/overlay/hash binding record
//
// Run: node tools/build-front-door-v1.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { senseSplit as readingSplit } from "./sense-split-v1.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", "data/zones");
const OUT = arg("out", "deploy-root");
const PLAN = arg("plan", "build/build-plan-v1.json");
const GATE = arg("serve-gate", "data/serve-gate-receipt-v1.json");

// refusals-gate-rule-v1 · THE DOOR SERVES WHAT THE GATE PASSED, NOT WHAT THE
// SHELF HOLDS.
//
// Since 2026-09-06 the gate is the frame's own refusals (tools/check-c0-
// refusals-v1.mjs): a book is served when no line of the C0 letter refuses a
// position of it as built, AND its count is stamped beside the witnesses on
// its own page — the counted works. The count itself is not a gate (owner,
// 2026-09-05: "this is our stamp of proof, not a gate anymore"); a book
// whose count differs from a witness is served with the difference shown.
// The paragraphs below are the count gate's, kept as the record of why a
// door consults something written by somebody else.
//
// For a year the shelf was the authority: a zone existed, so a book was
// served, and the only question was whether the build had run. That is a door
// that reports on itself. It cannot tell a book that is right from a book
// that is merely finished, because nothing it consults was written by anybody
// else.
//
// The masorah finalis was. It is the one claim in the corpus a machine can
// test, and the count gate tests it. A book on that receipt is a book whose
// own arithmetic equals the arithmetic the scribes published for it. A book
// absent from it is not a book we have shown ourselves able to count — which
// is not the same as a book we know to be wrong, and is the same reason it
// may not be served either way.
//
// No receipt is a refusal, never a pass. A door that serves everything
// because the gate did not run is the failure this replaces.
const gateReceipt = (() => {
  if (!existsSync(GATE)) throw new Error(`no serve-gate receipt at ${GATE} — refusing to write a door that serves ungated books; run tools/check-c0-refusals-v1.mjs --write`);
  return JSON.parse(readFileSync(GATE, "utf8"));
})();
const GATE_PASSED = new Set(gateReceipt.served || []);
const GATE_SHA = gateReceipt.served_sha256 || {};
const gated = (slug) => GATE_PASSED.has(slug);
// the receipt names the bytes it judged; a zone rebuilt since the gate ran
// is not the zone the gate served, and the door refuses rather than serve it
// on an old verdict
const assertJudgedBytes = (slug, bytes) => {
  const judged = GATE_SHA[slug];
  if (judged && judged !== sha256(bytes)) throw new Error(`${slug}: the zone on the shelf is not the bytes the gate judged (${judged.slice(0, 12)}… judged, ${sha256(bytes).slice(0, 12)}… on disk); run tools/check-c0-refusals-v1.mjs --write`);
};
// The shelf's zones, after the gate. Everywhere the door asks what it may
// serve, it asks here — one listing, so a book cannot be counted in a tally
// it is withheld from, or given a page the shelf never lists.
const shelfZoneFiles = () => readdirSync(ZONES)
  .filter((x) => x.endsWith(".bin") && !x.startsWith("fixture-") && !x.endsWith(".commentary.bin"))
  .filter((x) => gated(x.replace(/\.bin$/, "")))
  .sort();

const read = (f) => JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));
const has = (f) => existsSync(join(ZONES, f));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n = (x) => Number(x).toLocaleString("en-US");

// O · the shelf says why it is short, in its own words rather than by looking
// empty. A door that serves nothing and explains nothing is indistinguishable
// from a door that is broken, and a reader deserves to know which. The numbers
// come off the gate's receipt, so this line cannot go stale while the shelf
// changes under it.
const gateNotice = (() => {
  const refusedAll = Object.entries(gateReceipt.refused || {});
  const unreadable = refusedAll.filter(([, v]) => v.hits && v.hits["zone.unreadable"]).length;
  const refused = refusedAll.length - unreadable;
  const waiting = (gateReceipt.not_yet_stamped || {}).count || 0;
  const served = (gateReceipt.served || []).length;
  if (!refused && !waiting) return "";
  // Said as a state line, not as a paragraph. This ran to a hundred words at
  // the top of the door and pushed the books below the fold on every screen —
  // the reader met an account of the gate before meeting a book. The account
  // is true and still owed, so it did not go: it rides each figure's hover,
  // and it stands in full in the gate's own receipt. What the frame does with
  // a book it cannot vouch for is still say so; it says it in fewer words.
  const chip = (v, label, why) => `<span class="gc" title="${why}">${n(v)} <span class="gl">${label}</span></span>`;
  const parts = [chip(served, "served", "the counted works, each with its count stamped beside the figures other men reached for it, on its own page")];
  if (refused) parts.push(chip(refused, "refused", "refused by a line of the frame's C0 letter: a position the frame will not call a word or a mark. Every line, and every book it refused, is named in the gate's receipt"));
  if (waiting) parts.push(chip(waiting, "awaiting the stamp", "refused by no line, but built before the count was stamped; each waits for the rebuild under the one pipeline that stamps it"));
  if (unreadable) parts.push(chip(unreadable, "unreadable", "could not be opened at all, and are named as such in the receipt"));
  return `  <p class="face-line gate-notice">${parts.join("")}</p>`;
})();
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const TEXT_PIN_RULE = "EXACT_GIT_BLOB_BYTES__LF_ENFORCED_BY_GITATTRIBUTES_V1";
// The engine directory's name is read from where this tool stands, never
// typed. Every path that leaves this file — the pinned inputs, the store
// base, the reader's home on each work page — derives from it, and the
// deep-equal against the bindings record below holds the derivation to the
// record. Renaming the folder is then one move and one record edit.
const ENGINE = basename(join(dirname(fileURLToPath(import.meta.url)), ".."));
// The door's own stylesheet, hoisted so the demonstrations page wears the
// same face rather than a second one drifting beside it.
const DOOR_CSS = "  /* colour-role-rule-v1 · the roles are the ledgers and the values are ours.\n     The reader paints the recorded contract — structure gold, base surface\n     purple — and the door had been wearing an invented blue-grey instead,\n     so the way in looked like a different building than the rooms. Same\n     tokens as zone.html, verbatim. */\n  :root { --bg:#0d0a14; --panel:#171021; --panel2:#120d1a; --line:#2b2039; --ink:#efe6cf;\n          --ink-strong:#f8f0da; --muted:#b2a489; --faint:#8b7f69;\n          --gold:#eac86f; --gold-dim:#a98c4b; --amber:#d9a441;\n          --sel:#82bdf4; --sel-dim:#47759c; --sel-ink:#081221;\n          --shani:#c65b42; --shesh:#ddcda9; --link:#ddcda9;\n          --chip-bg:rgba(216,199,164,.12); --chip-line:rgba(216,199,164,.3);\n          --hover-wash:rgba(224,182,79,.06); --shade:rgba(5,3,8,.55);\n          --sel-ink:#081221; --shadow-card:0 14px 40px rgba(0,0,0,.6); }\n  /* the day face — linen, warm and below paper white; same roles, valued\n     for light, chosen by the device until the reader presses the button */\n  :root[data-scheme=\"day\"] {\n    color-scheme: light;\n    --bg:#f1e9d8; --panel:#f8f2e5; --panel2:#ebe2cd; --line:#d5c8ab;\n    --ink:#2b2519; --ink-strong:#1c180f; --muted:#5f5645; --faint:#7b7058;\n    --gold:#8a6b26; --gold-dim:#b0955c; --amber:#8f6a1c;\n    --sel:#275fa6; --sel-dim:#a3bdd9; --sel-ink:#f5f9fe;\n    --shani:#9c3a26; --shesh:#6b5a35; --link:#6b5a35;\n    --chip-bg:rgba(107,90,53,.10); --chip-line:rgba(107,90,53,.32);\n    --hover-wash:rgba(138,107,38,.10); --shade:rgba(96,80,48,.35);\n    --shadow-card:0 14px 40px rgba(96,80,48,.30); }\n  * { box-sizing: border-box; }\n  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }\n  body { margin:0; min-height:100vh; background:var(--bg); color:var(--ink);\n         font:16px/1.6 Georgia,\"Times New Roman\",serif; display:flex; align-items:center;\n         justify-content:center; padding:1.4rem 1rem; overflow-x:hidden; }\n  main { width:100%; max-width:40rem; }\n  h1 { margin:0 0 .35rem; font-size:2.1rem; letter-spacing:.02em; color:var(--gold); }\n  p.sub { margin:0 0 .4rem; color:var(--muted); font-size:.9rem; }\n  /* The face speaks plainly; the audited panel stands whole behind one quiet\n     fold, its grains and receipts byte-identical for the count guard. What a\n     reader meets first is what they can read, not the machine room. */\n  .face-line { margin:.8rem 0 .5rem; color:var(--muted); font-size:.9rem; }\n  /* The gate says the shelf's state as figures, not as a paragraph. Each\n     carries its full sentence in the hover, and the receipt carries all of\n     it; the door prints the number and the word. */\n  .gate-notice { display:flex; flex-wrap:wrap; gap:.15rem .9rem; align-items:baseline; margin:.5rem 0 .7rem; }\n  .gate-notice .gc { font-variant-numeric:tabular-nums; color:var(--ink); white-space:nowrap;\n    font-family:ui-monospace,Menlo,Consolas,monospace; font-size:.86rem; cursor:help; }\n  .gate-notice .gl { font-family:Georgia,\"Times New Roman\",serif; font-variant:small-caps;\n    letter-spacing:.08em; color:var(--faint); font-size:.76rem; margin-inline-start:.15rem; }\n  /* There was a block here that lifted the readable works to the top of the\n     page in a shape of their own. It was a proof-of-concept affordance: with\n     two books live, the door had to point somewhere. It is gone. The door\n     lists what the corpus holds, in one order, by one rule, and a work that\n     can be read is reached the same way as any other — through its family, or\n     by typing its name. Nothing is promoted by hand. */\n  .counts-fold { margin:.4rem 0 1.1rem; }\n  .counts-fold > summary { cursor:pointer; color:var(--faint); font-size:.78rem;\n    letter-spacing:.04em; list-style:none; }\n  .counts-fold > summary::-webkit-details-marker { display:none; }\n  .counts-fold > summary::before { content:\"▸\u2002\"; }\n  .counts-fold[open] > summary::before { content:\"▾\u2002\"; }\n  .countboard { margin:.8rem 0 1.2rem; padding:.75rem; border:1px solid var(--line);\n                border-radius:.65rem; background:var(--panel2); }\n  .countgrid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.45rem; }\n  .count { margin:0; padding:.45rem .5rem; border-left:2px solid var(--gold-dim); }\n  .count .num { display:block; color:var(--ink-strong); font-size:1rem; font-variant-numeric:tabular-nums; }\n  .count .grain { display:block; color:var(--muted); font-size:.7rem; line-height:1.35; }\n  .count-detail, .count-grain, .count-audit { margin:.55rem 0 0; color:var(--faint); font-size:.68rem; line-height:1.45; }\n  .count-grain { color:var(--muted); }\n  /* no anchor falls back to the browser's default purple — invisible on\n     the night linen; the door's links wear the door's own gold */\n  a { color:var(--gold-dim); }\n  a:hover { color:var(--gold); }\n  .count-audit a { color:var(--gold-dim); }\n  @media (max-width:620px) { .countgrid { grid-template-columns:1fr; } }\n  .books { display:flex; flex-direction:column; gap:.55rem; }\n  .bookcard { display:flex; flex-direction:column; align-items:flex-start; gap:.15rem;\n           border:1px solid var(--line); border-radius:.7rem; background:var(--panel);\n           padding:.7rem .9rem .6rem; }\n  .bookcard:hover { border-color:var(--gold-dim); }\n  a.book { display:flex; flex-direction:column; align-items:flex-start; gap:.15rem;\n           text-decoration:none; color:var(--ink); align-self:stretch; }\n  /* Two ways in, and the Hebrew one comes first: the title opens the word's\n     own record — readings oldest source first — because the answer this\n     project gives to an unreadable word is never the force-read below it. */\n  a.titleway { text-decoration:none; display:inline-flex; flex-direction:column; align-items:flex-start; gap:.05rem; }\n  a.titleway .g { font-size:.72rem; color:var(--muted); border-bottom:1px dotted var(--gold-dim); }\n  a.titleway:hover .g { color:var(--gold); }\n  a.titleway:hover .he { color:var(--shesh-bright, #eadbbd); }\n  /* The title is the book's own. The English beside it is not a translation of\n     it and must not be able to be read as one — it is how a reader who does not\n     read Hebrew finds and refers to the book. So each line says which of the\n     two it is before the thing itself. The labels are ours; the title is not. */\n  .bookcard .row { display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; }\n  .bookcard .lab { flex:0 0 auto; min-width:7rem; font-size:.6rem; letter-spacing:.18em;\n                text-transform:uppercase; color:var(--faint); }\n  .bookcard .en { font-size:1.05rem; font-variant:small-caps; letter-spacing:.12em; color:var(--gold-dim); }\n  .bookcard .he, a.sub-work .he { font-family:\"Frank Ruehl CLM\",\"David Libre\",\"SBL Hebrew\",Georgia,serif;\n    font-size:1.25rem; color:var(--shesh); }\n  .bookcard .he.none, a.sub-work .he.none { font-family:Georgia,serif; font-size:.85rem;\n    font-style:italic; color:var(--faint); }\n  .bookcard .chip { font-size:.62rem; letter-spacing:.06em; color:var(--muted);\n    border:1px solid var(--line); border-radius:.6rem; padding:.1rem .45rem; }\n  a.sub-work .he { font-size:1.05rem; margin-right:.5rem; }\n  .bookcard .of { margin-top:.25rem; color:var(--faint); font-size:.76rem; }\n  .bookcard .of.slots, a.sub-work .of.slots { margin-top:.2rem; font-style:italic; }\n  /* The commentary is not a third book. It arrives shut, and what is behind it\n     is one entry per book, each going to the book it belongs to — because that\n     is where a commentary is read. */\n  #find { margin:0 0 1rem; }\n  #find input { width:100%; padding:.6rem .9rem; border:1px solid var(--line); border-radius:.55rem;\n    background:var(--panel); color:var(--ink); font:inherit; font-size:.92rem; }\n  #find input::placeholder { color:var(--faint); }\n  #find input:focus { outline:none; border-color:var(--gold-dim); }\n  .workgroup { border:1px solid var(--line); border-radius:.7rem; background:var(--panel); overflow:hidden; }\n  .workgroup .bookcard { border:none; border-radius:0; background:none; }\n  a.sub-work { display:block; padding:.6rem .9rem .6rem 1.7rem; border-top:1px solid var(--line);\n    text-decoration:none; color:var(--ink); }\n  a.sub-work:hover { background:var(--hover-wash); }\n  a.sub-work .en { display:block; font-size:.98rem; color:var(--gold-dim); }\n  a.sub-work .of { display:block; margin-top:.2rem; color:var(--faint); font-size:.78rem; }\n  /* A family is the outermost frame, and its head is the same register at\n     family grain: Hebrew name (an open slot until a ledger names one), the\n     force-read below, the sums of what it holds on the fold's face. Nested\n     folds: the family folds its groups; each group folds its record lines. */\n  section.family { }\n  /* the census banner: a quiet rule between the shelf and the records —\n     the shelf is books, the census is the bridge's ledger of the rest */\n  section.census-head { margin-top: 2.2rem; padding-top: 1rem;\n    border-top: 1px solid var(--line); }\n  section.census-head .of { letter-spacing: 0.04em; }\n  /* the reader, working: one derived verse with the machinery live */\n  .demo-he .fw { font:inherit; color:inherit; background:none; border:none; padding:0; cursor:pointer;\n    font-family:\"Frank Ruehl CLM\",\"David Libre\",\"SBL Hebrew\",Georgia,serif; }\n  .demo-he .fw:hover { color:var(--gold); }\n  .demo-he .fw.inert { cursor:default; }\n  #demo { margin: 1rem 0 1.4rem; padding: .9rem 1rem 1rem; border: 1px solid var(--line);\n    border-radius: .6rem; background: var(--panel); }\n  #demo .demo-lab { margin: 0 0 .55rem; font-size: .7rem; letter-spacing: .12em;\n    text-transform: uppercase; color: var(--gold); }\n  #demo .d-verse { margin: 0; font-size: 1.35rem; line-height: 1.5; }\n  #demo .dw { display: inline-block; margin: 0 .18rem .4rem; text-align: center; vertical-align: top; }\n  #demo .dw .g { display: block; font-size: .6rem; line-height: 1.35; color: var(--muted);\n    max-width: 9em; direction: ltr; }\n  #demo .of { margin: .45rem 0 0; font-size: .78rem; color: var(--faint); }\n  /* The demonstrations. Deliberately unlike a served card: a dashed rule and\n     a plain warning, because the one thing this block must never do is pass\n     for text the chain carried. */\n  #poc { margin: 0 0 1.5rem; padding: .9rem 1rem 1rem; border: 1px dashed var(--line); border-radius: 4px; }\n  #poc .pc-warn { margin: 0 0 1rem; font-size: .8rem; color: var(--faint); line-height: 1.5; }\n  #poc .pc { margin: 0 0 1.1rem; padding: 0 0 1rem; border-bottom: 1px solid var(--line); }\n  #poc .pc:last-child { border-bottom: 0; padding-bottom: 0; margin-bottom: 0; }\n  #poc .pc-head { margin: 0; display: flex; gap: .5rem; align-items: baseline; flex-wrap: wrap; }\n  #poc .pc-kind { font-variant: small-caps; letter-spacing: .1em; font-size: .82rem; }\n  #poc .pc-letter { font-size: .7rem; border: 1px solid var(--line); border-radius: 3px; padding: 0 .3rem; color: var(--faint); }\n  #poc .pc-at { font-size: .74rem; color: var(--faint); }\n  #poc .pc-title { margin: .1rem 0 .5rem; font-size: .92rem; }\n  #poc .pc-verse { margin: .5rem 0 .2rem; font-size: 1.15rem; line-height: 2.1; }\n  #poc .pc-site { border-bottom: 2px solid var(--gold-dim); padding-bottom: .1rem; }\n  #poc .pc-verse-en { margin: 0 0 .1rem; font-size: .8rem; color: var(--faint); line-height: 1.5; }\n  #poc .pc-ref { margin: 0 0 .6rem; font-size: .72rem; color: var(--faint); }\n  #poc .pc-law { margin: 0 0 1.1rem; font-size: .78rem; color: var(--gold-dim); }\n  #poc .pc-mode { font-size: .62rem; letter-spacing: .1em; border: 1px solid var(--line); border-radius: 3px; padding: 0 .3rem; color: var(--faint); }\n  #poc .pc-under { border-bottom: 2px solid var(--gold); padding-bottom: .12rem; }\n  #poc .pc-btns { display: flex; gap: .4rem; flex-wrap: wrap; margin: .5rem 0 .4rem; }\n  #poc .pc-pick { font: inherit; font-size: .76rem; padding: .2rem .55rem; border-radius: 3px;\n    border: 1px solid var(--line); background: none; color: var(--muted); cursor: pointer; }\n  #poc .pc-pick[aria-pressed=\"true\"] { border-color: var(--gold-dim); color: var(--gold); }\n  #poc .pc-delim { margin-inline-start: .3rem; color: var(--faint); }\n  /* the transmitted-form pill when the record writes it in Latin: it is a\n     term, not a word of the text, so it wears the spacing the row labels do. */\n  #poc .pc-term { letter-spacing: .07em; }\n  #poc .pc-belongs { margin: .1rem 0 .35rem; font-size: .74rem; color: var(--faint); }\n  #poc .pc-cells { margin: .2rem 0; display: flex; gap: .45rem; align-items: baseline; flex-wrap: wrap; }\n  #poc .pc-other { margin: .4rem 0 0; padding-top: .35rem; border-top: 1px dotted var(--line);\n    display: flex; gap: .45rem; align-items: baseline; flex-wrap: wrap; opacity: .78; }\n  #poc .pc-otherlab { font-size: .7rem; color: var(--faint); margin-inline-end: .2rem; }\n  #poc .pc-incard { margin: .4rem 0 .2rem; font-size: .76rem; color: var(--faint); line-height: 1.5; }\n  #poc .pc-nested { margin: .5rem 0; padding: .5rem .7rem; border-inline-start: 2px solid var(--line); }\n  #poc .pc-nestlab { margin: 0 0 .25rem; font-size: .7rem; letter-spacing: .08em; color: var(--faint); }\n  #poc .pc-arrow { color: var(--faint); }\n  /* display:flex beats the hidden attribute, so both division rows drew at\n     once. hidden has to win where it is set. */\n  .pc-hudwrap .pc-divcells[hidden], .pc-hudwrap .pc-hudpane[hidden] { display: none; }\n  .pc-hudwrap .pc-divcells { margin: .3rem 0 0; display: flex; gap: .4rem; align-items: baseline; flex-wrap: wrap; }\n  .pc-hudwrap .s-pills[dir=\"rtl\"], .pc-hudwrap .pc-divcells[dir=\"rtl\"], #poc .pc-cells[dir=\"rtl\"], #poc .pc-other[dir=\"rtl\"] { direction: rtl; }\n  .pc-hudwrap .pc-div { font: inherit; font-size: .82rem; }\n  /* THE READER'S OWN CARD STYLES, lifted from zone.html verbatim so the\n     demonstration wears the card rather than a drawing of it. The one rule\n     changed is the positioning: in the reader the card floats over the page,\n     here it stands inside the demonstration it belongs to. */\n/* One register at every head: the same labelled two-row frame the masthead\n     uses, sized down to chapter grain. The label column, the quiet slot and\n     the force-read row match the masthead's forms so a reader learns the\n     frame once. */\n  /* The frame is the page's voice, not the corpus's text: labels, registers,\n     locators, and absence sentences never ride along in a copy. The same law\n     that keeps a reading out of a copied Hebrew verse keeps \"commonly force\n     read as\" out of a drag that crosses a section head — the browser already\n     treats unselectable as not-selected, and the copy rewrite follows it.\n     The title words inside the frame stay selectable; they are text. */\n  .nh-lab, .nh-en, .nh-he.unnamed, .nh-of, .vlabel, .t-lab, .t-note, .t-sug,\n  .sug-fold, .en-t, header.top .lic-chip, .vnum, .toc-note, #meta, .byline { user-select: none; -webkit-user-select: none; }\n.c-inline .lab .lic-chip { text-transform: none; letter-spacing: 0.02em; }\n/* The HUD floats. The Hebrew never moves — law of the house. */\n  /* A card that always carries a whole record needs room for one; 55vh put\n     the source and its license below the fold on a phone. */\n  /* overflow-y: auto, not hidden. Every band on this card has a floor, and on a\n     window short enough that the floors themselves do not fit, hidden would\n     have cut the bottom off — which is the source line, the license, the one\n     thing here that is not the reader's to lose. Scrolling puts it below the\n     fold; hiding loses it. At any ordinary height nothing scrolls, because\n     nothing has to. */\n  .pc-hudwrap { position: static;  max-width: 23rem; width: min(23rem, 92vw); max-height: min(84vh, 50rem);\n    display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden;\n    background: var(--panel); border: 1px solid #2c4a63; border-radius: 0.7rem;\n    padding: 0.85rem 1.05rem; box-shadow: var(--shadow-card); }\n/* what scrolls, and what does not */\n  /* The card is a stack of bands, and each keeps its own share.\n     One region that scrolled as a whole meant whichever band came first could\n     spend the entire card: eight divisions took three rows of pills, the block\n     row took a fourth, and every selectable reading was below the fold on a\n     card that had just opened. A reader who cannot see one thing to press has\n     been handed a card that does nothing.\n     So each band is bounded and scrolls inside itself, and the readings — the\n     thing the reader came to press — take what is left and never less than two\n     rows. Nothing is dropped to achieve it: every division, every block and\n     every reading is in its band, whole and reachable. */\n  /* The rows region shrinks; what it must never do is shrink below the floors\n     of the bands inside it, because a band that overflows here is clipped at\n     this edge and its pills end up behind the record — present, on screen, and\n     dead to a finger. It is held off that by arithmetic rather than by a\n     keyword: the bands beside the readings are capped at a fixed height, the\n     record is capped at a fraction of the window, and the readings' floor is a\n     single row — so what is left for the readings is never less than the row\n     they are owed. (min-content is the wrong keyword here: a wrapping row's\n     min-content height is its height at its narrowest, which for two hundred\n     pills is enormous, and the card scrolled at every size.) */\n  .pc-hudwrap .rows { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column;\n    overflow: hidden; }\n/* overflow: hidden on the band itself, so a band can never paint outside its\n     own share. Without it a pill box whose floor was taller than the band's\n     rendered straight over the record below and the reader pressed the record\n     instead of the reading — the pill was there, on screen, and dead. */\n  .pc-hudwrap .band { display: flex; flex-direction: column; min-height: 0; overflow: hidden; }\n.pc-hudwrap .band > .r-label { flex: 0 0 auto; }\n/* overflow-x hidden as well as overflow-y auto: setting one axis to auto makes\n     the other auto too, and a horizontal scrollbar nobody asked for took nine\n     pixels off the height — so a box given exactly three rows had room to show\n     two and a sliver, and the sliver was a pill cut in half. */\n  .pc-hudwrap .band > .s-pills, .pc-hudwrap .band > .r-pills { overflow-y: auto; overflow-x: hidden; min-height: 0; }\n/* The structural bands do not shrink. Letting them was the same mistake in a\n     new place: a band whose height is decided by what its siblings weigh gets\n     squeezed to nothing by the one carrying two hundred readings, and a reader\n     could not press a division or a block at all. Their size is decided here\n     and nowhere else — a row and a half of pills, then they scroll. */\n  /* The floor goes on the box that holds the pressable things, not on the band\n     around it: a band held at a minimum whose pill box was still free to shrink\n     gave a row of half-cut pills and nothing to press. One whole row always\n     stands, a row and a half is the most either takes, and the rest scrolls. */\n  /* Every band takes exactly what it is given — no growing into slack, no\n     shrinking to make room. The heights are handed out above, in whole rows,\n     and a band that could still shrink afterwards undid that: a box given\n     three rows sat in a band nine pixels shorter and cut the third one in\n     half. */\n  .pc-hudwrap .b-cut, .pc-hudwrap .b-cell, .pc-hudwrap .b-read { flex: 0 0 auto; min-height: 0; }\n/* And the record yields before any of them does. It has a floor of its own —\n     the source line plus a line of the definition — so yielding never costs the\n     license, which is the one thing on this card that is not the reader's to\n     lose. Below that floor the provenance goes; the record does not. */\n  .pc-hudwrap .prov { flex: 0 1 auto; overflow: hidden; }\n/* The D is the foundational record and it is always on the card. How much of\n     the card it takes is not the part that is foundational.\n     The old cap was `max-height: 58%`, and it never bound anything: a\n     percentage height resolves against a container with a definite height, and\n     this card has only a maximum, so the cap computed to none and one long\n     record took 91% of the card — the readings, the divisions and the source\n     all pushed out by a single definition. So the bound is a length, which\n     always resolves; the record's text scrolls inside it; and the source line\n     is pinned under it rather than scrolling with it. The reader's law is that\n     a selected reading always shows one whole D with its M, and pinning the M\n     is how that holds however long the D runs. */\n  /* 0 0, not 0 1: a shrinkable D slot loses its share to whichever sibling has\n     the bigger content, and a form with two hundred readings has a rows region\n     thousands of pixels tall — it took nearly all the shrink and squeezed the\n     source line out of the bottom of a slot that was only 7% of the card. The\n     rows region is the one that scrolls, so it is the one that gives. */\n  /* No floor at all, and none is needed once the slot does not shrink: it takes\n     the smaller of what it holds and its cap, and inside it the source line is\n     the part that never gives. min-content was tried here and is a trap — a\n     block of text's min-content height is its height at its narrowest, so the\n     floor came out at 365px on a card capped at 221 and a min beats a max. The\n     same keyword had already lied once, in the rows region. */\n  /* 0 0, not 0 1. Shrink is handed out in proportion to how much content each\n     sibling has, and the rows region carries thousands of pixels of pills — so\n     when the card was short both it and the record were driven to their floors\n     together, and the record's floor cut the source line off. The rows region\n     scrolls inside itself; it is the one that can afford to give, so it gives\n     all of it. What bounds the record is its cap, not its neighbours. */\n  /* One arrangement at every height: the record and its source share one\n     scroll, and the source line sticks to the bottom of it. This used to be\n     the short-screen arrangement only, while taller screens got a flex\n     column that clipped — and a real phone's font metrics found the seam\n     between the two and lost the record entirely, foot standing on nothing.\n     The record's floor is three lines, not one: a floor of one line is\n     clipping wearing a scrollbar's clothes. */\n  .pc-hudwrap .d-slot { flex: 0 0 auto; max-height: max(32vh, 10rem); overflow-y: auto; }\n.pc-hudwrap .d-card { display: block; }\n.pc-hudwrap .d-body { min-height: 3.9rem; }\n.pc-hudwrap .d-foot { position: sticky; bottom: 0; background: var(--panel); padding-top: 0.15rem; }\n/* What is standing under the word right now. The card used to answer this\n     only by which pill was lit, and with two hundred pills in a scrolling row\n     the lit one is often not on screen — so the reader closed the card to find\n     out whether their choice held. It is the first thing under the handle and\n     it never scrolls. */\n  .pc-hudwrap .r-now { flex: 0 0 auto; margin: 0.1rem 0 0.35rem; padding-bottom: 0.35rem;\n    border-bottom: 1px solid var(--line); direction: ltr; }\n.pc-hudwrap .r-now .k { display: block; color: var(--faint); font-size: 0.68rem;\n    letter-spacing: 0.08em; text-transform: uppercase; }\n/* Bounded, like every other region on this card. One Strong's route runs to\n     four hundred and ninety-two characters, and printed whole it was most of a\n     phone — the divisions, the blocks and the record all pushed out of sight by\n     the line that was only supposed to say what had been chosen. Three lines,\n     then it scrolls. The whole of it is still on its pill and still in the\n     record underneath. */\n  .pc-hudwrap .r-now .v { display: block; color: var(--ink-strong); font-size: 0.94rem;\n    line-height: 1.3; overflow-wrap: anywhere;\n    max-height: 3.9em; overflow-y: auto; overflow-x: hidden; }\n.pc-hudwrap .r-now .v.none { color: var(--faint); font-style: italic; }\n.pc-hudwrap[hidden] { display: none; }\n/* The head is the handle. A card the reader can move is a card that stops\n     being in the way, and a card that is never re-anchored while it is open\n     stops moving on its own. It is sticky so the handle is reachable however\n     far the record below it has been scrolled. */\n  .pc-hudwrap .head { cursor: grab; touch-action: none; flex: 0 0 auto; }\n.pc-hudwrap .head:active { cursor: grabbing; }\n.pc-hudwrap.moved { box-shadow: 0 14px 40px rgba(0,0,0,.6), 0 0 0 1px var(--sel-dim); }\n.pc-hudwrap .head button { cursor: pointer; }\n.pc-hudwrap .head { display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem;\n    flex-wrap: wrap; border-bottom: 1px solid var(--line); padding-bottom: 0.4rem; margin-bottom: 0.3rem; }\n.pc-hudwrap .head .kq-role { flex: 1 1 100%; margin: 0; color: var(--muted);\n    font-size: 0.74rem; font-style: italic; direction: ltr; text-align: left; }\n.pc-hudwrap .head b { font-size: 1.55rem; color: var(--ink-strong);\n    font-family: \"Frank Ruehl CLM\", \"Frank Ruehl\", \"David Libre\", \"SBL Hebrew\", Georgia, serif; }\n.pc-hudwrap .head button { background: none; border: 0; color: var(--link); font-size: 1.15rem; cursor: pointer; }\n.pc-hudwrap p { margin: 0.45rem 0; }\n.pc-hudwrap .att { color: var(--muted); font-size: 0.78rem; }\n.pc-hudwrap .att a { color: var(--link); }\n/* R pills — one route per pill, one selected at a time (the reader's law). */\n  .pc-hudwrap .r-label { margin: 0.5rem 0 0.3rem; color: var(--faint); font-size: 0.74rem;\n    letter-spacing: 0.06em; text-transform: uppercase; }\n/* Every R is here, so this row is the one thing on the card allowed to be\n     long. It scrolls on its own rather than pushing the D and M off the end. */\n  .pc-hudwrap .r-pills { display: flex; flex-wrap: wrap; gap: 0.35rem; direction: ltr; }\n/* A pill shows its whole reading. It used to clamp at two lines, which made\n     the card claim a reading it was not showing — the code beneath says R is\n     \"never truncated away\" and the clamp was quietly making that false. A long\n     reading now takes the room it needs; the row scrolls, so the D and the M\n     below it are still one flick away, and a reading that runs to a paragraph\n     looks like one, which is information about the record, not noise. */\n  .pc-hudwrap .r-pills button { border: 1px solid var(--line); background: var(--panel2); color: var(--muted);\n    border-radius: 0.9rem; padding: 0.22rem 0.7rem; font: inherit; font-size: 0.76rem; cursor: pointer;\n    max-width: 100%; text-align: left; white-space: normal; overflow-wrap: anywhere; }\n.pc-hudwrap .r-pills button[aria-pressed=\"true\"] { background: var(--sel); border-color: var(--sel);\n    color: var(--sel-ink); font-weight: bold; }\n.pc-hudwrap .r-more { margin-top: 0.35rem; background: none; border: 0; color: var(--link);\n    font: inherit; font-size: 0.76rem; cursor: pointer; padding: 0; }\n.pc-hudwrap .r-overflow { margin-top: 0.45rem; }\n.pc-hudwrap .r-overflow select { width: 100%; font: inherit; font-size: 0.78rem; color: var(--muted);\n    background: var(--panel2); border: 1px solid var(--line); border-radius: 0.45rem;\n    padding: 0.3rem 0.5rem; cursor: pointer; }\n.pc-hudwrap .r-overflow select:hover { border-color: var(--gold-dim); }\n.pc-hudwrap .r-overflow select.on { color: var(--sel-ink); background: var(--sel); border-color: var(--sel); font-weight: bold; }\n.pc-hudwrap .d-card { margin-top: 0.55rem; border-top: 1px solid var(--line); padding-top: 0.45rem; }\n/* P — the sources that carry the same record. A corroboration is not a\n     louder kind of source, so it wears the same chip and the same weight as\n     the one above it, a size down, and reads as a list rather than a claim. */\n  .pc-hudwrap .d-also { margin: 0.3rem 0 0; padding-top: 0.3rem; border-top: 1px dotted var(--line);\n    display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.3rem 0.45rem; }\n.pc-hudwrap .d-also-lab { flex: 1 0 100%; color: var(--faint); font-size: 0.66rem;\n    letter-spacing: 0.08em; text-transform: uppercase; }\n.pc-hudwrap .d-also-m { font: inherit; font-size: 0.74rem; color: var(--muted); cursor: pointer;\n    background: var(--panel2); border: 1px solid var(--line); border-radius: 0.6rem;\n    padding: 0.16rem 0.55rem; text-align: left; max-width: 100%; }\n.pc-hudwrap .d-also-m:hover { border-color: var(--sel-dim); color: var(--ink); }\n.pc-hudwrap .d-also-read { display: block; color: var(--faint); font-size: 0.68rem; }\n.pc-hudwrap .d-also-more { font: inherit; font-size: 0.72rem; color: var(--muted);\n    background: var(--panel2); border: 1px solid var(--line); border-radius: 0.5rem;\n    padding: 0.16rem 0.4rem; cursor: pointer; max-width: 100%; }\n.pc-hudwrap .d-cut { margin: 0 0 0.35rem; font-size: 0.72rem; color: var(--amber);\n    border-inline-start: 2px solid var(--amber); padding-inline-start: 0.5rem; }\n/* The D record, whole and never clipped. The sense the reader selected is\n     lit inside it, so a truncated pill still resolves to something readable. */\n  .pc-hudwrap .d-card .d-text { margin: 0.25rem 0; color: var(--muted); }\n.pc-hudwrap .d-card .d-sense.on { color: var(--ink-strong); font-weight: bold; }\n.pc-hudwrap .d-card .d-sep { color: var(--faint); }\n.pc-hudwrap .d-more { margin-top: 0.35rem; background: none; border: 0; border-bottom: 1px dotted var(--gold-dim);\n    color: var(--muted); font: inherit; font-size: 0.72rem; cursor: pointer; padding: 0 0 0.05rem; text-align: left; }\n.pc-hudwrap .d-more:hover { color: var(--gold); }\n.pc-hudwrap .d-more[aria-expanded=\"true\"] { color: var(--gold); }\n.pc-hudwrap .d-drawer { margin-top: 0.3rem; padding-inline-start: 0.6rem; border-inline-start: 1px solid var(--line); }\n.pc-hudwrap .d-drawer[hidden] { display: none; }\n/* Structure pills — how the form divides, and which block of it is open.\n     Quieter than a reading pill on purpose: the reading is the loud thing on\n     this card, and the structure is how you got to it. */\n  .pc-hudwrap .s-pills { display: flex; flex-wrap: wrap; gap: 0.32rem; direction: ltr; }\n/* the blocks of one division lay out in the word's own direction, so the\n     row reads as the form does and the word visibly reassembles */\n  .pc-hudwrap .s-pills[dir=\"rtl\"] { direction: rtl; }\n.pc-hudwrap .s-pills button { border: 1px solid var(--line); background: var(--panel2); color: var(--muted);\n    border-radius: 0.4rem; padding: 0.18rem 0.6rem; font: inherit; font-size: 0.9rem; cursor: pointer;\n    max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\n    font-family: \"Frank Ruehl CLM\", \"Frank Ruehl\", \"David Libre\", \"SBL Hebrew\", Georgia, serif; }\n.pc-hudwrap .s-pills button:hover { border-color: var(--gold-dim); color: var(--shesh); }\n.pc-hudwrap .s-pills button[aria-pressed=\"true\"] { border-color: var(--shesh); color: var(--ink-strong);\n    background: var(--wash); }\n.pc-hudwrap .s-pills button .none { font: 0.62rem/1 Georgia, serif; color: var(--faint); margin-inline-start: 0.35rem; }\n.pc-hudwrap .b-q { flex: 0 0 auto; min-height: 0; }\n.pc-hudwrap .b-q .q-role { font: 0.6rem/1 Georgia, serif; letter-spacing: 0.06em;\n    text-transform: uppercase; color: var(--faint); margin-inline-start: 0.4rem; }\n.pc-hudwrap .b-q button[aria-pressed=\"true\"] .q-role { color: var(--muted); }\n.pc-hudwrap .prov { color: var(--faint); font-size: 0.72rem; margin: 0.35rem 0 0; }\n.lic-chip { display: inline-block; margin-inline-start: 0.45rem; padding: 0.02rem 0.5rem;\n    border-radius: 999px; background: var(--chip-bg); border: 1px solid var(--chip-line);\n    color: var(--shesh); font-size: 0.72rem; }\n.pc-hudwrap .c-pills { display: flex; flex-wrap: wrap; gap: 0.35rem; direction: ltr; }\n.pc-hudwrap .c-pills button { border: 1px solid var(--line); background: var(--panel2); color: var(--muted);\n    border-radius: 999px; padding: 0.22rem 0.7rem; font: inherit; font-size: 0.76rem; cursor: pointer;\n    max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.pc-hudwrap .c-pills button[aria-pressed=\"true\"] { background: var(--sel); border-color: var(--sel);\n    color: var(--sel-ink); font-weight: bold; }\n.pc-hudwrap .c-card { margin-top: 0.55rem; border-top: 1px solid var(--line); padding-top: 0.45rem; }\n.pc-hudwrap .c-card .c-he { margin: 0.3rem 0; font-size: 1.05rem; line-height: 1.9; color: var(--ink-strong);\n    font-family: \"Frank Ruehl CLM\", \"Frank Ruehl\", \"David Libre\", \"SBL Hebrew\", Georgia, serif; }\n.pc-hudwrap .c-note { color: var(--faint); font-size: 0.72rem; margin: 0.2rem 0 0; }\n/* A commentary served from the chain is text, not decoration: its own words\n     carry their own routes, so they are word blocks like any others. */\n  .pc-hudwrap .c-he .wb { margin: 0 0.14rem 0.5rem; }\n.pc-hudwrap .c-he .w { font-size: 1.05rem; }\n.pc-hudwrap .c-he .g { font-size: 0.6rem; max-width: 8em; }\n.pc-hudwrap .c-back { background: none; border: 0; color: var(--link); font: inherit; font-size: 0.74rem;\n    cursor: pointer; padding: 0 0 0.25rem; letter-spacing: 0.04em; }\n.pc-hudwrap .c-back:hover { color: var(--gold); }\n.pc-hudwrap { max-height: 94vh; }\n.pc-hudwrap .prov { display: none; }\n.pc-hudwrap .r-now { margin: 0 0 0.2rem; padding-bottom: 0.2rem; }\n.pc-hudwrap .d-slot { max-height: max(26vh, 9rem); }\n.pc-hudwrap .r-label { margin: 0.15rem 0 0.1rem; font-size: 0.66rem; }\n.pc-hudwrap .head b { font-size: 1.15rem; }\n.pc-hudwrap .head { padding-bottom: 0.2rem; margin-bottom: 0.15rem; }\n.pc-hudwrap .d-slot { max-height: max(27vh, 8.75rem); }\n.pc-hudwrap .s-pills button, .pc-hudwrap .r-pills button { padding-top: 0.08rem; padding-bottom: 0.08rem; }\n.pc-hudwrap { max-width: 34rem; width: min(34rem, 92vw); }\n/* The record, whole, on request. The capped card is the resting state —\n     nothing rests open — but the record is entitled to say what it says, and\n     on a short screen the only honest way to read a long D is to let it\n     stand at its full height while it is wanted. The control sits in the\n     foot beside the M, where the record's own furniture lives. */\n  .pc-hudwrap .d-slot.whole { max-height: min(72vh, 36rem); overflow-y: auto; }\n.pc-hudwrap .d-slot.whole .d-body { max-height: none; overflow-y: visible; }\n.pc-hudwrap .d-grow { margin-left: auto; border: 1px solid var(--line); background: var(--panel2);\n    color: var(--muted); border-radius: 999px; font: inherit; font-size: 0.72rem;\n    padding: 0.02rem 0.55rem; cursor: pointer; white-space: nowrap; }\n.pc-hudwrap .d-foot { display: flex; align-items: baseline; gap: 0.4rem; flex-wrap: wrap; }\n.pc-hudwrap { box-shadow: var(--shadow-hud); }\n.pc-hudwrap .r-pills button[aria-pressed=\"true\"], .pc-hudwrap .s-pills button[aria-pressed=\"true\"] {\n    box-shadow: 0 0 0 1px var(--sel-dim); }\n  /* The reader's card is width: min(23rem, 92vw) because it FLOATS over the\n     page and answers to the window. Standing inside a column it has to answer\n     to the column instead, or it runs past the right edge and takes the close\n     button and the source line with it. */\n  .pc-hudwrap { margin: .5rem 0; width: 100%; max-width: 100%; }\n  .pc-hudwrap .head { display: flex; justify-content: space-between; align-items: baseline; gap: .5rem; }\n  .pc-hudwrap .card-key { margin: 0 0 .4rem; }\n  .pc-hudwrap .head b { font-size: 1.2rem; }\n  .pc-hudwrap .pc-x { font: inherit; background: none; border: 0; color: var(--faint); cursor: pointer; }\n  .pc-hudwrap .pc-d { margin: .2rem 0; font-size: .9rem; }\n  .pc-hudwrap .pc-noprov { font-style: italic; color: var(--faint); font-size: .68rem; }\n  #poc .pc-open { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }\n  #poc .pc-open:hover { color: var(--gold); }\n  #poc .pc-sitewords { border-bottom: 0; padding-bottom: 0; }\n  #poc .pc-word { border-bottom: 2px solid var(--gold-dim); padding-bottom: .1rem; }\n  #poc .pc-word + .pc-word { border-inline-start: 1px solid var(--gold); }\n  #poc .pc-word:hover { border-bottom-color: var(--gold); }\n  #poc .pc-carried { margin: .15rem 0; font-size: .72rem; color: var(--muted); line-height: 1.5; overflow-wrap: anywhere; }\n  #poc .pc-credit { color: var(--faint); }\n  #poc .pc-credit a { color: var(--link); }\n  #poc .pc-press { margin: 0 0 .25rem; font-size: .72rem; color: var(--gold-dim); }\n  .rd { border-top: 1px solid var(--line); padding: 1rem 0 .8rem; }\n  .rd-head { margin: 0 0 .35rem; display: flex; gap: .5rem; align-items: baseline; flex-wrap: wrap; }\n  .rd-n { font-size: .7rem; color: var(--faint); border: 1px solid var(--line); border-radius: 999px; padding: 0 .4rem; }\n  .rd-kind { font-variant: small-caps; letter-spacing: .1em; font-size: .95rem; color: var(--ink-strong); }\n  .rd-letter { font-size: .7rem; border: 1px solid var(--line); border-radius: 3px; padding: 0 .3rem; color: var(--faint); }\n  .rd-tier { font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; border-radius: 3px; padding: 0 .35rem; }\n  .rd-carried { color: var(--shesh); border: 1px solid var(--chip-line); background: var(--chip-bg); }\n  .rd-typed { color: var(--faint); border: 1px dashed var(--line); }\n  .rd-part-typed { color: var(--amber); border: 1px dashed var(--gold-dim); background: var(--hover-wash); }\n  .rd-law { margin: .1rem 0; font-size: .8rem; color: var(--gold-dim); }\n  .rd-plain { margin: .3rem 0; font-size: .88rem; line-height: 1.6; }\n  .rd-src { margin: .3rem 0; font-size: .74rem; color: var(--faint); line-height: 1.55; }\n  .rd-open { margin: .45rem 0 0; font-size: .82rem; }\n  #poc .pc-dm { align-items: baseline; }\n  #poc .pc-m { font-size: .64rem; border: 1px solid var(--chip-line); border-radius: .5rem;\n    padding: .02rem .35rem; color: var(--muted); }\n  #poc .pc-m.pc-empty { border-style: dashed; color: var(--faint); }\n  #poc .pc-pill { border: 1px solid var(--line); border-radius: .4rem; padding: .05rem .4rem; }\n  #poc .pc-lrow { margin: .18rem 0; display: flex; gap: .55rem; align-items: baseline; }\n  #poc .pc-l { flex: 0 0 1.1rem; font-size: .72rem; color: var(--gold-dim); }\n  #poc .pc-lwhat { flex: 0 0 11rem; font-size: .68rem; color: var(--faint); }\n  #poc .pc-lval { font-size: .84rem; }\n  #poc .pc-lval.pc-empty { color: var(--faint); }\n  #poc .pc-underline-gloss { margin: -.1rem 0 .3rem; font-size: .74rem; color: var(--muted); }\n  #poc .pc-hud { margin: .5rem 0 .3rem; padding: .6rem .75rem; border: 1px solid var(--line);\n    border-radius: .5rem; background: var(--panel2); }\n  #poc .pc-hudword { margin: 0 0 .25rem; font-size: 1.2rem; }\n  #poc .pc-hudkey { margin: 0 0 .4rem; font-size: .7rem; color: var(--faint); line-height: 1.45; }\n  #poc .pc-hlab { margin: .3rem 0 .15rem; font-size: .66rem; letter-spacing: .06em; color: var(--gold-dim); }\n  #poc .pc-route { margin: .1rem 0; font-size: .86rem; }\n  #poc .pc-slot { margin: .3rem 0 0; font-size: .64rem; color: var(--faint); font-style: italic; }\n  #poc .pc-cell.pc-dim { opacity: .45; }\n  #poc .pc-row { margin: .3rem 0; display: flex; gap: .5rem; align-items: baseline; flex-wrap: wrap; }\n  #poc .pc-role { font-size: .72rem; color: var(--faint); min-width: 5.5rem; }\n  #poc .pc-he { font-size: 1.25rem; line-height: 1.9; }\n  #poc .pc-en { font-size: .8rem; color: var(--faint); }\n  #poc .pc-cell { display: inline-flex; gap: .35rem; align-items: baseline; }\n  #poc .pc-plus { color: var(--faint); }\n  #poc .pc-state { font-size: .74rem; letter-spacing: .08em; border: 1px solid var(--line); border-radius: 3px; padding: 0 .3rem; }\n  #poc .pc-says { margin: .5rem 0 .3rem; font-size: .8rem; line-height: 1.55; }\n  #poc .pc-flags { margin: .2rem 0; font-size: .72rem; color: var(--faint); }\n  #poc .pc-block { margin: .35rem 0 0; font-size: .76rem; color: var(--faint); }\n  #census-demo { margin: 0 0 1.4rem; padding: .9rem 1rem 1rem; border: 1px solid var(--line);\n    border-radius: .5rem; }\n  #census-demo .demo-lab { margin: 0 0 .55rem; font-size: .7rem; letter-spacing: .12em;\n    text-transform: uppercase; color: var(--faint); }\n  #census-demo .cd-line { margin: 0; display: flex; align-items: center; flex-wrap: wrap; row-gap: .35rem; }\n  #census-demo .cd-name { font-size: 1.05rem; font-variant: small-caps; letter-spacing: .12em;\n    color: var(--gold); text-decoration: none; }\n  #census-demo .cd-name:hover { text-decoration: underline; }\n  #census-demo .of { margin: .45rem 0 0; font-size: .78rem; color: var(--faint); }\n  details.fam > summary { list-style:none; cursor:pointer; padding:.3rem .15rem .45rem; }\n  details.fam > summary::-webkit-details-marker { display:none; }\n  details.fam > summary .row { display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; }\n  details.fam > summary .lab { flex:0 0 auto; min-width:7rem; font-size:.6rem; letter-spacing:.18em;\n    text-transform:uppercase; color:var(--faint); }\n  details.fam > summary .en { font-size:1.15rem; font-variant:small-caps; letter-spacing:.14em; color:var(--gold);\n    overflow-wrap:anywhere; min-width:0; }\n  details.fam > summary .he.none { font-family:Georgia,serif; font-size:.85rem; font-style:italic; color:var(--faint); }\n  /* the name slot's absence, said in words — same voice as the title slot's */\n  .en.none { font-family:Georgia,serif; font-size:.8rem; font-style:italic; color:var(--faint);\n    font-variant:normal; letter-spacing:normal; }\n    /* THE DOOR INVERTS THE READER, deliberately. Inside a book the Hebrew is\n     the text and the English hangs under it; on the door a reader is\n     looking for a book by the name they know, and the word records are\n     extra rather than the point. So the English leads and the Hebrew\n     stands small beside it — still the work's own name, still pressable,\n     still wearing the licence of whatever record reads it. Owner's\n     ruling, 2026-09-06. */\n  /* the hover, in the page's colours: linen or panel by the reader's face,\n     a gold-dim edge, rounded like every other card here, and narrow\n     enough to read as a sentence rather than a banner */\n  .tip { position:fixed; z-index:60; max-width:26rem; padding:.45rem .6rem;\n    background:var(--panel); color:var(--ink); border:1px solid var(--gold-dim);\n    border-radius:.5rem; box-shadow:var(--shadow-card); font-size:.76rem;\n    line-height:1.45; pointer-events:none; }\n  .tip[hidden] { display:none; }\n  details.fam > summary .row .fam-he { margin-inline-start:.6rem; }\n  details.fam > summary .row .fam-he .he { font-size:1rem; }\n  details.fam > summary .row .fam-he .g { font-size:.62rem; }\n  /* The two columns. A shelf's heading and a book's row are the same\n     shape: what a reader is looking for on the left, the work's own\n     Hebrew on the right. On a phone the columns stack, because two\n     columns across 412 pixels is two columns of nothing. */\n  .colheads { display:grid;\n    grid-template-columns:minmax(0,7rem) minmax(0,1fr) minmax(0,7rem) minmax(0,1fr); gap:0 .9rem;\n    margin:.2rem 0 .5rem; padding-bottom:.3rem; border-bottom:1px solid var(--line); }\n  .colheads .ch { font-size:.6rem; letter-spacing:.14em; text-transform:uppercase;\n    color:var(--faint); }\n  details.fam > summary .row:first-child, .atlas-row.built, .bookcard .row {\n    display:grid; grid-template-columns:minmax(0,7rem) minmax(0,1fr) minmax(0,7rem) minmax(0,1fr);\n    gap:0 .9rem; align-items:baseline; }\n  .col-en, .col-he { min-width:0; display:flex; flex-wrap:wrap; align-items:baseline;\n    gap:.1rem .5rem; }\n  /* placed, not left to source order: the Hebrew column carries right-to-left\n     text and the grid was seating it first. Naming the track is the one\n     way this cannot drift. */\n  .col-en { grid-column:1; }\n  .col-att { grid-column:2; }\n  .col-he { grid-column:3; }\n  .col-lic { grid-column:4; }\n  .col-att, .col-lic { min-width:0; display:flex; flex-wrap:wrap; align-items:baseline;\n    gap:.1rem .4rem; }\n  .atlas-row .fam-he { margin-inline-start:0; }\n  @media (max-width:640px) {\n    .colheads { display:none; }\n    details.fam > summary .row:first-child, .atlas-row.built, .bookcard .row {\n      display:flex; flex-wrap:wrap; }\n    .col-en, .col-att, .col-he, .col-lic { display:contents; }\n    .atlas-row .fam-he { margin-inline-start:.45rem; }\n  }\n    .atlas-row .fam-he .he { font-size:.92rem; color:var(--muted); }\n  .col-he .fam-he, details.fam > summary .fam-he { display:inline-flex; flex-direction:column; align-items:flex-start; gap:.05rem; }\n  .col-he .fam-he .he, details.fam > summary .fam-he .he { font-family:\"Frank Ruehl CLM\",\"David Libre\",\"SBL Hebrew\",Georgia,serif;\n    font-size:1.3rem; color:var(--shesh); }\n    /* a gloss the reader ruled, marked as theirs rather than the catalogue's\n     first answer — the same underline the book pages use for a chosen\n     reading, so one gesture reads the same everywhere on the site */\n  .g.ruled { text-decoration:underline; text-decoration-color:var(--sel-dim);\n    text-decoration-thickness:1px; text-underline-offset:.18em; }\n  .col-he .fam-he .g, details.fam > summary .fam-he .g { font-size:.7rem; color:var(--muted); }\n  /* the license rides beside every printed reading and every backed\n     force-read, in the same quiet chip the reader's card uses */\n  details.fam > summary .chip, .col-att .chip, .col-lic .chip, .fam-he .g .chip, .demo-he .g .chip, #bkcard .chip, #census-demo .chip {\n    display:inline-block; margin-inline-start:.45rem; font-size:.6rem; letter-spacing:.06em;\n    font-variant:normal; font-style:normal; color:var(--muted);\n    border:1px solid var(--line); border-radius:.6rem; padding:.06rem .45rem; white-space:nowrap;\n    /* an attestor's full descriptor is a sentence; the chip shows its head\n       and carries the whole of it on hover — a chip that printed the whole\n       descriptor pushed the door sideways off a phone */\n    max-width:11em; overflow:hidden; text-overflow:ellipsis; vertical-align:bottom; }\n  details.fam > summary .of[title] { cursor:help; }\n  #wcard .w-open { display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; margin:.1rem 0 .45rem;\n    padding-bottom:.4rem; border-bottom:1px solid var(--line); }\n  #wcard .w-open[hidden] { display:none; }\n  #wcard .w-open .lab { flex:0 0 auto; font-size:.6rem; letter-spacing:.18em; text-transform:uppercase; color:var(--faint); }\n  #wcard .w-open .wo-link { font-size:.92rem; font-variant:small-caps; letter-spacing:.1em; color:var(--gold); }\n  .fam-he .fw { font:inherit; color:inherit; background:none; border:none; padding:0; cursor:pointer; }\n  .fam-he .fw:hover { color:var(--gold); }\n  .fam-he .fw.inert { cursor:default; }\n  /* The word's own record, on this page — and it is the reader's card, not a\n     new one. The door had grown its own list-shaped thing for the same job the\n     HUD already does, which made the way in look like a different building\n     than the rooms for the second time. Every rule below is zone.html's, with\n     the same tokens: the head is the word, the reading stands under its own\n     label, the routes are pills with one lit, and the record beneath carries\n     the source and the license that never scroll away. */\n  #wcard { position:fixed; z-index:70; max-width:23rem; width:min(23rem,92vw); max-height:min(84vh,50rem);\n    left:50%; transform:translateX(-50%); bottom:1rem;\n    display:flex; flex-direction:column; overflow-y:auto; overflow-x:hidden;\n    background:var(--panel); border:1px solid #2c4a63; border-radius:.7rem;\n    padding:.85rem 1.05rem; box-shadow:var(--shadow-card); }\n  #wcard[hidden] { display:none; }\n  #wcard .head { display:flex; justify-content:space-between; align-items:baseline; gap:.6rem;\n    border-bottom:1px solid var(--line); padding-bottom:.4rem; margin-bottom:.3rem; flex:0 0 auto; }\n  #wcard .head b { font-size:1.55rem; color:var(--ink-strong);\n    font-family:\"Frank Ruehl CLM\",\"Frank Ruehl\",\"David Libre\",\"SBL Hebrew\",Georgia,serif; }\n  #wcard .head button { background:none; border:0; color:var(--link); font-size:1.15rem; cursor:pointer; }\n  #wcard p { margin:.45rem 0; }\n  #wcard .r-now { flex:0 0 auto; margin:.1rem 0 .35rem; padding-bottom:.35rem;\n    border-bottom:1px solid var(--line); direction:ltr; }\n  #wcard .r-now .k { display:block; color:var(--faint); font-size:.68rem;\n    letter-spacing:.08em; text-transform:uppercase; }\n  #wcard .r-now .v { display:block; color:var(--ink-strong); font-size:.94rem; line-height:1.3;\n    overflow-wrap:anywhere; max-height:3.9em; overflow-y:auto; overflow-x:hidden; }\n  #wcard .r-now .v.none { color:var(--faint); font-style:italic; }\n  #wcard .r-label { margin:.5rem 0 .3rem; color:var(--faint); font-size:.74rem;\n    letter-spacing:.06em; text-transform:uppercase; }\n  #wcard .r-pills { display:flex; flex-wrap:wrap; gap:.35rem; direction:ltr;\n    overflow-y:auto; overflow-x:hidden; min-height:0; max-height:34vh; }\n  #wcard .r-pills button { border:1px solid var(--line); background:var(--panel2); color:var(--muted);\n    border-radius:.9rem; padding:.22rem .7rem; font:inherit; font-size:.76rem; cursor:pointer;\n    max-width:100%; text-align:left; white-space:normal; overflow-wrap:anywhere; }\n  #wcard .r-pills button[aria-pressed=\"true\"] { background:var(--sel); border-color:var(--sel);\n    color:var(--sel-ink); font-weight:bold; }\n  #wcard .d-card { margin-top:.55rem; border-top:1px solid var(--line); padding-top:.45rem;\n    flex:0 0 auto; display:flex; flex-direction:column; overflow:hidden; max-height:32vh; }\n  #wcard .d-body { flex:1 1 auto; min-height:1.2rem; overflow-y:auto; color:var(--ink); font-size:.86rem; }\n  #wcard .d-foot { flex:0 0 auto; padding-top:.15rem; color:var(--muted); font-size:.78rem; }\n  #wcard .d-foot a { color:var(--link); }\n  #wcard .lic-chip { display:inline-block; margin-inline-start:.45rem; padding:.02rem .5rem;\n    border-radius:999px; background:var(--chip-bg); border:1px solid var(--chip-line);\n    color:var(--shesh); font-size:.72rem; }\n  #wcard .prov { color:var(--faint); font-size:.72rem; margin:.35rem 0 0; }\n  /* P — the sources carrying the same record as the selected reading. Same\n     rules as the reader's card: a corroboration is not a louder kind of\n     source, so it wears the same chip at a smaller weight. */\n  #wcard .d-also { margin:.3rem 0 0; padding-top:.3rem; border-top:1px dotted var(--line);\n    display:flex; flex-wrap:wrap; align-items:baseline; gap:.3rem .45rem; }\n  #wcard .d-also-lab { flex:1 0 100%; color:var(--faint); font-size:.66rem;\n    letter-spacing:.08em; text-transform:uppercase; }\n  #wcard .d-also-m { font:inherit; font-size:.74rem; color:var(--muted); cursor:pointer;\n    background:var(--panel2); border:1px solid var(--line); border-radius:.6rem;\n    padding:.16rem .55rem; text-align:left; max-width:100%; }\n  #wcard .d-also-m:hover { border-color:var(--sel-dim); color:var(--ink); }\n  #wcard .d-also-read { display:block; color:var(--faint); font-size:.68rem; }\n  #wcard .d-also-more { font:inherit; font-size:.72rem; color:var(--muted);\n    background:var(--panel2); border:1px solid var(--line); border-radius:.5rem;\n    padding:.16rem .4rem; cursor:pointer; max-width:100%; }\n  #wshade { position:fixed; inset:0; background:var(--shade); z-index:69; }\n  #wshade[hidden] { display:none; }\n  details.fam > summary .of { color:var(--faint); font-size:.74rem; font-variant:normal; letter-spacing:normal; }\n  details.fam > summary > .row:first-child::before { content:\"\\25B8\"; color:var(--gold-dim); font-size:.8rem; }\n  details.fam[open] > summary > .row:first-child::before { content:\"\\25BE\"; }\n  details.fam > summary:hover .en { color:var(--shesh); }\n  .fgroups { display:flex; flex-direction:column; gap:.55rem; }\n  .fgroups > .fold-line { display:block; margin:0; padding:.05rem .35rem; color:var(--faint); font-size:.76rem; }\n  .fgroups > .fold-line.slots { font-style:italic; font-size:.7rem; }\n  /* A work not yet built: its recorded id and its measured size, quiet and\n     unlinked — nothing links to nothing. A built work seated elsewhere links\n     to its own page and says where it reads. */\n  .atlas-row { display:flex; align-items:baseline; gap:.6rem; padding:.16rem .35rem;\n    font-size:.8rem; color:var(--faint); text-decoration:none; flex-wrap:wrap; min-width:0; }\n  .atlas-row .aw { color:var(--muted); unicode-bidi:plaintext; flex:1 1 auto; min-width:0;\n    overflow-wrap:anywhere;\n    font-family:\"Frank Ruehl CLM\",\"David Libre\",\"SBL Hebrew\",Georgia,serif; }\n  .atlas-row .au { font-size:.68rem; white-space:nowrap; }\n  .atlas-row button.aw { font:inherit; font-family:\"Frank Ruehl CLM\",\"David Libre\",\"SBL Hebrew\",Georgia,serif;\n    text-align:start; background:none; border:0; padding:0; cursor:pointer; }\n  .atlas-row button.aw:hover, .atlas-row button.aw:focus-visible { color:var(--gold); }\n  a.atlas-row.built .aw { color:var(--gold-dim); }\n  a.atlas-row.built:hover .aw { color:var(--gold); }\n  /* A built row is a book: the zone's own title words first (each opens its\n     record — the same global card as everywhere), then the name as the way\n     in, then the zone's counts. One law for the curated two and the fleet's\n     thousands alike. */\n  span.atlas-row.built { color:var(--faint); }\n  span.atlas-row.built .fam-he .he { font-family:\"Frank Ruehl CLM\",\"David Libre\",\"SBL Hebrew\",Georgia,serif;\n    font-size:.95rem; color:var(--ink); }\n  span.atlas-row.built .fam-he .fw { font:inherit; color:inherit; background:none; border:none;\n    padding:0; cursor:pointer; }\n  span.atlas-row.built .fam-he .fw:hover { color:var(--gold); }\n  span.atlas-row.built .fam-he .fw.inert { cursor:default; }\n  span.atlas-row.built a.aw { color:var(--gold-dim); text-decoration:none; }\n  span.atlas-row.built a.aw:hover { color:var(--gold); }\n  /* The book's own record, on this page — the masthead's frame at book\n     grain. What a ledger records stands as itself; what none records says\n     so; the force-read is the bridge id read plainly, and the family line\n     is the family ledger's own, its Hebrew word a way into the word's\n     record like anywhere else on the door. */\n  #bkcard { position:fixed; z-index:70; max-width:26rem; width:min(26rem,92vw); max-height:min(84vh,40rem);\n    left:50%; transform:translateX(-50%); bottom:1rem;\n    display:flex; flex-direction:column; overflow-y:auto; overflow-x:hidden;\n    background:var(--panel); border:1px solid var(--line); border-radius:.7rem;\n    padding:.85rem 1.05rem; box-shadow:var(--shadow-card); }\n  #bkcard[hidden] { display:none; }\n  #bkcard .head { display:flex; justify-content:space-between; align-items:baseline; gap:.6rem; }\n  #bkcard .head b { font-size:.9rem; color:var(--muted); font-weight:normal; overflow-wrap:anywhere; }\n  #bkcard .head button { background:none; border:0; color:var(--link); font-size:1.15rem; cursor:pointer; }\n  #bkcard .row { display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; margin:.3rem 0; }\n  #bkcard .lab { flex:0 0 auto; min-width:7rem; font-size:.6rem; letter-spacing:.18em;\n    text-transform:uppercase; color:var(--faint); }\n  #bkcard .en { font-size:1.05rem; font-variant:small-caps; letter-spacing:.12em; color:var(--gold-dim);\n    overflow-wrap:anywhere; min-width:0; }\n  #bkcard .he.none { font-family:Georgia,serif; font-size:.85rem; font-style:italic; color:var(--faint); }\n  #bkcard .slot { display:inline-flex; flex-direction:column; align-items:flex-start; gap:.1rem; }\n  #bkcard .att-line { font-size:.7rem; line-height:1.5; overflow-wrap:anywhere; }\n  #bkcard .att-line a { color:var(--link); }\n  #bkcard .att-held { color:var(--faint); font-style:italic; }\n  #bkcard .slot .fam-he { display:inline-flex; flex-direction:column; align-items:flex-start; gap:.05rem; }\n  #bkcard .slot .fam-he .he { font-family:\"Frank Ruehl CLM\",\"David Libre\",\"SBL Hebrew\",Georgia,serif;\n    font-size:1.2rem; color:var(--shesh); }\n  #bkcard .slot .fam-he .g { font-size:.7rem; color:var(--muted); }\n  #bkcard .slot .of .en { font-size:.85rem; }\n  #bkcard .of { color:var(--faint); font-size:.76rem; }\n  #bkcard .prov { color:var(--faint); font-size:.72rem; margin:.35rem 0 0; }\n  /* One quiet fold per group. Its face is the summary line built above —\n     each folded thing named with its count — so collapsed is shorter, never\n     blinder. Closed is the resting state; the search box opens it when a\n     match would otherwise be out of sight. */\n  .workgroup details.fold { border-top:1px solid var(--line); }\n  .workgroup details.fold > summary { list-style:none; cursor:pointer;\n    padding:.4rem .9rem; color:var(--faint); font-size:.72rem; font-style:italic;\n    display:flex; align-items:baseline; gap:.45rem; }\n  .workgroup details.fold > summary::-webkit-details-marker { display:none; }\n  .workgroup details.fold > summary::before { content:\"\\25B8\"; font-style:normal;\n    color:var(--gold-dim); transition:transform 140ms; }\n  .workgroup details.fold[open] > summary::before { content:\"\\25BE\"; }\n  .workgroup details.fold > summary:hover { color:var(--muted); }\n  .workgroup details.fold .fold-line { display:block; margin:0; padding:.05rem .9rem .4rem; }\n  a.sub-book { display:block; padding:.6rem .9rem .6rem 1.7rem; border-top:1px solid var(--line);\n    text-decoration:none; color:var(--ink); }\n  a.sub-book:hover { background:var(--hover-wash); }\n  a.sub-book .en { display:block; font-size:.98rem; color:var(--gold-dim); }\n  a.sub-book .of { display:block; margin-top:.2rem; color:var(--faint); font-size:.78rem; }\n  footer { margin-top:2.2rem; color:var(--faint); font-size:.78rem; }\n  footer .open-claim { margin-top:.9rem; padding-top:.7rem; border-top:1px solid var(--line); }\n  footer a { color:var(--gold-dim); }\n  /* the polish layer — same as the reader's: motion that acknowledges a\n     press, focus a keyboard can see, selection in the reader's own blue */\n  * { -webkit-tap-highlight-color: transparent; scrollbar-width: thin; scrollbar-color: var(--line) transparent; }\n  ::selection { background: var(--sel-dim); color: var(--ink-strong); }\n  *::-webkit-scrollbar { width: 8px; height: 8px; }\n  *::-webkit-scrollbar-thumb { background: var(--line); border-radius: 999px; }\n  *::-webkit-scrollbar-thumb:hover { background: var(--gold-dim); }\n  a, summary, button, input { transition: color 120ms ease, border-color 120ms ease, background-color 120ms ease; }\n  :focus-visible { outline: 2px solid var(--sel); outline-offset: 2px; border-radius: 3px; }\n  @media (prefers-reduced-motion: reduce) { a, summary, button, input { transition: none; } }\n  .face { position:fixed; top:.9rem; right:.9rem; z-index:80; border:1px solid var(--line);\n    border-radius:999px; background:var(--panel); color:var(--muted); font:inherit;\n    font-size:.72rem; padding:.12rem .7rem; cursor:pointer; }\n  .face:hover { color:var(--gold); border-color:var(--gold-dim); }\n  /* the census stands at its own address; the door wears the way there in\n     the same corner the faces live in, one step down */\n  a.alt-face { top:3.1rem; text-decoration:none; }";
// THE STAMP'S OWN RULES: the same register as the book page's strip — gold
// exact, scarlet differing, the linen of the page where nobody published a
// figure; the colour reinforces the number and the glyph, never carries it.
const STAMP_CSS = `
  :root { --wash-active: rgba(234,200,111,.16); }
  :root[data-scheme="day"] { --wash-active: rgba(138,107,38,.14); }
  .bookcard .stamp, .atlas-row .stamp { display:flex; flex-direction:column; gap:.12rem; margin:.35rem 0 0; font-size:.72rem; font-variant-numeric:tabular-nums; max-width:100%; flex-basis:100%; }
  .atlas-row.stamped { flex-wrap:wrap; }
  .bookcard .srow, .atlas-row .srow { display:flex; gap:.5rem; align-items:baseline; flex-wrap:wrap; color:var(--faint); line-height:1.35; }
  .bookcard .srow .cls, .atlas-row .srow .cls { font-size:.56rem; letter-spacing:.1em; text-transform:uppercase; color:var(--faint); min-width:6.5rem; }
  .bookcard .srow .wit, .atlas-row .srow .wit { color:var(--muted); max-width:22rem; }
  .bookcard .srow .ax, .atlas-row .srow .ax { color:var(--muted); }
  .bookcard .srow .num, .atlas-row .srow .num { font-family:ui-monospace,Menlo,Consolas,monospace; color:var(--ink); }
  .bookcard .srow .why, .atlas-row .srow .why { font-style:italic; }
  .bookcard .srow.exact .delta, .bookcard .srow.exact .glyph, .atlas-row .srow.exact .delta, .atlas-row .srow.exact .glyph { color:var(--gold); font-weight:600; }
  .bookcard .srow.differs .delta, .bookcard .srow.differs .glyph, .atlas-row .srow.differs .delta, .atlas-row .srow.differs .glyph { color:var(--shani); font-weight:600; }
  .bookcard .srow.no_witness, .atlas-row .srow.no_witness { color:var(--faint); }
  #sectstamp { margin:.6rem 0 .4rem; padding:.35rem 0 .4rem; border-top:1px solid var(--gold-dim); border-bottom:1px solid var(--gold-dim); font-size:.78rem; overflow-x:auto; }
  #sectstamp .sh { font-variant:small-caps; letter-spacing:.12em; color:var(--gold); margin:0 0 .25rem; }
  #sectstamp .sh .ours { color:var(--ink); font-variant:normal; letter-spacing:.02em; font-variant-numeric:tabular-nums; }
  #sectstamp table { border-collapse:collapse; font-variant-numeric:tabular-nums; }
  #sectstamp td { padding:.08rem .7rem .08rem 0; vertical-align:baseline; white-space:nowrap; color:var(--muted); }
  #sectstamp td.wit { white-space:normal; max-width:26rem; }
  #sectstamp td.num { text-align:right; font-family:ui-monospace,Menlo,Consolas,monospace; color:var(--ink); }
  #sectstamp .cls { font-size:.56rem; letter-spacing:.1em; text-transform:uppercase; color:var(--faint); margin-right:.4rem; }
  #sectstamp tr.exact td.delta, #sectstamp tr.exact td.glyph { color:var(--gold); font-weight:600; }
  #sectstamp tr.differs td.delta, #sectstamp tr.differs td.glyph { color:var(--shani); font-weight:600; }
  #sectstamp tr.no_witness td { color:var(--faint); }
  #sectstamp tr { animation: stamp-flash 1100ms ease-out both; }
  @keyframes stamp-flash { 0% { background: var(--wash-active, rgba(234,200,111,.16)); } 100% { background: transparent; } }
  @media (prefers-reduced-motion: reduce) { #sectstamp tr { animation: none; } }
  #sectstamp .waits { color:var(--faint); font-style:italic; margin:.25rem 0 0; }
`;
// Where the site answers, read from the site's own declaration of it rather
// than typed here. A published address used to be a string in this file, and
// on the day the site moved it became a promise nobody had kept — the README
// still sent readers to an address the work had left. CNAME is the record: it
// is what the host serves under, and it is a build input like any other.
const SITE_HOST = (() => {
  const cname = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "CNAME");
  return existsSync(cname) ? readFileSync(cname, "utf8").trim().split(/\s+/)[0] : "";
})();
const SITE_URL = SITE_HOST ? `https://${SITE_HOST}/` : "";
// What the house calls itself, in front of readers: its own address, once it
// has one of its own. Until then the working name stands. This is the only
// place either is decided, so the door, the work pages, the held addresses
// and the README cannot drift apart from one another.
const SITE_NAME = SITE_HOST || "The Tabernacle";
const TEXT_PIN_PATHS = [
  "data/corpus-atlas-v1.json",
  "data/bezelal-front-door-counts-handoff-v1.json",
  "data/front-door-three-count-bindings-v1.json",
].map((rel) => `${ENGINE}/${rel}`);
const exactLfActual = (label, bytes) => {
  if (bytes.includes(0x0d))
    throw new Error(`${label} violates ${TEXT_PIN_RULE}: CR byte present; checkout must honor text eol=lf`);
  return { bytes: bytes.length, sha256: sha256(bytes), byte_hash_rule: TEXT_PIN_RULE };
};
const readPinnedJson = (label, path, pin) => {
  const bytes = readFileSync(path);
  if (pin.byte_hash_rule !== TEXT_PIN_RULE)
    throw new Error(`${label} has unsupported byte/hash rule ${pin.byte_hash_rule || "(missing)"}`);
  const actual = exactLfActual(label, bytes);
  if (actual.bytes !== pin.bytes || actual.sha256 !== pin.sha256)
    throw new Error(`${label} is not its pin: expected ${pin.bytes} bytes ${pin.sha256}, got ${actual.bytes} bytes ${actual.sha256}`);
  return { value: JSON.parse(bytes.toString("utf8")), actual };
};
const assertPinnedBytes = (label, bytes, pin) => {
  const actual = { bytes: bytes.length, sha256: sha256(bytes) };
  if (actual.bytes !== pin.bytes || actual.sha256 !== pin.sha256)
    throw new Error(`${label} is not its pin: expected ${pin.bytes} bytes ${pin.sha256}, got ${actual.bytes} bytes ${actual.sha256}`);
  return actual;
};
const requireCount = (name, value) => {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${name} is not a non-negative safe integer`);
  return value;
};

// ---- what the zones carry ------------------------------------------------
//
// The books the door offers used to be a typed list of two, which is how the
// door and the build could disagree about what is published — the Targum was
// a published work a reader could open and the door never mentioned it as
// one. The list now comes from the same plan the build runs from, derived
// fresh so a stale build/ cannot vouch for itself, in the ledgers' own order.
// A work added by its ledger appears here without anyone editing a list.
//
// The byline is NOT among the things carried over. Each zone already carries
// its own, and an earlier build typed a trimmed copy of it into this list —
// two strings for one fact, and the copy is the one on the page. The zone's
// byline is printed whole, exactly as the zone carries it.
execFileSync("node", ["tools/plan-build-v1.mjs", "--out", PLAN, "--tsv", PLAN.replace(/\.json$/, ".tsv")], { stdio: "pipe" });
const plan = JSON.parse(readFileSync(PLAN, "utf8"));
// What each work's build stands on, and what the Y lane holds back from it —
// derived by tools/emit-work-basis-v1.mjs from the plan and the hold ledgers.
// The door prints incompleteness rather than presenting a typed-basis work
// with a sealed work's face; a door that cannot read the basis file would be
// choosing that face back, so it refuses instead.
execFileSync("node", ["tools/emit-work-basis-v1.mjs", "--plan", PLAN], { stdio: "pipe" });
// The frame is complete, or it is not a frame: every work the record names
// carries its standing — serving, held with its reason said, or awaiting
// its text — and the door says it on the work's own card. Derived fresh
// from the fleet plan (SERVE-LAW-2026-08-25.md §4).
const FLEET_PLAN = arg("fleet-plan", "build/fleet-plan-v1.json");
execFileSync("node", ["tools/emit-derived-work-ranges-v1.mjs"], { stdio: "pipe" });
execFileSync("node", ["tools/plan-fleet-v1.mjs", "--out", FLEET_PLAN], { stdio: "pipe" });
const FLEET = JSON.parse(readFileSync(FLEET_PLAN, "utf8"));
const FLEET_STATE = new Map(FLEET.works.map((w) => [w.id, w.state]));
const WB = JSON.parse(readFileSync(arg("basis", "data/work-basis-v1.json"), "utf8"));
// The same catalog the masthead asks at runtime, asked once at build time:
// does a record read this title's own form as the common name? Where one
// does, its license rides the force-read line, exactly as it does inside.
const STORE = openRouteStore(arg("store", "data/route-store"));
// A posture's name comes from the declarations record — the same record the
// reader loads as data/license-postures-v1.json — never re-derived from the
// letters of the key. A posture the record does not declare is named by its
// key, verbatim: the visible cue that a declaration is missing.
const POSTURE_NAMES = Object.fromEntries(
  Object.entries(JSON.parse(readFileSync("tools/declarations-v1.json", "utf8")).export_postures)
    .map(([key, row]) => [key, row.name])
);
const licenseName = (posture) => {
  const p = String(posture || "");
  if (!p) return "License unrecorded";
  return POSTURE_NAMES[p] || p;
};
const titleReading = (tokens, en) => {
  const key = (tokens || []).map((t) => t.k).filter(Boolean)[0];
  if (!key) return null;
  const routes = STORE.routesFor(key);
  if (!routes) return null;
  // Exact sense match only — a plain ";"-split cannot create a false exact
  // equal (a fragment cut inside brackets keeps its bracket and matches
  // nothing), so the store's own depth rule is not re-implemented here.
  const hits = routes.filter((row) => {
    const senses = String(row[1] || "").split(";").map((x) => x.trim());
    return row[1] === en || senses.includes(en);
  }).filter((row) => STORE.index.m_sources[row[3]]);
  if (!hits.length) return null;
  hits.sort((a, c) => {
    const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10);
    return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9);
  });
  const m = STORE.index.m_sources[hits[0][3]];
  return { lic: licenseName(m.licensePosture), label: m.label || "", year: m.sourceYear || "" };
};
// The M behind one printed reading: the oldest licensed route whose own text
// divides — under the store's own pack and reading rules — to that exact
// reading. A gloss printed without this beside it is a reading shown without
// its license, and no reading on the door may stand that way.
const glossSource = (key, text) => {
  if (!key || !text) return null;
  const routes = STORE.routesFor(key);
  if (!routes) return null;
  const want = String(text).toLowerCase();
  const hits = routes.filter((row) => {
    if (!STORE.index.m_sources[row[3]]) return false;
    return STORE.packSplit(row[1]).some((sense) => {
      const r = readingSplit(sense);
      return !r.damaged && r.readings.some((x) => x.toLowerCase() === want);
    });
  });
  if (!hits.length) return null;
  hits.sort((a, c) => {
    const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10);
    return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9);
  });
  const m = STORE.index.m_sources[hits[0][3]];
  return { lic: licenseName(m.licensePosture), label: m.label || "", year: m.sourceYear || "" };
};
// A zone's own licenses, read from its own per-occurrence receipt. Each
// rows-group's composite leads with its posture; the plain name comes from
// the declarations record and the whole composite rides the hover, so the
// machine register never prints. Shared, because every place that presents
// a work owes the same answer — the door's cards, the door's demonstration,
// and the reference pages that gather works under a traditional name.
const posturesOf = (z) => {
  const perOcc = String(((z.emitted_from || {}).license_receipts || {}).per_occurrence || "");
  const out = [];
  for (const m of perOcc.split(" \u2014 ")[0].matchAll(/[\d,]+ rows: ([^|]+?)(?= \| |$)/g)) {
    const full = m[1].trim();
    const name = licenseName(full.split(" \u00b7 ")[0].toLowerCase());
    if (!out.some((x) => x.name === name)) out.push({ name, full });
  }
  return out;
};
const chipHtml = (src) => src
  ? `<span class="chip" title="${esc(src.label)}${src.year ? ` · ${esc(String(src.year))}` : ""}">${esc(src.lic)}</span>`
  : "";
// A force-read in English is a claim about how to read the Hebrew, and a
// claim needs a record: the ledger's English prints only when a licensed
// record reads the form that way, with that record's license riding beside
// it. Until one does, the recorded id itself is read plainly — hyphens as
// spaces — which asserts nothing beyond the id, and the line says what it
// is waiting on.
const AWAITS_M = "its catalog entry read as plain words — a proper name will show once a source on record uses one; the entry stands on the door's pinned catalog record, fingerprinted in the counts receipt";
const plainId = (id) => String(id).split("/").pop().replace(/[-_]+/g, " ");
// The name slot never dresses a record as prose — the owner's ruling. plainId
// reads an id's separators as spaces, which is honest exactly when what is
// left is plain Latin text; the census found 2,933 bridge ids that are the
// works' own Hebrew titles with a catalog number tailed on, and hyphens read
// as spaces would have printed them in the English slot as neither a name
// nor a record. A name slot prints plainId only when the result is
// plain-letter text; anything else prints the absence, said in words, with
// the raw id riding in the title attribute where a hover still reads it.
// Records stay shown verbatim where records are shown — the atlas rows, the
// fold lines, the book card — that register never plainifies.
const NO_PLAIN_NAME = "none is recorded in plain letters";
const plainName = (id) => {
  const t = plainId(id).toLowerCase();
  return /^[a-z0-9 ]+$/.test(t) && /[a-z]/.test(t) ? t : null;
};
// The atlas: every family and every work the bridge records, built or not,
// emitted by tools/emit-corpus-atlas-v1.mjs with the bridge's sha as its
// receipt. The door refuses to run without it — a door listing only what
// happens to be built would silently shrink the library to this lane's
// output, and silent truncation reads as coverage.
const ATLAS_PATH = arg("atlas", "data/corpus-atlas-v1.json");
const PHYSICAL_HANDOFF_PATH = arg("physical-handoff", "data/bezelal-front-door-counts-handoff-v1.json");
const COUNT_BINDINGS_PATH = arg("count-bindings", "data/front-door-three-count-bindings-v1.json");
const BINDINGS_BYTES = readFileSync(COUNT_BINDINGS_PATH);
const BINDINGS_ACTUAL = exactLfActual("count bindings", BINDINGS_BYTES);
const BINDINGS = JSON.parse(BINDINGS_BYTES.toString("utf8"));
if (BINDINGS.schema !== "mishkan.bezalel.front_door_three_count_bindings.v1")
  throw new Error(`unexpected count binding schema ${BINDINGS.schema || "(missing)"}`);
if (BINDINGS.exact_text_input_policy?.rule !== TEXT_PIN_RULE ||
    BINDINGS.exact_text_input_policy?.gitattributes_path !== ".gitattributes" ||
    JSON.stringify(BINDINGS.exact_text_input_policy?.paths) !== JSON.stringify(TEXT_PIN_PATHS))
  throw new Error("count binding exact-text input policy moved or is incomplete");
const atlasPinned = readPinnedJson("logical atlas", ATLAS_PATH, BINDINGS.inputs.logical_atlas);
const handoffPinned = readPinnedJson("physical handoff", PHYSICAL_HANDOFF_PATH, BINDINGS.inputs.physical_handoff);
const ATLAS = atlasPinned.value;
const PHYSICAL = handoffPinned.value;
if (PHYSICAL.schema !== "mishkan.bezalel.front_door_three_count_handoff.v1")
  throw new Error(`unexpected physical handoff schema ${PHYSICAL.schema || "(missing)"}`);
const physicalRows = requireCount("physical_terminal_c0_rows", PHYSICAL.physical.physical_terminal_c0_rows);
const namedShelfRows = requireCount("physical_and_logically_mapped_rows", PHYSICAL.logical.physical_and_logically_mapped_rows);
const logicalPlanRows = requireCount("logical_plan_rows", PHYSICAL.logical.logical_plan_rows);
const logicalPlanNotPhysicalRows = requireCount("logical_plan_not_physical_rows", PHYSICAL.logical.logical_plan_not_physical_rows);
const physicalUnmappedRows = requireCount("physically_queryable_logical_shelf_unmapped_rows", PHYSICAL.logical.physically_queryable_logical_shelf_unmapped_rows);
if (logicalPlanRows !== namedShelfRows + logicalPlanNotPhysicalRows)
  throw new Error("logical plan partition does not close");
if (physicalRows !== namedShelfRows + physicalUnmappedRows)
  throw new Error("physical partition does not close");
if (ATLAS.totals.c0_rows !== logicalPlanRows)
  throw new Error(`logical atlas total ${ATLAS.totals.c0_rows} disagrees with pinned logical plan ${logicalPlanRows}`);
for (const [name, pin] of Object.entries({ physical_atlas: BINDINGS.inputs.physical_atlas, logical_overlay: BINDINGS.inputs.logical_overlay })) {
  if (!pin || !/^[0-9a-f]{64}$/.test(pin.sha256 || "")) throw new Error(`${name} has no exact SHA-256 pin`);
}
const GENESIS_V3 = BINDINGS.inputs.genesis_clean_successor_v3;
if (!GENESIS_V3 || GENESIS_V3.grain !== "ONE_RENDER_RECORD_PER_COMPSPAN")
  throw new Error("clean Genesis v3 binding is absent or has the wrong grain");
for (const [name, pin] of Object.entries({
  genesis_zone: GENESIS_V3.zone,
  genesis_front_door_handoff: GENESIS_V3.front_door_handoff,
  genesis_defect_provenance: GENESIS_V3.defect_provenance,
  genesis_validation: GENESIS_V3.validation,
  genesis_closed_world_seal: GENESIS_V3.closed_world_seal,
})) {
  if (!pin || !Number.isSafeInteger(pin.bytes) || pin.bytes <= 0 || !/^[0-9a-f]{64}$/.test(pin.sha256 || ""))
    throw new Error(`${name} has no exact byte/SHA-256 pin`);
}
// The family ledger: the synthesis lane's ruling over the bridge's family
// VALUES — authored on the owner's authorization, checked by
// check-family-ledger-v1, and dying the day a corpus-side family record
// lands. The door derives its sections from it; a bridge value the ledger
// does not rule surfaces verbatim in its own section, never swallowed.
const LEDGER = JSON.parse(readFileSync(arg("family-ledger", "data/family-ledger-v1.json"), "utf8"));
const BOOKS = plan.works.map((w) => ({
  slug: w.published_as, zone: `${w.published_as}.bin`,
  work_id: w.work_id, address_by_rule: w.address_by_rule, basis: w.basis,
  serve_state: w.serve_state || "SERVED",
  withheld_reason: w.withheld_reason || "",
  withheld_basis: w.withheld_basis || "",
  withheld_from: w.withheld_from || "",
  held: (WB.works[w.published_as] || {}).held_commentaries || 0,
}));
// Attachment is directional for presentation: the record's pair is
// [base, commentary], the same direction the Y schema's attachment_y_node_id
// points — from the commentary to what it stands on. A commentary work keeps
// its own page and its own address; the door seats it with its base, because
// a commentary is read where its base is read.
const commentaryOf = new Map();   // base slug -> [commentary slugs]
const seated = new Set();         // commentary slugs that sit with a base
const slugOfWork = new Map(plan.works.map((w) => [w.work_id, w.published_as]));
for (const a of plan.attachments || []) {
  const base = slugOfWork.get(a.pair[0]), comm = slugOfWork.get(a.pair[1]);
  if (!base || !comm) continue;
  if (!commentaryOf.has(base)) commentaryOf.set(base, []);
  commentaryOf.get(base).push(comm);
  seated.add(comm);
}

const books = [];
let cleanGenesisZonesSeen = 0;
let genesisPinState = { state: "ABSENT", says: "no Genesis zone on the shelf; the pin stands as recorded history" };
for (const b of BOOKS) {
  if (!has(b.zone)) continue;
  // the plan's tier is not a way around the gate: a planned work with a zone
  // on the shelf is served only when the gate serves it
  if (!gated(b.zone.replace(/\.bin$/u, ""))) continue;
  const zonePath = join(ZONES, b.zone);
  const zoneBytes = readFileSync(zonePath);
  assertJudgedBytes(b.zone.replace(/\.bin$/u, ""), zoneBytes);
  const z = JSON.parse(gunzipSync(zoneBytes).toString("utf8"));
  const sections = (z.sections || []).length;
  const words = (z.sections || []).reduce((t, s) => t + (s.words || []).length, 0);
  if (b.work_id === "tanakh/genesis") {
    cleanGenesisZonesSeen += 1;
    // THE PIN IS FOR THE PINNED BYTES. Bezalel's binding pins the clean
    // Genesis v3 zone — the sealed-chain successor — and while that zone was
    // the shelf's Genesis, the door held it to the pin byte for byte. Since
    // 2026-09-06 the shelf's Genesis is the restore-v5 build (under the
    // restore serve rule), a different artifact under a different oracle: the
    // pin then stands as recorded history, the door says so on its receipt,
    // and the restore build answers to its own checks (check-restore-serve-v1,
    // check-bookword-count-v1, the single-pass receipts).
    const onRestoreRoute = !!(((z.emitted_from || {}).walk || {}).restore_oracle);
    if (onRestoreRoute) {
      genesisPinState = { state: "SUPERSEDED", shelf_zone: { path: `${ZONES}/${b.zone}`, bytes: zoneBytes.length, sha256: sha256(zoneBytes), route: z.route },
        says: "the shelf's Genesis is the restore-v5 build under serve-from-restore-rule-v1; the pinned clean v3 bytes are not on the shelf and the pin stands as recorded history" };
    } else {
      genesisPinState = { state: "PINNED", says: "the shelf's Genesis is the pinned clean v3 zone, held to its pin byte for byte" };
      assertPinnedBytes("clean Genesis v3 zone", zoneBytes, GENESIS_V3.zone);
      const clean = z.clean_successor || {};
      const counts = GENESIS_V3.counts || {};
      const joinedRecords = (clean.presentation_join_groups || [])
        .reduce((total, group) => total + (group.canonical_successor_occurrence_ids || []).length, 0);
      // The pin must be the pin for the file being read. This compared the
      // binding's declared paths against two literals naming one work, which is
      // the same claim written twice and one of them typed here: if Bezalel ever
      // reissued the binding at a different path, the literal would refuse it
      // rather than follow it. The comparison is against what this loop actually
      // opened, which is derived from the zones directory.
      if (!String(GENESIS_V3.zone.path || "").endsWith(`/${b.zone}`) ||
          GENESIS_V3.zone.module_path !== `${ZONES}/${b.zone}`.replace(/^\.\//u, "") ||
          words !== counts.rendered_compspan_records ||
          z.counts?.words !== counts.rendered_compspan_records ||
          z.counts?.clean_compspan_successor_occurrences !== counts.canonical_compspan_records ||
          z.counts?.source_orthographic_records !== counts.folded_source_orthographic_records ||
          z.counts?.physical_c0_rows !== counts.physical_c0_rows ||
          clean.one_render_record_per_compspan !== true ||
          clean.canonical_compspan_successor_occurrences !== counts.canonical_compspan_records ||
          clean.rendered_records !== counts.rendered_compspan_records ||
          clean.source_orthographic_records !== counts.folded_source_orthographic_records ||
          clean.presentation_join_groups?.length !== counts.presentation_join_groups ||
          joinedRecords !== counts.presentation_join_records ||
          clean.raw_markup_rows !== counts.raw_markup_records ||
          clean.apparatus_rows_rendered_as_text !== counts.apparatus_records_rendered_as_text ||
          clean.mid_word_split_rows !== counts.mid_word_split_records)
        throw new Error("clean Genesis v3 zone semantics disagree with their pinned binding");
    }
  }
  // its commentary, if any zone carries some for it
  // A book can carry both grains at once, and Genesis does: some commentary is
  // placed on a word, the rest stands on the section because nothing places it
  // any closer. An earlier version of this took whichever grain it met first
  // and printed that one, which named half of what was there.
  let onWord = 0, onSection = 0, heldLicence = 0, noText = 0, byCoordinate = 0, noCloser = 0, worksCount = 0;
  const side = `${b.slug}.commentary.bin`;
  if (has(side)) {
    const c = read(join(ZONES, side));
    const seen = new Set();
    for (const unit of Object.values(c.units || {})) {
      for (const list of Object.values(unit.words || {}))
        for (const e of list) { onWord += 1; seen.add(e.family_en || e.ref); }
      for (const e of unit.section || []) {
        onSection += 1; seen.add(e.family_en || e.ref);
        if (e.held === "license") heldLicence += 1;
        else if (e.held) noText += 1;
        // The section is not one thing. For 1 Kings the chain itself puts the
        // commentary there, by coordinate; for Genesis it is where a segment
        // stands when nothing places it closer. Saying "on the section" for
        // both would flatten a proof and a shrug into one number.
        else if (e.basis === "SEALED_UNIT_COORDINATE_IDENTITY") byCoordinate += 1;
        else noCloser += 1;
      }
    }
    worksCount = (c.works && c.works.length) ? c.works.length : seen.size;
  }
  const units = onWord + onSection;
  if (!z.byline) throw new Error(`${b.zone} carries no byline — the door prints the zone's and will not invent one`);
  // The title's own gloss, by the same rule every word in the reader is
  // glossed under: the store's oldest displayable reading for the form's
  // exact key. This is the answer to the title being unreadable — not the
  // force-read, the record.
  const titleKey = (z.work_he_tokens || []).map((t) => t.k).filter(Boolean)[0] || null;
  const titleGloss = titleKey ? (STORE.glossFor(titleKey).text || "") : "";
  books.push({ ...b, en: z.work || b.slug, byline: z.byline, sections, words, stamp: z.count_stamp || null,
    zoneBytes: zoneBytes.length, zoneSha256: sha256(zoneBytes),
    he: z.work_he || "", heGloss: titleGloss, heGlossSrc: titleGloss ? glossSource(titleKey, titleGloss) : null, defOpen: !!(titleKey && titleGloss),
    heTokens: z.work_he_tokens || [],
    reading: titleReading(z.work_he_tokens, z.work || b.slug),
    units, onWord, onSection, heldLicence, noText, byCoordinate, noCloser, works: worksCount });
}
// The curated tier can lawfully be empty — the owner's ruling, 2026-08-30:
// no hand-done books at all. The refusal that matters is a shelf with no
// zones behind it, judged by the zones directory itself.
if (!books.length && !readdirSync(ZONES).some((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !f.endsWith(".commentary.bin")))
  throw new Error(`no zones found in ${ZONES} — refusing to write a door with nothing behind it`);
// Every place a book is referred to in English refers to it by the one name
// the law allows to print: the ledger's English when a licensed record backs
// it, the address read plainly when none does.
for (const b of books) b.disp = b.reading ? b.en : (plainName(b.slug) ?? b.slug);
// Genesis, when it is here, must be the exact sealed v3 bytes — that check runs
// above, inside the loop, and is untouched. What is relaxed is the requirement
// that Genesis be here at all. A door builder that cannot describe the site
// without one particular work in it cannot describe a withdrawal, and a
// withdrawal is precisely when the door most needs rebuilding: every count it
// prints was left standing at five works because this line refused to run.
if (cleanGenesisZonesSeen > 1) throw new Error(`expected at most one Genesis zone, found ${cleanGenesisZonesSeen}`);

// ---- the door ------------------------------------------------------------
// A typed-basis work and a sealed work do not wear the same face, and held
// commentary is counted where the book is offered rather than silently
// absent — but in the door's own quiet voice, never as an alarm. The frame
// is recorded as never being grounds to declare a work deficient; an open
// slot is simply named, and the line goes away when its record lands.
const incBits = (b) => {
  const bits = [];
  if (b.basis === "TYPED_AWAITING_LEDGER") bits.push("its place was entered by hand and is marked as such, until its record is issued");
  if (b.held) bits.push(`${n(b.held)} commentary slots open`);
  return bits;
};
// The card is the collapsed face, so it carries what must never fold away:
// both title rows — the book's own word first, the force-read below it — and
// the bare counts. Everything else about the group (its chain line, its open
// slots, the works seated with it, its commentary) stands behind one quiet
// fold whose summary names each thing it holds, with its count, so nothing
// is out of sight without being said.
// A book's title is words, and a word opens its own record — the same law
// the reader works by, brought onto the door. It used to be one link straight
// into the book, which made the title the only corpus word on this page a
// reader could not question: press it and you were somewhere else before you
// had read it. Now each word carries its key, and the book it titles rides on
// the word as another layer of the same card — the record first, the way in
// under it. A title of several words gives that layer to every one of them.
const titleWords = (b) => (b.heTokens || []).map((t) => t.k
  ? `<button type="button" class="fw" data-k="${esc(t.k)}" data-book="/${b.slug}" data-bookname="${esc(b.disp || b.slug)}"${b.reading
      ? ` data-bookatt="attested: ${esc(b.reading.label)}" data-bookatttitle="${esc(b.reading.label)}${b.reading.year ? ` \u00b7 ${esc(b.reading.year)}` : ""} \u2014 attests this usage; a name is an identification, not licensed expression (FRAME v2.7)"`
      : ""} title="open this word\u2019s own record, and the book it titles">${esc(t.s)}</button>`
  : `<span class="fw inert">${esc(t.s)}</span>`).join(" ");
const bookCard = (b) => `    <div class="bookcard">
      <!-- The pinned book stands in the same four columns as every row above
           it — name, who attests the name, the Hebrew, what its reading is
           released under — because it is one of those rows and not a
           different kind of thing. The owner, 2026-09-06: do genesis the
           same way. The name and its attestation stay inside the link that
           opens the book; the Hebrew stays outside it, because pressing the
           Hebrew opens a record and not a book. -->
      <span class="row">
        <a class="book col-en" href="/${b.slug}">${b.reading
          ? `<span class="en">${esc(b.en)}</span>`
          : plainName(b.slug)
            ? `<span class="en">${esc(plainName(b.slug))}</span>`
            : `<span class="en none" title="${esc(b.slug)}">${NO_PLAIN_NAME}</span>`}</a>
        <span class="col-att">${b.reading
          ? `<span class="chip" title="commonly force read as — ${esc(b.reading.label)}${b.reading.year ? ` \u00b7 ${esc(b.reading.year)}` : ""} attests this usage. A name is an identification, not licensed expression (FRAME v2.7); who says so, not who permits it.">attested: ${esc(b.reading.label)}</span>`
          : `<span class="of" title="${esc(AWAITS_M)}">awaiting a named source</span>`}</span>
        <span class="col-he">${b.he
          ? (titleWords(b)
            ? `<span class="fam-he"><span class="he" lang="he" dir="rtl">${titleWords(b)}</span>${b.heGloss ? `<span class="g">${esc(b.heGloss)}</span>` : ""}</span>`
            : `<span class="he" lang="he" dir="rtl">${esc(b.he)}</span>`)
          : `<span class="he none">no name is on record</span>`}</span>
        <span class="col-lic">${b.heGloss && b.heGlossSrc ? chipHtml(b.heGlossSrc) : ""}</span>
      </span>

    </div>`;
// THE STAMP ON THE CARD. The same rows the book's own page carries: one per
// witness, the difference with its sign, gold exact and scarlet differing;
// a measure nobody published a figure for says so in the page's own linen.
// A WITNESS NAMED IN HEBREW. The witness record carries a few names as the
// source writes them (a siman HaKtav quotes an author by). The door may print
// no Hebrew it cannot vouch for beyond the carried titles, so a Hebrew run in
// a witness's name is marked here and given in full on the book's own page,
// where the stamp stands beside the text it counts. Nothing is transliterated.
const HEB_RUN = /[\u0590-\u05FF](?:[\u0590-\u05FF\s'"]*[\u0590-\u05FF])?/gu;
const plainWitness = (w) => String(w ?? "").replace(HEB_RUN, "[a Hebrew name, given on the book's page]");
const STAMP_AX = { verses: "verses", words: "words · read", words_written: "words · written", letters: "letters · written", letters_read: "letters · read" };
const STAMP_CLS = { COUNTED_THIS_TEXT: "counted this text", THE_MASORAH: "the masorah", LATER_AUTHORITY: "later authority", TALMUD_GEONIM: "Talmud, Geonim", HELD_EDITION: "held edition", NO_WITNESS: "no witness" };
const stampDelta = (d) => (d == null ? "—" : `${d < 0 ? "−" : "+"}${n(Math.abs(d))}`);
const stampGlyph = (v) => (v === "EXACT" ? "●" : v === "DIFFERS" ? "○" : "·");
const stampRows = (st) => `      <span class="stamp" title="the count of this book on every named axis, beside the figures other men reached for it; the difference is ours less theirs">${(st.rows || []).map((r) => `<span class="srow ${esc(String(r.verdict || "").toLowerCase())}"><span class="cls">${esc(STAMP_CLS[r.class] || String(r.class || "").toLowerCase())}</span><span class="wit">${esc(plainWitness(r.witness || "nobody published a figure on this axis"))}</span><span class="ax">${esc(STAMP_AX[r.axis] || r.axis)}</span><span class="num">${r.theirs == null ? "—" : n(r.theirs)}</span><span class="num">${n(r.ours)}</span><span class="num delta">${stampDelta(r.delta)}</span><span class="glyph">${stampGlyph(r.verdict)}</span>${r.layer ? `<span class="why">${esc(plainWitness(r.layer))}</span>` : ""}</span>`).join("")}</span>`;

// A commentary entry is its own way in, so it opens one. ?c=open tells the
// reader to press the first mark the book carries and the first work behind it
// — the same path a finger takes — rather than landing at the top of the book
// with everything shut. The book's own entry above still opens the book.
// Where each one stands, and how many this page holds rather than prints. A
// count with a bound inside it that nobody prints reads as a total.
const whereLine = (b) => {
  const parts = [];
  if (b.onWord) parts.push(`${n(b.onWord)} on the word it opens by quoting`);
  if (b.byCoordinate) parts.push(`${n(b.byCoordinate)} on the section by coordinate`);
  if (b.noCloser) parts.push(`${n(b.noCloser)} on the section, nothing places them closer`);
  if (b.heldLicence) parts.push(`${n(b.heldLicence)} kept off by a license`);
  if (b.noText) parts.push(`${n(b.noText)} named, with no text in the record`);
  return parts.join(" · ");
};
const commentaryLine = (b) => (b.units
  ? `      <a class="sub-book" href="/${b.slug}?c=open"><span class="en">Commentary on ${esc(b.disp)}</span><span class="of">${n(b.units)} carried${b.works ? ` from ${n(b.works)} work${b.works === 1 ? "" : "s"}` : ""} — ${whereLine(b)}</span></a>`
  : null);

const totalUnits = books.reduce((t, b) => t + b.units, 0);
const bySlug = new Map(books.map((b) => [b.slug, b]));
// One group per base work: its card, the works seated with it, and every way
// its commentary opens. A seated work is still its own book — the row says so
// and goes to it — it is just found where it is read.
const groupFor = (b) => {
  const subs = [];
  let seatedCount = 0;
  for (const cslug of commentaryOf.get(b.slug) || []) {
    const c = bySlug.get(cslug);
    if (!c) continue;
    seatedCount += 1;
    subs.push(`      <a class="sub-work" href="/${c.slug}">${c.he
        ? `<span class="he" lang="he" dir="rtl">${esc(c.he)}</span>`
        : `<span class="he none">no name is on record</span>`}<span class="en">${esc(c.en)}</span><span class="of">its own book · ${n(c.sections)} sections · ${n(c.words)} words · ${esc(c.byline)}</span>${incBits(c).length ? `<span class="of slots">${esc(incBits(c).join(" · "))}</span>` : ""}</a>`);
    const cl = commentaryLine(c);
    if (cl) subs.push(cl);
  }
  const cl = commentaryLine(b);
  if (cl) subs.push(cl);
  // What the fold holds, said on its face with the counts it holds it at.
  // A fold that says "more" hides; a fold that says "1 work seated with it ·
  // commentary · 612 carried · 11 commentary slots open" only shortens.
  const bits = [];
  if (seatedCount) bits.push(`${n(seatedCount)} work${seatedCount === 1 ? "" : "s"} seated with it`);
  if (b.units) bits.push(`commentary · ${n(b.units)} carried`);
  if (b.basis === "TYPED_AWAITING_LEDGER") bits.push("awaiting its navigation record");
  if (b.held) bits.push(`${n(b.held)} commentary slots open`);
  const foldRows = [`      <span class="of fold-line">${esc(b.byline)}</span>`];
  if (incBits(b).length) foldRows.push(`      <span class="of slots fold-line">${esc(incBits(b).join(" · "))}</span>`);
  return `    <div class="workgroup">
${bookCard(b)}
      <details class="fold">
      <summary>${esc(bits.join(" · ") || "its record line")}</summary>
${foldRows.join("\n")}
${subs.join("\n")}
      </details>
    </div>`;
};
// ---- the library, whole, on the ledger's shelves --------------------------
// The atlas says what exists; the ledger says where it stands and what each
// shelf is called. A canonical family pools every bridge value the ledger
// folds into it, renders its Hebrew name where the ledger gives one (each
// keyed token verified against the store; the gloss under it is the store's
// oldest displayable reading, the same rule as every title), keeps the open
// slot where it does not, and says on the fold's inside which bridge values
// it holds — the receipt of the fold. The two review values the corpus lane
// left open stand together in their own held section, and any bridge value
// the ledger has not ruled surfaces verbatim in a section of its own.
const byWorkId = new Map(books.map((b) => [b.work_id, b]));
for (const b of books) {
  let found = false;
  for (const f of Object.values(ATLAS.families)) if (f.works.some((w) => w.id === b.work_id)) { found = true; break; }
  if (!found) throw new Error(`${b.work_id} is published but the atlas does not know it — the bridge and the zones disagree; refusing output`);
}
const seatedBaseOf = new Map();   // seated slug -> base book
for (const [base, comms] of commentaryOf) for (const c of comms) seatedBaseOf.set(c, bySlug.get(base));

const valueOwner = new Map();     // bridge value -> ledger family id | "(awaiting)"
for (const f of LEDGER.families) for (const m of f.members) valueOwner.set(m, f.id);
for (const m of LEDGER.awaiting.members) valueOwner.set(m, "(awaiting)");

const poolOf = (values) => {
  const rows = [];
  for (const v of values) {
    const af = ATLAS.families[v];
    if (!af) continue;
    for (const w of af.works) rows.push({ atlas: w, book: byWorkId.get(w.id) || null, value: v });
  }
  rows.sort((a, b) => a.atlas.c0_first - b.atlas.c0_first);
  return rows;
};
const sums = (rows) => ({
  works: rows.length,
  built: rows.filter((r) => r.book || has(`${addressOf(r.atlas.id)}.bin`)).length,
  units: rows.reduce((t, r) => t + r.atlas.units, 0),
});
const families = LEDGER.families.map((lf) => {
  const present = lf.members.filter((m) => ATLAS.families[m]);
  return { ledger: lf, members: present, rows: poolOf(present) };
}).filter((f) => f.rows.length);
const unruled = Object.keys(ATLAS.families).filter((v) => !valueOwner.has(v));
const awaitingRows = poolOf(LEDGER.awaiting.members.filter((m) => ATLAS.families[m]));

// Every zone on the shelf, read once — the tally pins it, the rows draw
// from it. One law, no tiers: a zone on the shelf is a book, and its card
// derives from its own receipts, the curated two included among the rest.
const ZONE_INFO = new Map();
for (const f of shelfZoneFiles()) {
  const bytes = readFileSync(join(ZONES, f));
  assertJudgedBytes(f.replace(/\.bin$/u, ""), bytes);
  const z = JSON.parse(gunzipSync(bytes).toString("utf8"));
  const words = (z.sections || []).reduce((t, s) => t + (s.words || []).length, 0);
  const wr = typeof z.work_receipts === "string" ? z.work_receipts : ((z.work_receipts || {}).b_n || "");
  const m = wr.match(/work_id=([^\s·]+)/);
  const slug = f.replace(/\.bin$/, "");
  ZONE_INFO.set(slug, {
    slug,
    work_id: m ? m[1] : slug,
    words,
    sections: (z.sections || []).length,
    bytes: bytes.length,
    sha256: sha256(bytes),
    heTokens: z.work_he_tokens || [],
    postures: posturesOf(z),
    // the count stamped beside the witnesses, when the builder stamped one
    stamp: z.count_stamp || null,
    workEn: z.work || slug,
    // the force-read claim, by the same evidence law as everywhere: a
    // licensed record reading the title's own form as this English, or null
    reading: titleReading(z.work_he_tokens, z.work || slug),
  });
}

// THE SECTIONS' STAMP ON THE FACE. Torah, Neviim, Ketuvim, the whole Tanakh:
// the served books' own counts summed per section, beside the figures other
// men reached for the section — Pardes Yosef's 79,980 on the Torah, Ben
// Asher's 5,845 verses, the Leningrad Codex counted the same way. A section
// is summed only when every book of it is served and stamped; until then the
// strip says how many are in and waits. Read from the same witness record
// the builder stamped every book from.
const WITNESSES_PATH = "data/masorah-witnesses-v1.json";
const sectionStamp = (() => {
  if (!existsSync(WITNESSES_PATH)) return "";
  const W = JSON.parse(readFileSync(WITNESSES_PATH, "utf8"));
  const stampOf = new Map([...ZONE_INFO.values()].filter((zi) => zi.stamp).map((zi) => [zi.slug, zi.stamp]));
  if (!stampOf.size) return "";
  const AX = { verses: "verses", words: "words · read", words_written: "words · written", letters: "letters · written", letters_read: "letters · read" };
  const CLS = { COUNTED_THIS_TEXT: "counted this text", THE_MASORAH: "the masorah", LATER_AUTHORITY: "later authority", TALMUD_GEONIM: "Talmud, Geonim", HELD_EDITION: "held edition" };
  const NAME = { torah: "Torah", neviim: "Neviim", ketuvim: "Ketuvim", tanakh: "the whole Tanakh" };
  const blocks = [];
  let i = 0;
  for (const [scope, sec] of Object.entries(W.sections || {})) {
    const inSet = (sec.books || []).filter((b) => stampOf.has(b));
    const head = `<p class="sh">${esc(NAME[scope] || scope)} · <span class="ours">${n(inSet.length)} of ${n((sec.books || []).length)} books served</span></p>`;
    if (inSet.length !== (sec.books || []).length) {
      blocks.push(`${head}<p class="waits">the section's count is summed when every book of it is served and stamped; ${n((sec.books || []).length - inSet.length)} still wait${(sec.books || []).length - inSet.length === 1 ? "s" : ""}</p>`);
      continue;
    }
    const ours = {};
    for (const b of inSet) for (const [k, v] of Object.entries(stampOf.get(b).ours)) if (typeof v === "number") ours[k] = (ours[k] || 0) + v;
    const rows = (sec.rows || []).map((r) => {
      const o = ours[r.axis]; if (!Number.isInteger(o) || !Number.isInteger(r.figure)) return "";
      const d = o - r.figure, v = d === 0 ? "exact" : "differs";
      i += 1;
      return `<tr class="${v}" style="animation-delay:${Math.min(i, 14) * 70}ms"><td class="wit"><span class="cls">${esc(CLS[r.class] || String(r.class).toLowerCase())}</span>${esc(plainWitness(r.witness))}</td><td>${esc(AX[r.axis] || r.axis)}</td><td class="num">${n(r.figure)}</td><td class="num">${n(o)}</td><td class="num delta">${d < 0 ? "−" : "+"}${n(Math.abs(d))}</td><td class="glyph">${d === 0 ? "●" : "○"}</td><td>${r.layer ? esc(plainWitness(r.layer)) : ""}</td></tr>`;
    }).join("");
    blocks.push(`${head.replace("</span></p>", ` · ${n(ours.words)} words read · ${n(ours.words_written)} written · ${n(ours.letters)} letters · ${n(ours.verses)} verses · ${n(ours.c0_off)} scribal marks</span></p>`)}<table>${rows}</table>`);
  }
  return `  <div id="sectstamp" title="the served books' own counts summed per section, beside the figures other men reached for the section; the difference is ours less theirs">${blocks.join("")}</div>`;
})();
// A book's name is a record too. The row stays two columns — the bridge's
// name and the unit count — and the name itself opens the book's own card:
// the masthead's frame at book grain, in a card so the rows stay uncluttered.
// The address rule, same as the fleet runner's: the last id segment — the
// published rule since the cutover — unless another work in the atlas shares
// it, and only then the segments after the family joined. A blanket join
// here once moved 844 published addresses; the collision set is 4 works.
const LAST_SEG_COUNT = new Map();
for (const fam of Object.values(ATLAS.families)) for (const w of fam.works) {
  const l = String(w.id).split("/").pop();
  LAST_SEG_COUNT.set(l, (LAST_SEG_COUNT.get(l) || 0) + 1);
}
const addressOf = (id) => {
  const segs = String(id).split("/");
  const last = segs[segs.length - 1];
  return LAST_SEG_COUNT.get(last) > 1 ? segs.slice(1).join("-") : last;
};
const atlasRow = (w) => {
  const segs = w.id.split("/");
  const name = addressOf(w.id);
  const pre = segs.slice(0, -1).join("/");
  const fam = valueOwner.get(pre);
  const famAttr = fam && fam !== "(awaiting)" ? ` data-fam="${esc(fam)}"` : "";
  const st = FLEET_STATE.get(w.id) || "AWAITING_SHARDS";
  // A work whose zone stands on the shelf is served, and a served work is a
  // book — the same two-treatment card the curated books get, derived from
  // the zone's own receipts. The title words the zone claims from its own C0
  // open their records (the door's card machinery is global); the name is
  // the way in; the counts are the zone's. A zone claiming no title keeps
  // the recorded id as its name, read plainly, dir=auto because most of
  // this shelf's ids are the works' own Hebrew opening words.
  const zi = ZONE_INFO.get(name);
  if (zi) {
    const tw = titleWords({ heTokens: zi.heTokens, slug: name, disp: plainName(name) || zi.workEn, reading: zi.reading });
    // the same four facts a shelf's heading carries, for a book: who attests
    // the English name, and the licence the Hebrew's own reading is released
    // under. Absent where the record is absent, and silent about it — a book
    // row is not the place to argue, and the card inside says what is missing.
    const att = zi.reading
      ? `<span class="chip" title="commonly force read as — ${esc(zi.reading.label)}${zi.reading.year ? ` · ${esc(zi.reading.year)}` : ""} attests this usage. A name is an identification, not licensed expression (FRAME v2.7); who says so, not who permits it.">attested: ${esc(zi.reading.label)}</span>`
      : "";
    const heKey = (zi.heTokens || []).map((t) => t.k).filter(Boolean)[0] || null;
    const heGloss = heKey ? (STORE.glossFor(heKey).text || "") : "";
    const lic = heGloss ? chipHtml(glossSource(heKey, heGloss)) : "";
    const he = zi.heTokens.some((t) => t.k)
      ? `<span class="fam-he"><span class="he" lang="he" dir="rtl">${tw}</span></span>`
      : "";
    // the name slot's law, everywhere: plain letters, or the absence said
    // in words with the recorded id riding on the hover — never a raw id
    // dressed as a name
    const pn = plainName(name);
    const label = pn ? esc(pn) : `<span class="none" title="${esc(name)}">${NO_PLAIN_NAME}</span>`;
    // a stamped book says its count on the row, on the read axis, with the
    // scribes' marks apart, and the witness rows follow — the same stamp the
    // book's own page carries under its masthead
    const au = zi.stamp
      ? `${n(zi.stamp.ours.verses)} verses · ${n(zi.stamp.ours.words)} words read · ${n(zi.stamp.ours.letters)} letters · ${n(zi.stamp.ours.c0_off)} scribal marks`
      : `${n(zi.sections)} section${zi.sections === 1 ? "" : "s"} · ${n(w.units)} unit${w.units === 1 ? "" : "s"}`;
    // A row on the door is a way into a book: its name, and what it holds. The
    // count stamp hung here too — five witness rows per book, each wrapping to
    // two lines, so opening the one family that has books unrolled ten
    // thousand pixels of arithmetic. A count is proof ABOUT a book and it
    // stands on that book's own page, where all thirty-nine carry it beside
    // the figures other men reached. The door still marks which books are
    // stamped, because that is a fact about the row.
    return `      <span class="atlas-row built${zi.stamp ? " stamped" : ""}"><span class="col-en"><a class="aw" href="/${name}" title="open this book">${label}</a></span><span class="col-att">${att}</span><span class="col-he">${he}</span><span class="col-lic">${lic}</span></span>`;
  }
  return `      <span class="atlas-row" data-p="${esc(pre)}"><button type="button" class="aw" dir="auto" data-w="${esc(w.id)}" data-u="${w.units}" data-cr="${w.c0_rows}" data-cf="${w.c0_first}" data-st="${esc(st)}"${famAttr} title="open this book&#8217;s own record">${esc(name)}</button><span class="au">${n(w.units)} unit${w.units === 1 ? "" : "s"}</span></span>`;
};
const seatedRow = (b) => {
  const base = seatedBaseOf.get(b.slug);
  return `      <a class="atlas-row built" href="/${b.slug}"><span class="aw">${esc(b.disp)}</span><span class="au">its own book · seated with ${esc(base ? base.disp : "its base")} — reads there · ${n(b.sections)} sections</span></a>`;
};
const rowsHtml = (rows) => rows.map((r) => {
  if (!r.book) return atlasRow(r.atlas);
  if (seated.has(r.book.slug)) return seatedRow(r.book);
  return groupFor(r.book);
});
// A family's name is words of the ledger, and a word answers for itself:
// each keyed token is a real control that opens the word's own record — the
// store's readings, oldest source first, each with its license — in a card
// on this page, separately from the fold it happens to sit in. A token the
// store is silent on prints and opens nothing, the numeral rule's law.
const famHeadHe = (lf) => {
  if (!lf.he) return `<span class="he none">no name is on record</span>`;
  const key = (lf.he_tokens || []).map((t) => t.k).filter(Boolean)[0] || null;
  const gloss = key ? (STORE.glossFor(key).text || "") : "";
  // the reading under the name carries the license of the record it is
  // read from, the same chip the reader's card shows
  const gsrc = gloss ? glossSource(key, gloss) : null;
  const words = (lf.he_tokens || []).map((t) => t.k
    ? `<button type="button" class="fw" data-k="${esc(t.k)}" title="open this word’s own record — readings oldest source first">${esc(t.s)}</button>`
    : `<span class="fw inert">${esc(t.s)}</span>`).join(" ");
  // the third and fourth cells: the Hebrew with its reading, and beside it the
  // licence that reading is released under — never one without the other, so
  // the licence gets a column of its own rather than trailing the gloss
  return `<span class="col-he"><span class="fam-he" data-named-by="family-ledger-v1#${esc(lf.id)}"><span class="he" lang="he" dir="rtl">${words}</span>${gloss ? `<span class="g">${esc(gloss)}</span>` : ""}</span></span><span class="col-lic">${gloss ? chipHtml(gsrc) : ""}</span>`;
};
// The shelf shows what serves; the census keeps every record — the owner's
// ruling, 2026-08-29: "why not just show the ones we can serve on home page
// for now, corpus stays it can be empty i know we are missing torah but can
// keep torah section." A family's shelf lists only books a reader can open
// today. The family keeps its head even when nothing under it serves — an
// empty shelf with its counts is the honest state, not a hidden one — and
// every unserved record stands below in the census, unchanged in every
// column it always carried.
const rowServes = (r) => !!r.book || ZONE_INFO.has(addressOf(r.atlas.id));
const familySection = (fam) => {
  const lf = fam.ledger;
  const s = sums(fam.rows);
  const shelfRows = fam.rows.filter(rowServes);
  const censusCount = fam.rows.length - shelfRows.length;
  const bits = [`${n(s.works)} work${s.works === 1 ? "" : "s"}`];
  if (s.built) bits.push(`${n(s.built)} built`);
  bits.push(`${n(s.units)} units`);
  const reading = titleReading(lf.he_tokens || [], lf.en);
  // The ledger's English shows only when a licensed record reads the family's
  // own Hebrew that way; until then the bridge's recorded values are read
  // plainly, and the row says what it is waiting on.
  // The label is a claim and follows the evidence — the owner's ruling, made
  // the day "liturgy" stood under "commonly force read as" with no D card and
  // no M anywhere behind it. The id was honest; the label was not. A claim
  // prints only with its ATTESTATION riding beside it — who attests the
  // usage, never who permits it: a common name is an identification, not
  // licensed expression, and a license chip on a name cited the database the
  // name was found in as if the name were reproduced expression (the
  // category error FRAME v2.7 retired). An unbacked row is the bridge's
  // value read plainly, and says so in the register the awaiting shelf
  // already uses.
  // THE REGISTER RIDES THE CHIP, NOT A LABEL IN FRONT OF THE NAME. Every row
  // wore its register spelled out — "commonly force read as", "listed in the
  // catalog as" — six or seven words ahead of a one-word name, on every shelf
  // and every book. The ruling those labels serve does not change: English
  // standing at a shelf's head must say which register it stands in, and a
  // claim prints only with its attestation beside it. What changes is where
  // it is said. A row carrying an "attested:" chip IS the claim register and
  // the chip names who attests; a row carrying "awaiting a named source" IS
  // the catalog register and says what it waits on. The register is in the
  // chip's own words on hover, and the name gets the room.
  // FOUR CELLS, and each is one fact: the name, what attests the name, the
  // Hebrew, and the licence the Hebrew's reading is released under. The owner's
  // ruling of 2026-09-06. Naming the cells rather than letting the row's
  // children fall where they may is what keeps every row of the door in the
  // same four columns, whatever a particular row happens to hold.
  const enName = reading
    ? `<span class="en">${esc(lf.en)}</span>`
    : (() => {
        const readable = fam.members.map(plainName).filter(Boolean);
        return readable.length
          ? `<span class="en" title="${esc(fam.members.join(" · "))}">${esc(readable.join(" · "))}</span>`
          : `<span class="en none" title="${esc(fam.members.join(" · "))}">${NO_PLAIN_NAME}</span>`;
      })();
  const enAtt = reading
    ? `<span class="chip" title="commonly force read as — ${esc(reading.label)}${reading.year ? ` · ${esc(reading.year)}` : ""} attests this usage. A name is an identification, not licensed expression (FRAME v2.7); who says so, not who permits it.">attested: ${esc(reading.label)}</span>`
    : `<span class="of" title="${esc(`listed in the catalog as — ${AWAITS_M}`)}">awaiting a named source</span>`;
  // Two lines stood at the head of every shelf and the owner struck both
  // (2026-09-06): the family's own description of itself, and the ledger's
  // housekeeping note naming which record folded the shelf and when that
  // record dies. Neither told a reader looking for a book anything they
  // could use, and the second was the pipeline talking to itself in public.
  // The family ledger still says both, and still says them where they are
  // read — in the record, not on the door.
  const foldLines = [];
  // The home page rests fully collapsed into the grouping: every family
  // folded to its two-row head, the built ones included — a tap opens a
  // shelf, the search box opens whatever matches. Nothing rests open.
  const shelfBody = shelfRows.length
    ? rowsHtml(shelfRows).join("\n")
    : `      <span class="of fold-line">nothing on this shelf serves yet — its ${n(s.works)} work${s.works === 1 ? " stands" : "s stand"} in the census below, each saying what it awaits</span>`;
  const censusNote = shelfRows.length && censusCount
    ? `\n      <span class="of fold-line">${n(censusCount)} more work${censusCount === 1 ? "" : "s"} of this family stand${censusCount === 1 ? "s" : ""} in <a href="/census/">the census</a>, each saying what it awaits</span>`
    : "";
  // A family holding something a reader can open arrives open. The door exists
  // to offer books; a shelf that has them and shows a closed fold is offering
  // a press, not a book. A family with nothing readable stays shut, inside the
  // fold that gathers all of them.
  return `    <section class="family">
      <details class="fam"${shelfRows.length ? " open" : ""}>
      <summary>
        <span class="row"><span class="col-en">${enName}</span><span class="col-att">${enAtt}</span>${famHeadHe(lf)}</span>
      </summary>
      <div class="fgroups">
${foldLines.join("\n")}
${shelfBody}${censusNote}
      </div>
      </details>
    </section>`;
};
// The census: the same records, in the same columns, standing apart from
// the shelf so a reader who opens a family meets books first. No family
// head repeats its Hebrew here — the ledger's words already stand once
// above, and the census speaks in the bridge's own register: recorded ids,
// plain letters where they read as a name, and what each work awaits.
const censusFamily = (fam) => {
  const rows = fam.rows.filter((r) => !rowServes(r));
  if (!rows.length) return "";
  const s = sums(rows);
  const readable = fam.members.map(plainName).filter(Boolean);
  const label = readable.length ? esc(readable.join(" · ")) : NO_PLAIN_NAME;
  return `    <section class="family">
      <details class="fam">
      <summary>
        <span class="row"><span class="lab">listed in the catalog as</span><span class="en${readable.length ? "" : " none"}" title="${esc(fam.members.join(" · "))}">${label}</span></span>
        <span class="row"><span class="of">${n(s.works)} work${s.works === 1 ? "" : "s"} not yet served · ${n(s.units)} units — every row says on its own card what it awaits</span></span>
      </summary>
      <div class="fgroups">
${rowsHtml(rows).join("\n")}
      </div>
      </details>
    </section>`;
};
// Both registers split like the families do: a row whose zone stands on the
// shelf is a book and belongs on the door, whichever register its family
// waits in — the census move (2026-08-30) first carried these sections off
// whole and took 14 built books' door links with them.
const awaitingSection = (rows = awaitingRows) => {
  if (!rows.length) return "";
  const s = sums(rows);
  return `    <section class="family">
      <details class="fam">
      <summary>
        <span class="row"><span class="lab">held for review</span><span class="he none">the corpus lane&#8217;s own review markers, standing open</span></span>
        <span class="row"><span class="lab">listed in the catalog as</span><span class="en" title="${esc(LEDGER.awaiting.members.join(" · "))}">${esc(LEDGER.awaiting.members.map((m) => plainName(m) ?? NO_PLAIN_NAME).join(" · "))}</span><span class="of">${n(s.works)} works · ${n(s.units)} units</span></span>
      </summary>
      <div class="fgroups">
      <span class="of fold-line">${esc(LEDGER.awaiting.why)}</span>
${rowsHtml(rows).join("\n")}
      </div>
      </details>
    </section>`;
};
const unruledSection = (v, keep = () => true) => {
  const rows = poolOf([v]).filter(keep);
  if (!rows.length) return "";
  const s = sums(rows);
  return `    <section class="family">
      <details class="fam">
      <summary>
        <span class="row"><span class="lab">family</span><span class="he none">no name is on record</span></span>
        <span class="row"><span class="lab">listed in the catalog as</span><span class="en" title="${esc(v)}">${esc(plainName(v) ?? NO_PLAIN_NAME)}</span><span class="of">${n(s.works)} works · ${n(s.units)} units · the family ledger has not ruled this value</span></span>
      </summary>
      <div class="fgroups">
${rowsHtml(rows).join("\n")}
      </div>
      </details>
    </section>`;
};
// The reader count is a different grain from C0. It is the exact number of
// COMPspan records the built zones carry now, recomputed from those zone bytes on
// every run. A future zone successor therefore changes this snapshot without
// anyone editing a typed count.
// The set the receipt pins is exactly the set the directory carries — the
// fleet's zones included, not only the curated books. A receipt that pinned
// two zones while two thousand served would be a snapshot of a shelf that
// no longer exists.
const zoneTallyRows = [...ZONE_INFO.values()].map((zi) => ({
  path: `${ZONES}/${zi.slug}.bin`.replace(/\\/g, "/"),
  work_id: zi.work_id,
  rendered_compspan_records: zi.words,
  bytes: zi.bytes,
  sha256: zi.sha256,
}));
const renderedTally = {
  compspan_records: zoneTallyRows.reduce((total, r) => total + r.rendered_compspan_records, 0),
  built_zones: zoneTallyRows.length,
  zones: zoneTallyRows,
};
renderedTally.zone_manifest_sha256 = sha256(Buffer.from(JSON.stringify(renderedTally.zones)));

const countReceipt = {
  schema: "mishkan.bezalel.front_door_three_count_receipt.v1",
  status: "PASS_PINNED_INPUTS__CURRENT_ZONE_SNAPSHOT__DYNAMIC_RENDER_GRAIN",
  exact_text_input_policy: BINDINGS.exact_text_input_policy,
  grains: {
    physical_c0_rows: "C0_ROWS",
    named_shelf_c0_rows: "C0_ROWS",
    rendered_compspan_records: "ONE_RECORD_PER_COMPSPAN__NOT_C0_ROWS",
  },
  snapshot: {
    kind: "CURRENT_BUILT_ZONE_BYTES_AT_BUILD_TIME",
    recomputed_from_zone_bytes_on_every_build: true,
    future_zone_successor_behavior: "RECOMPUTE_RENDERED_COMPSPAN_RECORDS_WITHOUT_TYPED_COUNT_EDIT",
    zone_manifest_sha256: renderedTally.zone_manifest_sha256,
  },
  counts: {
    current_physical_c0_rows: physicalRows,
    physically_backed_c0_rows_on_named_work_unit_shelves: namedShelfRows,
    rendered_compspan_records: renderedTally.compspan_records,
    logical_plan_c0_rows: logicalPlanRows,
    logical_plan_c0_rows_not_physical: logicalPlanNotPhysicalRows,
    physical_c0_rows_not_yet_mapped_to_named_shelf: physicalUnmappedRows,
  },
  equations: {
    logical_plan_partition: logicalPlanRows === namedShelfRows + logicalPlanNotPhysicalRows ? "PASS" : "FAIL",
    physical_partition: physicalRows === namedShelfRows + physicalUnmappedRows ? "PASS" : "FAIL",
  },
  inputs: {
    logical_atlas: { path: ATLAS_PATH, ...atlasPinned.actual },
    physical_handoff: { path: PHYSICAL_HANDOFF_PATH, ...handoffPinned.actual },
    count_bindings: { path: COUNT_BINDINGS_PATH, ...BINDINGS_ACTUAL },
    physical_atlas: BINDINGS.inputs.physical_atlas,
    logical_overlay: BINDINGS.inputs.logical_overlay,
    genesis_clean_successor_v3: GENESIS_V3,
    genesis_v3_pin_state: genesisPinState,
  },
  rendered: renderedTally,
};
const countReceiptJson = JSON.stringify(countReceipt, null, 2) + "\n";
// The reader, working — the owner's home-page ruling: demonstration first.
// One verse stands on the door with the machinery live, and it is DERIVED,
// never picked (demo-verse-rule-v1): the opening words of the first book on
// the shelf in shelf order, the first ten of its first section — the same
// rule check-nothing-hand-typed and check-clean-address re-derive
// independently, so a hand-swapped verse fails the gates. Every keyed word
// is the same .fw control as every other word on this page; its reading is
// the store's oldest displayable with its license beside it, the door's
// standing gloss law.
const DEMO_N = 10;
const demo = (() => {
  const first = [...ZONE_INFO.keys()][0];
  if (!first) return null;
  const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, `${first}.bin`))).toString("utf8"));
  const sec = (z.sections || [])[0];
  if (!sec || !(sec.words || []).length) return null;
  const words = sec.words.slice(0, DEMO_N).map((w) => {
    const k = w.k || (Array.isArray(w.w) && w.w[0] && w.w[0].k) || null;
    const g = k ? (STORE.glossFor(k).text || "") : "";
    return { s: w.s, k, g, src: g ? glossSource(k, g) : null };
  });
  // the same zone's census facts, read from its own receipts for the
  // census-in-the-title demonstration below — nothing typed, nothing chosen
  const perOcc = String(((z.emitted_from || {}).license_receipts || {}).per_occurrence || "");
  // each rows-group's composite leads with its license posture; the chip
  // says that posture in the declarations record's plain words and carries
  // the whole composite on the hover — machine register never prints
  const postures = [];
  for (const m of perOcc.split(" — ")[0].matchAll(/[\d,]+ rows: ([^|]+?)(?= \| |$)/g)) {
    const full = m[1].trim();
    // the composite's head is the posture in the rights lane's uppercase
    // register; the declarations record keys it lowercase
    const name = licenseName(full.split(" · ")[0].toLowerCase());
    if (!postures.some((p) => p.name === name)) postures.push({ name, full });
  }
  const zi = ZONE_INFO.get(first);
  return { slug: first, label: plainName(first), words, postures, zi };
})();
// THE DEMONSTRATIONS — hand-authored, fenced, never served.
//
// THE DRAWINGS ARE RETIRED (2026-09-03). For a year this file also built
// a page that imitated the reader's card in its own markup, with typed
// Hebrew inside it, because the books carrying the frame's marks were all
// held. A drawing of a card demonstrates a drawing. The eight rules now
// stand on real zones the reader itself opens, built by the builder every
// served book goes through — data/rule-demonstrations-v1.json names them
// and tools/build-demonstrations-v1.mjs builds them — so the imitation
// card, its record and its fence are gone rather than kept beside the
// thing they were standing in for.

// THE EIGHT RULES, EACH AT ITS OWN ADDRESS. The record names them, says what
// each does in plain English, and says for each whether its passage is
// carried from a named source or typed because no source we hold carries the
// mark. This file turns that into one index and eight reader pages; it
// invents no sentence of its own about any rule.
const RD_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "rule-demonstrations-v1.json");
const RD = existsSync(RD_PATH) ? JSON.parse(readFileSync(RD_PATH, "utf8")) : null;

const pocLink = `  <p class="poc-link"><a href="/demonstrations/">what each part of the frame looks like when it works</a> \u2014 the eight rules of the frame, each on a passage the reader itself opens</p>`;

const demoHtml = demo ? `  <section id="demo" aria-label="The reader, working">
    <p class="demo-lab">the reader, working — press any word</p>
    <p class="d-verse"><span class="demo-he"><span class="he" dir="rtl">${demo.words.map((w) => w.k
      ? `<span class="dw"><button type="button" class="fw" lang="he" data-k="${esc(w.k)}" title="open this word&#8217;s own record — readings oldest source first">${esc(w.s)}</button>${w.g ? `<span class="g">${esc(w.g)}${chipHtml(w.src)}</span>` : ""}</span>`
      : `<span class="dw"><span class="fw inert" lang="he">${esc(w.s)}</span></span>`).join(" ")}</span></p>
    <p class="of">the opening words of <a href="/${demo.slug}">${demo.label ? esc(demo.label) : `<span class="none" title="${esc(demo.slug)}">${NO_PLAIN_NAME}</span>`}</a>, cut from its own record — derived by rule, the first book on the shelf, never chosen. Each reading above is the store&#8217;s oldest displayable witness with its license; the whole book reads the same way, with its component lattice live on every word.</p>
  </section>` : "";
// The census, worn in the title — a demonstration, same derived book as the
// verse above (demo-verse-rule-v1's pick, never chosen). The owner's ask,
// 2026-08-30: rather than a separate census place, the title itself wears
// what the census would say about the work — its attested usage, its rows'
// license, its measured size, whether its Hebrew title is witnessed. Every
// chip below is read from the zone's own receipts at build time; nothing is
// typed and no Hebrew is repeated (the shelf row keeps the witnessed title;
// this line wears the facts).
const censusDemoHtml = demo && demo.zi ? `  <section id="census-demo" aria-label="The census, worn in the title">
    <p class="demo-lab">the census, worn in the title — a demonstration</p>
    <p class="cd-line"><a class="cd-name" href="/${demo.slug}">${demo.label ? esc(demo.label) : `<span class="none" title="${esc(demo.slug)}">${NO_PLAIN_NAME}</span>`}</a>${
      demo.zi.reading ? `<span class="chip" title="${esc(demo.zi.reading.label)}${demo.zi.reading.year ? ` · ${esc(String(demo.zi.reading.year))}` : ""} — attests this usage; a name is an identification, not licensed expression (FRAME v2.7)">attested: ${esc(demo.zi.reading.label)}</span>` : ""
    }${demo.postures.map((p) => `<span class="chip" title="the license standing on this work&#8217;s rows, from the zone&#8217;s own per-occurrence receipts: ${esc(p.full)}">${esc(p.name)}</span>`).join("")
    }<span class="chip" title="measured from the zone&#8217;s own sections at build time">${n(demo.zi.sections)} section${demo.zi.sections === 1 ? "" : "s"} · ${n(demo.zi.words)} words</span>${
      demo.zi.heTokens.some((t) => t.k) ? `<span class="chip" title="the Hebrew title on the shelf row is the work&#8217;s own opening words, claimed from its own record — not supplied">title witnessed</span>` : ""
    }</p>
    <p class="of">every fact a census row would say, worn by the name instead — read from the book&#8217;s own receipts, derived for the same first book as the verse above. Where the census register is heading: into the titles, not a separate place.</p>
  </section>` : "";
const censusSections = [
  ...families.map(censusFamily),
  awaitingSection(awaitingRows.filter((r) => !rowServes(r))),
  ...unruled.map((v) => unruledSection(v, (r) => !rowServes(r))),
].filter(Boolean);
// The census stands at its own address (/census/), linked from the door's
// top corner — the owner's ask, 2026-08-30: not forgotten at the bottom of
// the home page, and informationally whole where it stands. The door keeps
// one line saying the census exists and what it holds.
const censusHead = censusSections.length
  ? (() => {
      // the state of the library, said in fractions the data owes: how
      // many served titles are witnessed (the work's own opening words),
      // how many read plainly by their recorded ids — and the registers
      // that are built and empty, said so, because an empty register is a
      // fact and a silent one reads as a hidden one
      const witnessed = [...ZONE_INFO.values()].filter((zi) => (zi.heTokens || []).some((t) => t.k)).length;
      const plain = ZONE_INFO.size - witnessed;
      return `    <section class="family census-head">
      <p class="of">The state of the library: of the ${n(ZONE_INFO.size)} books serving, ${n(witnessed)} carry witnessed Hebrew titles — their own opening words, claimed from their own records — and ${n(plain)} read plainly by their recorded ids. The editorial and machine-pointer title registers are built and empty: nothing on this site is guessed.</p>
    </section>`;
    })()
  : "";
const censusPageSections = [censusHead, ...censusSections].filter(Boolean);
const censusPointer = censusSections.length
  ? `    <section class="family census-head">
      <p class="of"><a href="/census/">THE CENSUS</a> · every work the bridge records that does not serve yet stands at its own page — nothing hidden, nothing promised: each row carries its recorded id, its measured size, and what it awaits.</p>
    </section>`
  : "";
const refPointer = (() => {
  try {
    const RG = JSON.parse(readFileSync(arg("reference-groups", "data/reference-groups-v1.json"), "utf8"));
    const links = (RG.groups || []).map((g) => `<a href="/${g.slug}">${esc(g.name_en)}</a>`).join(" \u00b7 ");
    return links ? `    <section class="family census-head">
      <p class="of">REFERENCES \u00b7 ${links} \u2014 a traditional name gathering its sealed pieces; the pieces stay themselves.</p>
    </section>` : "";
  } catch { return ""; }
})();
// A corpus with nothing readable in it is a promise, not a shelf. Seventeen of
// the eighteen families on this door held no book a reader could open, and each
// wore a full row — Hebrew name, forced reading, attestation chip, three counts
// — between a reader and the one family that had books. They are kept, whole
// and unchanged, inside one fold that opens closed. What is on the door is what
// can be read; what is coming stands behind one press that says how much of it
// there is.
const familyHasABook = (f) => f.rows.some(rowServes);
const shelved = families.filter(familyHasABook);
const waiting = families.filter((f) => !familyHasABook(f));
const waitingWorks = waiting.reduce((t, f) => t + sums(f.rows).works, 0);
const waitingFold = waiting.length
  ? `    <details class="fam waiting-fams">
      <summary><span class="row"><span class="lab">corpuses with nothing readable yet</span><span class="en">${n(waiting.length)} groups \u00b7 ${n(waitingWorks)} works listed</span></span></summary>
${waiting.map(familySection).join("\n")}
    </details>`
  : "";
// TWO COLUMNS, AND EACH SAYS ITS OWN JOB ONCE. The owner's grouping,
// 2026-09-06: the left column is the English and pressing it opens a thing —
// a corpus while it is shut, a book once it is open. The right column is the
// Hebrew and pressing it opens that word's own record. Said at the head of the
// columns, so no row has to carry an instruction, and every row is then just
// a name beside a name.
const columnHeads = `    <div class="colheads" aria-hidden="true">
      <span class="ch">press a name to open it</span>
      <span class="ch">who attests that name</span>
      <span class="ch">press the Hebrew for its record</span>
      <span class="ch">what its reading is released under</span>
    </div>`;
const sectionsHtml = [
  columnHeads,
  ...shelved.map(familySection),
  awaitingSection(awaitingRows.filter(rowServes)),
  ...unruled.map((v) => unruledSection(v, rowServes)),
  waitingFold,
  // The census stood here in a sentence and the references in another. The
  // census keeps its press in the corner; the references were a traditional
  // name gathering books that are their own works, which the owner retired as
  // an artifact on 2026-09-06 — if a grouping is ever wanted it is a toggle,
  // not a row on the door.
].filter(Boolean);

// One shell, two pages. The door and the census share every style, every
// card, and every script — the census is the same publication standing at
// its own address (/census/), per the owner's ask (2026-08-30): the census
// must not sit forgotten at the bottom of the home page, and must lose
// nothing by moving. `page` picks the parts: the door carries the shelf,
// the demonstrations and the counts; the census carries the register.
const pageDoc = (page) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="A Hebrew reader built on a sealed chain: every reading traceable to the record that carries it, and every record to the license it was released under.">
<script>
// Two faces, both the record's: linen by day, the tent by night. The device
// decides until the reader chooses; the choice stays on the device.
(() => {
  const root = document.documentElement;
  let held = null;
  try { held = localStorage.getItem("scheme"); } catch { /* still reads */ }
  const sys = matchMedia("(prefers-color-scheme: light)");
  const apply = () => { root.dataset.scheme = held === "day" || held === "night" ? held : (sys.matches ? "day" : "night"); };
  apply();
  if (sys.addEventListener) sys.addEventListener("change", apply);
  window.__face = { set(v) { held = v; try { localStorage.setItem("scheme", v); } catch { /* still reads */ } apply(); } };
})();
</script>
<style>
${DOOR_CSS}${STAMP_CSS}
</style>
</head>
<body>
<button id="face" class="face" type="button" title="the other face of the page">day</button>
${page.altLink}
<script>
{
  const face = document.getElementById("face");
  const nameOther = () => { face.textContent = document.documentElement.dataset.scheme === "day" ? "night" : "day"; };
  nameOther();
  face.addEventListener("click", () => {
    window.__face.set(document.documentElement.dataset.scheme === "day" ? "night" : "day");
    nameOther();
  });
}
</script>
<main
    data-text-input-byte-rule="${TEXT_PIN_RULE}"
    data-logical-atlas-sha256="${atlasPinned.actual.sha256}"
    data-physical-handoff-sha256="${handoffPinned.actual.sha256}"
    data-physical-atlas-sha256="${BINDINGS.inputs.physical_atlas.sha256}"
    data-logical-overlay-sha256="${BINDINGS.inputs.logical_overlay.sha256}"
    data-genesis-clean-zone-sha256="${GENESIS_V3.zone.sha256}"
    data-genesis-clean-handoff-sha256="${GENESIS_V3.front_door_handoff.sha256}"
    data-genesis-clean-validation-sha256="${GENESIS_V3.validation.sha256}"
    data-genesis-clean-seal-sha256="${GENESIS_V3.closed_world_seal.sha256}"
    data-rendered-zone-manifest-sha256="${renderedTally.zone_manifest_sha256}">
  <!-- Built by tools/build-front-door-v1.mjs from pinned physical/logical
       authorities and the zones. These attributes are the door naming what it
       was built from; they carried on the counts block until that block came
       off the page, and they are provenance rather than display, so they moved
       here rather than going with it. -->
  <h1>${page.h1}</h1>
  <p class="sub">${page.sub}</p>
  <!-- The door names itself and offers the books. Two lines stood here — how
       many are readable against how many are listed, and the gate's figures
       for served, refused and awaiting the stamp — and the owner struck both
       (2026-09-06). Neither is lost: the census carries every listed work and
       what each awaits, at its own address in the corner, and the gate's
       receipt carries every refusal line by line. A front door says what this
       is and shows what is here; the accounting stands where it is read. -->
${page.counts ? `  <script id="front-door-counts-receipt" type="application/json">${JSON.stringify(countReceipt).replace(/</g, "\\u003c")}</script>` : ""}
${page.demo ? demoHtml : ""}
  <form id="find" role="search" onsubmit="return go(event)">
    <input id="q" type="search" autocomplete="off" spellcheck="false"
      placeholder="find a book"
      title="type its name however your hands type it — 1 kings, i-kings, 1-kings all land"
      aria-label="find a book" oninput="sift()">
  </form>
  <nav class="books">
${page.sections.join("\n")}
  </nav>
  <!-- The section counts are not here. They were the first thing on the door,
       then the last; the owner struck them on 2026-09-06 and the reason is
       right: a count is proof about a book and it stands on that book's own
       page, where every one of the thirty-nine carries its own beside the
       figures other men reached for it. A door is not where a reader checks
       arithmetic. The builder still computes them, and the count receipt is
       still linked in the footer. -->
  <div id="wshade" hidden></div>
  <div id="bkcard" role="dialog" aria-label="the book&#8217;s own record" hidden>
    <div class="head"><b></b><button type="button" aria-label="Close">&#215;</button></div>
    <p class="row bk-he"><span class="lab">hebrew title</span><span class="he none">no name is on record</span></p>
    <p class="row bk-en"><span class="lab">listed in the catalog as</span><span class="en"></span><span class="of" title="its catalog entry read as plain words &#8212; a proper name will show once a source on record uses one">awaiting a named source</span></p>
    <p class="row bk-fam"><span class="lab">family</span><span class="slot"></span></p>
    <p class="row bk-n"><span class="lab">recorded</span><span class="of"></span></p>
    <p class="row bk-st"><span class="lab">standing</span><span class="of"></span></p>
    <p class="row bk-att" hidden><span class="lab">attribution</span><span class="of att-line"></span></p>
    <p class="prov">named by the bridge, hyphens read as spaces &#183; counted by ${esc(ATLAS.schema_version || "corpus-atlas-v1")} &#183; the Hebrew title row waits on a work ledger</p>
  </div>
  <div id="wcard" role="dialog" aria-label="the word&#8217;s own record" hidden>
    <div class="head"><b dir="rtl"></b><button type="button" aria-label="Close">&#215;</button></div>
    <p class="w-open" hidden><span class="lab">commonly force read as</span><span class="slot"></span></p>
    <p class="r-now"><span class="k">reading</span><span class="v"></span></p>
    <p class="r-label">Exact selectable routes</p>
    <div class="r-pills"></div>
    <div class="d-card"><div class="d-body"></div><div class="d-foot"></div></div>
    <p class="prov"></p>
  </div>
  <script>
  // Finding is the search box's job, not a record's. A book has one name row
  // inside; here a reader may type that name any way hands actually type it —
  // "1 kings", "1-kings", "i-kings" — and reach the same address. The loose
  // matching is ours and lives only in this box.
  var norm = function (t) {
    t = String(t).toLowerCase();
    t = t.replace(/\\b(iii)\\b/g, "3").replace(/\\b(ii)\\b/g, "2").replace(/\\b(i)\\b/g, "1");
    return t.replace(/[^a-z0-9\\u0590-\\u05FF]+/g, "");
  };
  var atlasRows = [].slice.call(document.querySelectorAll(".atlas-row")).map(function (r) {
    var aw = r.querySelector(".aw");
    return { el: r, key: norm((r.getAttribute("data-p") || "") + " " + (aw ? aw.textContent : "") + " " + (r.getAttribute("href") || "")) };
  });
  var groups = [].slice.call(document.querySelectorAll(".workgroup")).map(function (g) {
    var names = [].slice.call(g.querySelectorAll(".en")).map(function (e) { return e.textContent; });
    [].slice.call(g.querySelectorAll(".he:not(.none)")).forEach(function (e) { names.push(e.textContent); });
    [].slice.call(g.querySelectorAll("a[href]")).forEach(function (a) {
      names.push(a.getAttribute("href").replace(/^\\//, "").replace(/\\?.*$/, ""));
    });
    return { el: g, keys: names.map(norm), first: g.querySelector("a.book") };
  });
  function sift() {
    var q = norm(document.getElementById("q").value);
    groups.forEach(function (g) {
      g.el.hidden = !!q && !g.keys.some(function (k) { return k.indexOf(q) >= 0; });
      // A live search opens the fold: the row that matched may stand behind
      // it, and a hit the reader cannot see is a miss. An emptied box folds
      // the groups back to rest.
      var d = g.el.querySelector("details.fold");
      if (d) d.open = !!q && !g.el.hidden;
    });
    // The atlas rows sift like the groups do: a row is hidden when it does
    // not match, so an opened family shows the matches and not the thousands
    // around them.
    atlasRows.forEach(function (r) {
      r.el.hidden = !!q && r.key.indexOf(q) < 0;
    });
    // The family frame follows its contents: hidden when everything inside
    // is, opened by a live match, restored to its resting state — carried on
    // the element itself — when the box empties.
    [].slice.call(document.querySelectorAll("section.family")).forEach(function (fs) {
      var any = [].slice.call(fs.querySelectorAll(".workgroup, .atlas-row")).some(function (g) { return !g.hidden; });
      fs.hidden = !!q && !any;
      var d = fs.querySelector("details.fam");
      if (d) d.open = q ? any : d.hasAttribute("data-rest-open");
    });
  }
  // ---- the word's own record, on the door ------------------------------
  // A family name's word opens the store's card for its exact key: readings
  // oldest source first, each with the license of the record that carries
  // it — the same law as the reader's HUD, fetched from the same store,
  // shard by shard as words are pressed. Pressing the word never toggles
  // the fold it sits in; the fold is the summary's, the word is its own.
  var STORE_BASE = "/${ENGINE}/data/route-store/";
  var storeIndex = null, shardCache = {};
  // The names are the declarations record's, embedded at build time — the
  // same record the reader fetches. An unknown posture prints verbatim.
  var POSTURE_NAMES = ${JSON.stringify(POSTURE_NAMES)};
  function licName(p) {
    p = String(p || "");
    if (!p) return "License unrecorded";
    return POSTURE_NAMES[p] || p;
  }
  function shardOf(k) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(k)).then(function (buf) {
      var b = new Uint8Array(buf)[0];
      return (b < 16 ? "0" : "") + b.toString(16);
    });
  }
  var wcard = document.getElementById("wcard"), wshade = document.getElementById("wshade");
  var bkcard = document.getElementById("bkcard");
  function closeCard() { wcard.hidden = true; bkcard.hidden = true; wshade.hidden = true; }
  wshade.addEventListener("click", closeCard);
  wcard.querySelector(".head button").addEventListener("click", closeCard);
  bkcard.querySelector(".head button").addEventListener("click", closeCard);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCard(); });
  // The book's own card: every field of it is a record already on this page —
  // the bridge id and the atlas counts ride on the row's own button, the
  // family frame is the family ledger's, and the one thing no ledger records
  // yet is said to be unrecorded rather than invented. The family's Hebrew
  // word inside the card opens the word's own record, the same way it does
  // from the family head.
  var FAM_FRAMES = ${JSON.stringify(Object.fromEntries(families.map((f) => {
    const r = titleReading(f.ledger.he_tokens || [], f.ledger.en);
    return [f.ledger.id, {
      he: famHeadHe(f.ledger),
      en: r ? f.ledger.en : f.members.map(plainId).join(" · "),
      att: r ? `attested: ${r.label}` : null,
      attTitle: r ? `${r.label}${r.year ? ` · ${r.year}` : ""} — attests this usage; a name is an identification, not licensed expression (FRAME v2.7)` : AWAITS_M,
    }];
  }))).replace(/</g, "\\u003c")};
  // The attribution table, lazily: the cleared v3 candidate, fetched once
  // on first card open — nothing rides the door's static bytes, and a
  // table that cannot be read leaves the band absent rather than wrong.
  var ATT_P = null;
  function loadAtt() {
    if (!ATT_P) ATT_P = fetch("/reader/data/work-attribution-display-v3.json")
      .then(function (r) { if (!r.ok) throw new Error("no table"); return r.json(); })
      .then(function (j) {
        if (j.schema !== "mishkan.oholiab.elijah_remote_work_attribution_display.v3") throw new Error("wrong schema");
        var m = {}; (j.rows || []).forEach(function (row) { m[row.work_id] = row; });
        return m;
      });
    return ATT_P;
  }
  function openBook(btn) {
    bkcard.querySelector(".head b").textContent = btn.getAttribute("data-w");
    bkcard.querySelector(".bk-en .en").textContent = btn.textContent.replace(/-/g, " ");
    var slot = bkcard.querySelector(".bk-fam .slot");
    var famId = btn.getAttribute("data-fam"), fam = famId ? FAM_FRAMES[famId] : null;
    if (fam) {
      // the register is the claim's, only when a record backs the claim
      slot.innerHTML = fam.he +
        '<span class="of"><span class="fr-lab"></span> <span class="en"></span><span class="chip"></span></span>';
      slot.querySelector(".of .fr-lab").textContent = fam.att ? "commonly force read as" : "listed in the catalog as";
      slot.querySelector(".of .en").textContent = fam.en;
      var famChip = slot.querySelector(".of .chip");
      if (fam.att) { famChip.textContent = fam.att; famChip.title = fam.attTitle; }
      else { famChip.textContent = "awaiting a named source"; famChip.title = fam.attTitle; }
    } else {
      slot.innerHTML = '<span class="he none">no name is on record</span>';
    }
    var num = function (x) { var v = Number(x); return isFinite(v) ? v.toLocaleString("en-US") : String(x); };
    bkcard.querySelector(".bk-n .of").textContent =
      num(btn.getAttribute("data-u")) + " units · " + num(btn.getAttribute("data-cr")) +
      " C0 rows · first row " + num(btn.getAttribute("data-cf"));
    // The work's standing in the frame — every book has one, always: it
    // serves, or it is held with its reason said where it stands, or it
    // awaits its text. No book is outside the system; a state is not an
    // absence.
    var ST = {
      PLANNED: "in the build plan — its page says whether it serves or is held, and why",
      SHARDS_STAGED: "its text is staged; the gates decide next, and a hold would be said here",
      AWAITING_SHARDS: "awaiting its text from custody — nothing is withheld; it has not arrived",
    };
    var stEl = bkcard.querySelector(".bk-st .of");
    var st = btn.getAttribute("data-st");
    stEl.textContent = ST[st] || ST.AWAITING_SHARDS;
    // a planned work's page is one tap away — the standing line is the way
    // in, not a description of a door somewhere else
    if (st === "PLANNED") {
      var a = document.createElement("a");
      a.href = "/" + btn.getAttribute("data-w").split("/").pop();
      a.textContent = "open its page";
      stEl.append(" · ", a);
    }
    // The attribution band — the cleared v3 candidate, root cards only,
    // exactly the payload's own display scope (no README, no work page, no
    // zone, no HUD). A display-ready row shows its credit line; the license
    // link rides only where the distribution row is ready too — a held link
    // says its held state in words; a display-held work shows nothing, fail
    // closed; serve is untouched, as the seal's boundary demands.
    var att = bkcard.querySelector(".bk-att");
    att.hidden = true;
    var attLine = att.querySelector(".att-line");
    attLine.textContent = "";
    var wid = btn.getAttribute("data-w");
    loadAtt().then(function (rows) {
      if (bkcard.hidden || bkcard.querySelector(".head b").textContent !== wid) return;
      var r = rows[wid];
      if (!r || String(r.display_state).indexOf("READY") !== 0) return;
      attLine.textContent = r.credit_line || "";
      if (String(r.distribution_state).indexOf("READY") === 0 && r.license_link) {
        attLine.appendChild(document.createTextNode(" \u00b7 "));
        var a = document.createElement("a"); a.href = r.license_link; a.target = "_blank"; a.rel = "noreferrer";
        a.textContent = "License terms"; attLine.appendChild(a);
      } else {
        var h = document.createElement("span"); h.className = "att-held";
        h.textContent = " \u00b7 license link held: " + String(r.distribution_state).toLowerCase().replace(/_/g, " ");
        attLine.appendChild(h);
      }
      att.hidden = false;
    }).catch(function () { /* an unreadable table leaves the band absent, never wrong */ });
    wcard.hidden = true;
    bkcard.hidden = false; wshade.hidden = false;
  }
  document.addEventListener("click", function (e) {
    var w = e.target.closest ? e.target.closest("button.aw[data-w]") : null;
    if (!w) return;
    e.preventDefault();          // the fold's toggle is the summary's default — cancelled
    e.stopPropagation();
    openBook(w);
  }, true);
  // A PRESS ON THE DOOR RULES THE FORM, the same as it does inside a book.
  // It did not: the card repainted its own body and the gloss on the page
  // behind it never moved, so a reader who chose a reading watched the card
  // close and the old word come back. The reader's choice is the law of the
  // page — that is the rule everywhere else here — and a door that offers a
  // choice it then discards is offering nothing.
  //
  // What is kept is the reading and the record under it, never one without the
  // other: the page's own law is that a reading and its terms are shown
  // together or not at all, so a ruling carries its witness, its year and its
  // licence and repaints all three. It is kept per reader, in this browser,
  // and it is a display order and not a claim about the text — the catalogue's
  // own order stands underneath it, unchanged, for anyone who has ruled
  // nothing.
  var RULED_KEY = "fh.door.ruled";
  var RULED = (function () {
    try { return JSON.parse(localStorage.getItem(RULED_KEY) || "{}") || {}; } catch (e) { return {}; }
  })();
  function glossesFor(key) {
    var out = [];
    var btns = document.querySelectorAll('.fw[data-k]');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute("data-k") !== key) continue;
      var host = btns[i].closest(".fam-he");
      var g = host && host.querySelector(".g");
      if (g) out.push(g);
    }
    return out;
  }
  function paintGloss(key, r) {
    var gs = glossesFor(key);
    for (var i = 0; i < gs.length; i++) {
      gs[i].replaceChildren(r.text);
      if (r.lic) {
        var chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = r.lic;
        chip.title = (r.m || "") + (r.year ? " \u00b7 " + r.year : "");
        gs[i].append(chip);
      }
      gs[i].title = r.text + (r.m ? " \u2014 " + r.m : "");
      gs[i].classList.add("ruled");
    }
    return gs.length;
  }
  function rule(key, row) {
    var m = (storeIndex && storeIndex.m_sources ? storeIndex.m_sources : {})[row[3]] || {};
    var r = { text: row[1], lic: licName(m.licensePosture), m: m.label || row[3],
              year: row[4] && row[4] !== "S_NO_SOURCE_YEAR" ? row[4] : "" };
    RULED[key] = r;
    try { localStorage.setItem(RULED_KEY, JSON.stringify(RULED)); } catch (e) { /* a reader who blocks storage still rules this page, just not the next one */ }
    paintGloss(key, r);
  }
  // and on arrival, every ruling this reader has already made
  function applyRulings() {
    for (var key in RULED) if (Object.prototype.hasOwnProperty.call(RULED, key)) paintGloss(key, RULED[key]);
  }

  // One selected reading at a time, and the record under it is the record of
  // that reading — the reader's law, the reader's card. A pill press moves the
  // selection and repaints the record; nothing else on the door moves.
  function paint(rows, idx, idx0) {
    var r = rows[idx], m = (storeIndex.m_sources || {})[r[3]] || {};
    wcard.querySelector(".r-now .v").textContent = r[1];
    [].slice.call(wcard.querySelectorAll(".r-pills button")).forEach(function (b, i) {
      b.setAttribute("aria-pressed", i === idx ? "true" : "false");
    });
    var body = wcard.querySelector(".d-body");
    body.textContent = r[2] || r[1];
    var foot = wcard.querySelector(".d-foot");
    foot.replaceChildren();
    foot.append((m.label || r[3]) + (r[4] && r[4] !== "S_NO_SOURCE_YEAR" ? " \u00b7 " + r[4] : ""));
    var chip = document.createElement("span"); chip.className = "lic-chip";
    chip.textContent = licName(m.licensePosture); foot.append(chip);
    if (m.licensePointer) {
      var a = document.createElement("a"); a.href = m.licensePointer; a.target = "_blank";
      a.rel = "noreferrer"; a.textContent = "License terms";
      foot.append(" ", a);
    }
    // P · the grouper for M, when two M report the exact same D. One reading
    // stands on one record; when another source carries that same record it
    // is corroboration, and a card that shows one source for a definition two
    // sources carry is quietly under-reporting what the store holds. Pressing
    // a corroborating source goes to how that source read it.
    // P counts M, not rows. One provider's entry can separate into many
    // readings on the declaration's own marks — Strong's alone splits into
    // nineteen for one form — and every piece carries that provider's single
    // record. Counting rows called one source eighteen; the grouper is M.
    var D = r[2] || r[1] || "";
    var also = [], seenM = {};
    seenM[r[3]] = 1;
    for (var j = 0; j < rows.length; j += 1) {
      if (j === idx) continue;
      if ((rows[j][2] || rows[j][1] || "") !== D) continue;
      if (seenM[rows[j][3]]) continue;
      seenM[rows[j][3]] = 1;
      also.push(j);
    }
    if (!also.length) return;
    var P_INLINE = 3;
    var line = document.createElement("p"); line.className = "d-also";
    var lab = document.createElement("span"); lab.className = "d-also-lab";
    lab.textContent = "the same record, carried by " + also.length + " more source" + (also.length === 1 ? "" : "s");
    line.append(lab);
    var srcBtn = function (j) {
      var mj = (storeIndex.m_sources || {})[rows[j][3]] || {};
      var btn = document.createElement("button"); btn.type = "button"; btn.className = "d-also-m";
      btn.append((mj.label || rows[j][3]) + " · " + (rows[j][4] && rows[j][4] !== "S_NO_SOURCE_YEAR" ? rows[j][4] : "no source year"));
      var c2 = document.createElement("span"); c2.className = "lic-chip";
      c2.textContent = licName(mj.licensePosture); btn.append(c2);
      var rd = document.createElement("span"); rd.className = "d-also-read";
      rd.textContent = "reads it \u201c" + rows[j][1] + "\u201d";
      btn.append(rd);
      btn.addEventListener("click", function (ev) { ev.stopPropagation(); paint(rows, j); });
      return btn;
    };
    also.slice(0, P_INLINE).forEach(function (j) { line.append(srcBtn(j)); });
    if (also.length > P_INLINE) {
      var restJ = also.slice(P_INLINE);
      var sel = document.createElement("select"); sel.className = "d-also-more";
      var o0 = document.createElement("option"); o0.value = "";
      o0.textContent = restJ.length + " more source" + (restJ.length === 1 ? "" : "s") + "\u2026";
      sel.append(o0);
      restJ.forEach(function (j, i2) {
        var mj = (storeIndex.m_sources || {})[rows[j][3]] || {};
        var o = document.createElement("option"); o.value = String(i2);
        o.textContent = (mj.label || rows[j][3]) + " \u00b7 " + rows[j][4] + " \u00b7 reads it \u201c" + rows[j][1] + "\u201d";
        sel.append(o);
      });
      sel.addEventListener("change", function (ev) {
        ev.stopPropagation();
        var j = restJ[Number(sel.value)];
        if (j !== undefined) paint(rows, j);
      });
      line.append(sel);
    }
    // the body scrolls, the foot is pinned — corroboration goes in the part
    // that can yield, so the source line beneath it never can
    body.append(line);
  }
  function openCard(surface, key, book, bookName, bookAtt, bookAttTitle) {
    wcard.querySelector(".head b").textContent = surface;
    wcard.querySelector(".head b").setAttribute("lang", "he");
    // The book layer, by the owner's ruling: a title's words are corpus text
    // and open their records; the force-read English is a separate function
    // entirely — press it and you are in the book. The same split every
    // hierarchically higher text keeps: Hebrew opens the record, the
    // force-read name is the door. So the band wears the site's one label
    // for an English name, and the name itself is the link. Built here
    // rather than sitting in the page as an empty anchor: the door's links
    // are checked, and a link to nowhere is a link.
    var wo = wcard.querySelector(".w-open"), woSlot = wo.querySelector(".slot");
    woSlot.replaceChildren();
    if (book) {
      // the register follows the evidence: the claim label only with the
      // record's force license riding beside the name, the bridge register
      // and the awaiting note when nothing backs it
      wo.querySelector(".lab").textContent = bookAtt ? "commonly force read as" : "listed in the catalog as";
      var a = document.createElement("a");
      a.href = book; a.className = "wo-link";
      a.textContent = bookName || book.slice(1).replace(/-/g, " ");
      a.title = "opens the book itself \u2014 a separate act from reading this word\u2019s record";
      woSlot.append(a);
      var mark = document.createElement("span");
      if (bookAtt) { mark.className = "chip"; mark.textContent = bookAtt; mark.title = bookAttTitle || ""; }
      else { mark.className = "of"; mark.textContent = "awaiting a named source"; mark.title = "the recorded id read plainly \u2014 an English name waits on an attested usage"; }
      woSlot.append(mark);
    }
    wo.hidden = !book;
    var pills = wcard.querySelector(".r-pills");
    wcard.querySelector(".r-now .v").textContent = "reading the records\u2026";
    wcard.querySelector(".r-now .v").className = "v none";
    pills.replaceChildren();
    wcard.querySelector(".d-body").textContent = "";
    wcard.querySelector(".d-foot").replaceChildren();
    wcard.querySelector(".prov").textContent = "";
    wcard.hidden = false; wshade.hidden = false;
    var idxP = storeIndex ? Promise.resolve(storeIndex)
      : fetch(STORE_BASE + "index.json").then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { storeIndex = j; return j; });
    Promise.all([idxP, shardOf(key)]).then(function (pair) {
      var idx = pair[0], sh = pair[1];
      if (!idx) { wcard.querySelector(".r-now .v").textContent = "the store\u2019s index could not be read"; return null; }
      var url = STORE_BASE + "shards/" + sh + ".bin" + (idx.store_version ? "?v=" + idx.store_version : "");
      var shP = shardCache[sh] ? Promise.resolve(shardCache[sh])
        : fetch(url).then(function (r) { return r.ok ? r.body.pipeThrough(new DecompressionStream("gzip")) : null; })
          .then(function (s) { return s ? new Response(s).json() : null; })
          .then(function (j) { shardCache[sh] = j; return j; });
      return shP.then(function (shard) {
        var rows = (shard && shard[key]) || [];
        if (!rows.length) {
          wcard.querySelector(".r-now .v").textContent = "no reading in the catalog for this form";
          return;
        }
        // oldest source first — the same order the reader's own card uses, and
        // the same one the masthead's chip is chosen by
        rows = rows.slice().sort(function (a, b) {
          var ya = parseInt(a[4], 10), yb = parseInt(b[4], 10);
          ya = isNaN(ya) ? 9e9 : ya; yb = isNaN(yb) ? 9e9 : yb;
          return (ya - yb) || (a[0] - b[0]);
        });
        wcard.querySelector(".r-now .v").className = "v";
        rows.forEach(function (r, i) {
          var m = (idx.m_sources || {})[r[3]] || {};
          var b = document.createElement("button");
          b.type = "button"; b.textContent = r[1];
          b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
          b.title = (r[4] && r[4] !== "S_NO_SOURCE_YEAR" ? r[4] + " \u00b7 " : "") + (m.label || r[3]);
          b.addEventListener("click", function () { paint(rows, i); rule(key, rows[i]); });
          pills.append(b);
        });
        // the reading this reader ruled opens selected, so the card agrees with
        // the page instead of arguing with it
        var start = 0;
        if (RULED[key]) for (var q = 0; q < rows.length; q++) if (rows[q][1] === RULED[key].text) { start = q; break; }
        paint(rows, start);
        wcard.querySelector(".prov").textContent =
          rows.length + " reading" + (rows.length === 1 ? "" : "s") + " \u00b7 oldest source first \u00b7 " +
          (idx.rule_id || "the route store");
      });
    }).catch(function () { wcard.querySelector(".r-now .v").textContent = "the store could not be reached"; });
  }
  document.addEventListener("click", function (e) {
    var w = e.target.closest ? e.target.closest(".fw[data-k]") : null;
    if (!w) return;
    e.preventDefault();          // the fold's toggle is the summary's default — cancelled
    e.stopPropagation();
    openCard(w.textContent, w.getAttribute("data-k"),
      w.getAttribute("data-book"), w.getAttribute("data-bookname"),
      w.getAttribute("data-bookatt"), w.getAttribute("data-bookatttitle"));
  }, true);
  // THE HOVER SPEAKS IN THE PAGE'S OWN VOICE. What a chip or a name says on
  // hover is the browser's tooltip: a white box with square corners and a
  // system font, in a page that allows neither. It is also the only place a
  // reader meets a witness's terms without pressing anything, so it is not
  // decoration to leave to the platform. The title is taken off the element,
  // kept on it under another name so nothing is lost, and drawn in the linen
  // and the gold the rest of the page is drawn in.
  var tip = document.createElement("div");
  tip.className = "tip"; tip.hidden = true; document.body.appendChild(tip);
  function tipFor(el) {
    var t = el.getAttribute("title");
    if (t) { el.setAttribute("data-tip", t); el.removeAttribute("title"); }
    return el.getAttribute("data-tip");
  }
  function showTip(el) {
    var t = tipFor(el);
    if (!t) return;
    tip.textContent = t; tip.hidden = false;
    var r = el.getBoundingClientRect(), tr = tip.getBoundingClientRect();
    var x = Math.min(Math.max(8, r.left), window.innerWidth - tr.width - 8);
    var y = r.bottom + 8 + tr.height > window.innerHeight ? r.top - tr.height - 8 : r.bottom + 8;
    tip.style.left = Math.round(x) + "px"; tip.style.top = Math.round(Math.max(8, y)) + "px";
  }
  function hideTip() { tip.hidden = true; }
  document.addEventListener("mouseover", function (e) {
    var el = e.target.closest ? e.target.closest("[title],[data-tip]") : null;
    if (el) showTip(el); else hideTip();
  });
  document.addEventListener("mouseout", function (e) {
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest("[data-tip]")) hideTip();
  });
  document.addEventListener("scroll", hideTip, true);
  window.addEventListener("blur", hideTip);
  // a keyboard reader gets it too, on focus, and loses it on escape
  document.addEventListener("focusin", function (e) {
    var el = e.target.closest ? e.target.closest("[title],[data-tip]") : null;
    if (el) showTip(el);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideTip(); });
  applyRulings();
  function go(e) {
    e.preventDefault();
    var live = groups.filter(function (g) { return !g.el.hidden; });
    if (live.length && document.getElementById("q").value.trim()) location.href = live[0].first.getAttribute("href");
    return false;
  }
  </script>
  <!-- A book's own title is corpus text and is not printed here. This page
       carries no records, so it can cite nothing; it says only how each book is
       commonly named, and the title itself waits inside, where it opens. -->
  <footer><a href="/demonstrations/">the rules of the frame, each shown on a passage this reader opens</a> \u00b7 Every record carried here keeps its own licence, shown beside it wherever it prints. The counts this build measured, at their exact grains, stand in <a href="/front-door-counts-receipt-v1.json">the count receipt</a> \u2014 recomputed from the books\u2019 own bytes every time, and no longer printed across the front page, where four figures in the billions told a reader nothing.
  <p class="open-claim">This site is noncommercial: nothing is sold here, no advertising runs here, and no payment is taken here — declared 2026-08-30, and standing as long as this page serves. Some of the dictionary records carried here were released under noncommercial terms, and this declaration is how those terms are honored. Every carried record keeps its own license, shown beside it wherever it prints. Everything this site adds of its own — its pages, its arrangement, its receipts, its words — is dedicated to the public domain under <a href="https://creativecommons.org/publicdomain/zero/1.0/" rel="license">CC0 1.0</a>: take it, reuse it, build on it, no permission needed. What each carried record allows is the record's own license to say.</p></footer>
</main>
</body>
</html>
`;
const doc = pageDoc({
  title: SITE_NAME,
  h1: SITE_NAME,
  sub: "A Hebrew reader on a sealed chain. Every reading traces to the record that carries it, and every record to the license it was released under.",
  counts: true,
  // THE READER PANEL IS OFF. It printed the opening words of whichever book
  // sorts first, each with its gloss and its licence, as a live sample of the
  // reader — and the owner, looking at his own door, could not tell what it
  // was (2026-09-06). A panel that has to be explained is not a demonstration,
  // it is a delay: it stood between a reader and the books, and the page that
  // shows the frame working properly, with a caption per rule, is linked two
  // lines below it. The builder still derives it, so turning this back on is
  // one word.
  demo: false,
  altLink: `<a class="face alt-face" href="/census/" title="every work the bridge records that does not serve yet — nothing hidden, nothing promised">the census</a>`,
  sections: sectionsHtml,
});
const censusPageDoc = pageDoc({
  title: `the census · ${SITE_NAME}`,
  h1: "the census",
  sub: "Every work the bridge records that does not serve yet. Nothing here is hidden and nothing is promised: each row carries its recorded id, its measured size, and — on its card — what it awaits. The same records, the same cards, the same laws as the door.",
  counts: false,
  demo: false,
  altLink: `<a class="face alt-face" href="/" title="back to the shelf">the door</a>`,
  sections: censusPageSections,
});

// ---- the other face of the door ------------------------------------------
//
// The README described a proof slice of two verses with two commentators on it,
// months after the two books and their commentary had shipped whole. Nobody
// lied; it was written once and never had a reason to change. So it is written
// from the same counts as the page.
// A work is withheld because the record says so, not because no zone happened
// to answer for it. This list used to be derived from the absence of a file,
// which meant a zone deleted by accident printed the same honest-looking page
// as a work deliberately held, and nothing anywhere could tell the two apart.
// So the plan carries the state, this reads it, and the two ways they can
// disagree are both errors rather than pages.
const withheldBooks = BOOKS.filter((b) => b.serve_state === "WITHHELD");
const servedWithNoZone = BOOKS.filter((b) => b.serve_state !== "WITHHELD" && !books.some((x) => x.slug === b.slug));
if (servedWithNoZone.length) {
  console.error("A_SERVED_WORK_HAS_NO_ZONE — refusing to build the door.");
  for (const b of servedWithNoZone)
    console.error(`  ${b.work_id} is not withheld in the record and ${join(ZONES, b.zone)} does not answer for it`);
  console.error("  Either the zone build did not run, or the work is being held — and a holding is declared in the record, never left to an absent file.");
  process.exit(2);
}
const heldWithAZone = withheldBooks.filter((b) => books.some((x) => x.slug === b.slug));
if (heldWithAZone.length) {
  console.error("A_WITHHELD_WORK_BUILT_A_ZONE — refusing to build the door.");
  for (const b of heldWithAZone)
    console.error(`  ${b.work_id} is withheld in the record and ${b.zone} was built anyway`);
  process.exit(2);
}
const titleCase = (t) => String(t).split("-").map((w) =>
  (w.length <= 2 && w === w.toLowerCase() && /^[ivx]+$/.test(w)) ? w.toUpperCase()
    : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// The README is for somebody arriving at the repository, and what they need is
// the rules this code is held to — not a snapshot of the corpus. Counts moved
// out entirely: they were three copies of numbers the receipt already carries,
// they went stale on every build, and a rendered-records figure tells
// a reader nothing they could act on. Grain vocabulary went with them. What is
// left is what stays true between builds, so this file changes when the design
// changes and not when a work lands.
const readme = `# ${SITE_NAME}

A Hebrew reader on a sealed chain. Every reading printed under a word traces to
the record that carries it, and every record to the license it was released
under. No English is forced: a word offers every reading its sources attest, one
at a time, and the reader chooses.

${SITE_URL ? `Live site: ${SITE_URL}\n` : ""}
## What is served, and how much of it

The front page lists every work and counts what it holds. Exact figures, per-work
byte hashes and the inputs they were computed from are in
\`front-door-counts-receipt-v1.json\`, regenerated by every build. Those are the
authority; nothing here restates them.

A work whose address answers but whose text is not served says so at that
address, and returns when what it is waiting on is settled.

## Openness and the noncommercial declaration

This site is noncommercial: nothing is sold, no advertising runs, and no
payment is taken — declared 2026-08-30, standing as long as the site serves.
Some dictionary records carried here were released under noncommercial terms,
and this declaration is how those terms are honored.

Everything this site adds of its own — pages, arrangement, receipts, prose —
is dedicated to the public domain under CC0 1.0
(https://creativecommons.org/publicdomain/zero/1.0/). Every carried record
keeps its own license, printed beside it wherever it appears and carried into
every export; what a record allows is that record's own license to say.

## The rules this code is held to

Read these before changing anything. Each is enforced by a check named in
\`${ENGINE}/PIPELINE-MANIFEST.md\`, which is generated and lists
every rule the code declares along with the check that guards it — and, at the
end of a run, what the checks do not cover.

- **Nothing is typed that the record can say.** No page and no tool supplies a
  character of the text, a work's name, a count, or a license. Where you find a
  literal standing in for a record, that is the bug.
- **One reader.** A per-book page would be a second place for the standard not
  to apply, so there is not one.
- **A license travels with the text it covers**, is named on the page the text
  is read from and in anything exported from it, and is never inherited from
  the book a work sits in.
- **A key keeps what the source wrote.** Points and cantillation come off; the
  boundary maqaf stays, in place. A word written with one keys with it and is
  never fused.
- **The reader may not draw finer than the record proves.** Where a record
  scopes a claim to a verse, the page draws it at the verse.
- **A refusal is printed, not swallowed.** A reading that cannot be traced is
  named as untraceable rather than quietly dropped.

## Building and checking

\`\`\`
cd ${ENGINE}
./build.sh <mirror> <bridge.csv.gz> <serves> <YYYY-MM-DD>
tools/run-all-checks.sh
\`\`\`

The build runs from sealed inputs and is re-runnable: the same inputs give the
same bytes. The checks run against the rendered page rather than the source.
They sweep every work that is served, they name what they skipped and why, and
a run that could not reach its inputs is counted apart from one that passed —
an empty run must never read as a clean one.

## Two lanes

The corpus lane acquires, verifies and seals the text, the definition records
and the identity ledgers. Nothing in this repository reaches past what that lane
has sealed. The synthesis lane — this repository — builds the reader from those
artifacts and may not add a character to them.

## Licensing

There is no single license. Every work carries its own, computed from its own
records. Nothing here is licensed as a whole, and nothing inherits a license
from what it sits beside.

Served from the \`gh-pages\` branch.

`;

// The work's address serves the reader itself. There is no second hop, no
// ?b=&clean= handshake, and no address rewrite: the address a reader keeps
// is the address the page is served from. zone.html stays the one
// hand-written reader; this emits it with two generated lines in its head —
// which work this page is, and where the reader's own files live — both
// derived at build time, neither typed. The bare instrument zone.html still
// answers ?b= for the checks, and with neither meta nor query it names no
// book and says so.
const ZONE_HTML = readFileSync(arg("reader", "zone.html"), "utf8");

// THE ENGINE IS ONE FILE, NOT THREE THOUSAND COPIES OF ONE FILE.
//
// An address page is zone.html verbatim, and zone.html carries its whole
// reader inline: 71,734 bytes of CSS in the head and 244,582 bytes of script
// in the body. Emitted into every address that is 0.91 GB of the same bytes
// written 3,074 times, and it took the published tree to 1.08 GB against
// GitHub Pages' 1 GB limit. The site was over the line it is served from.
//
// The cut is made HERE and not in zone.html. zone.html stays the one
// hand-written reader with everything inline, because it is the bare
// instrument every check opens at ?b=, and moving its own blocks out would
// change what those checks read and hard-wire the engine's directory into a
// file that should not know it. The build knows the directory. So the build
// does the replacement, and only for the pages it emits.
//
// The filenames carry the content hash, which the corpus lane asked for and
// is right: the file is immutable, it can be cached forever, and a page that
// asks for an engine that is no longer there gets a loud 404 instead of
// quietly running a stale copy that still answers to its old name.
//
// The script tag stands exactly where the inline block stood — in the body,
// with no defer and no async. An external script at that position executes
// at that point in document order, which is what the inline block did. Adding
// defer would move it after parsing and change the reader's behavior, so it
// is not added.
const engineBlocks = (() => {
  // Every block of each kind, then the largest one. NOT a single regex with a
  // minimum length: "at least 20,000 characters, lazily, up to </script>"
  // starts at the FIRST script — the 865-byte theme setter — runs straight
  // past its own closing tag to reach the minimum, and then stops at the next
  // one. That captured 320,410 bytes spanning all three blocks, wrote the
  // stylesheet into the .js file, and left the real engine inline. A pattern
  // that can cross a closing tag is a pattern that will.
  const all = (tag) => [...ZONE_HTML.matchAll(new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)</${tag}>`, "g"))];
  const largest = (tag) => all(tag).sort((a, b) => b[2].length - a[2].length)[0];
  const style = largest("style"), script = largest("script");
  if (!style || !script || style[2].length < 20000 || script[2].length < 20000)
    throw new Error("zone.html no longer carries the inline engine blocks this build extracts — refusing to emit pages that would silently keep them inline");
  // and they must be disjoint, which is the thing the old pattern got wrong
  const sEnd = style.index + style[0].length, jEnd = script.index + script[0].length;
  if (style.index < jEnd && script.index < sEnd)
    throw new Error("the style and script blocks this build extracts overlap — refusing to emit");
  return {
    css: { whole: style[0], body: style[2], name: `engine-${sha256(Buffer.from(style[2])).slice(0, 12)}.css` },
    js: { whole: script[0], body: script[2], name: `engine-${sha256(Buffer.from(script[2])).slice(0, 12)}.js` },
  };
})();

// Written beside zone.html, which is the served engine directory. Older
// engines are removed first: a hash-named file nothing references is a file
// that will be served forever because nothing ever asks whether it is still
// needed.
{
  const here = dirname(fileURLToPath(import.meta.url));
  const engineDir = join(here, "..");
  for (const f of readdirSync(engineDir))
    if (/^engine-[0-9a-f]{12}\.(js|css)$/.test(f) && f !== engineBlocks.css.name && f !== engineBlocks.js.name)
      unlinkSync(join(engineDir, f));
  writeFileSync(join(engineDir, engineBlocks.css.name), engineBlocks.css.body);
  writeFileSync(join(engineDir, engineBlocks.js.name), engineBlocks.js.body);
}

const readerPage = (b) => {
  const anchor = "<title>";
  if (!ZONE_HTML.includes(anchor))
    throw new Error("zone.html lost its <title> anchor — refusing to emit a work page");
  // A DEMONSTRATION IS THE READER, AT ITS OWN ADDRESS. Same page, same card,
  // same everything; two extra metas say which address it stands at and
  // which rule it demonstrates. The rule's plain English is written once, in
  // the demonstration record, and rides in here — the page never re-words it.
  const metas =
    `<meta name="reader-book" content="${b.slug}">\n` +
    `<meta name="reader-home" content="/${ENGINE}/">\n` +
    `<meta name="site-name" content="${SITE_NAME}">\n` +
    (b.demonstration ? `<meta name="reader-demonstration" content="${esc(b.demonstration)}">\n` : "") +
    `<link rel="canonical" href="${b.canonical || `/${b.slug}`}">\n`;
  return ZONE_HTML
    .replace(anchor, metas + anchor)
    .replace(engineBlocks.css.whole, `<link rel="stylesheet" href="/${ENGINE}/${engineBlocks.css.name}">`)
    .replace(engineBlocks.js.whole, `<script src="/${ENGINE}/${engineBlocks.js.name}"></script>`);
};

// The only Hebrew this page may print is a title carried from a zone — the
// ledger's own word, shown in the masthead's frame. Scrub every carried title
// out and no Hebrew may remain: anything left is a character this page cannot
// stand behind. Checked here rather than trusted, because this file is
// generated and a generator can drift too.
const HEBREW = /[\u0590-\u05FF]/;
const scrubTitles = (text) => {
  // Two kinds of Hebrew stand on this page and both are records: the carried
  // zone titles, and the atlas rows' recorded ids (some ids hold the work's
  // own Hebrew title). One list, longest first — a carried title can sit
  // inside a recorded id (Genesis inside a Ben-Yehuda essay named for it),
  // and scrubbing the short one first would cut it out of the long one's
  // middle and orphan the remainder as Hebrew nobody owns.
  const known = [];
  for (const b of books) if (b.he) known.push(b.he);
  for (const lf of LEDGER.families) if (lf.he) for (const t of lf.he_tokens) known.push(t.s);
  // the titles the zones themselves claim from their own C0 — carried
  // records, the exact category this scrub exists to allow
  for (const zi of ZONE_INFO.values()) for (const t of zi.heTokens) known.push(esc(t.s));
  // the working verse (demo-verse-rule-v1): the first zone's opening words,
  // records cut from its own serve — the same rule the gates re-derive. The
  // keys ride too: a vocalized surface folds to a consonantal key, and the
  // key is as much the record's as the surface it folds from.
  if (demo) for (const w of demo.words) { known.push(esc(w.s)); if (w.k) known.push(esc(w.k)); }
  for (const f of Object.values(ATLAS.families))
    for (const w of f.works) if (HEBREW.test(w.id)) known.push(esc(w.id.split("/").pop()));
  known.sort((a, b) => b.length - a.length);
  let t = text;
  for (const nm of known) t = t.split(nm).join("");
  return t;
};
{
  const residue = scrubTitles(doc);
  const hit = residue.search(HEBREW);
  if (hit >= 0) throw new Error("the front door printed a character of the text beyond the carried titles — refusing output · at: "
    + JSON.stringify(residue.slice(Math.max(0, hit - 80), hit + 40)));
}

if (HEBREW.test(readme)) throw new Error("the README printed a character of the text — refusing output");

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "index.html"), doc);
mkdirSync(join(OUT, "census"), { recursive: true });
writeFileSync(join(OUT, "census", "index.html"), censusPageDoc);
// The demonstrations, at their own address.
//
// They were going to sit on the front door and the door refused to emit them:
// "printed a character of the text beyond the carried titles." That refusal was
// right and is the reason this page exists separately. On the door, a typed
// string sits beside strings the chain carried and a reader cannot tell which
// is which. Here, the page says what it is before it says anything else.
{
  // The index says the eight rules and links each to its passage. It prints
  // no Hebrew at all: every character of every passage is in the zone the
  // link opens, where the reader's own card answers for it.
  // THREE POSTURES, NOT TWO, AND THE BADGE SAYS WHICH. A passage can be
  // carried whole, carried with one mark typed into it because no source we
  // hold writes that mark there, or typed outright. The middle case is the one
  // a badge reading "carried" would quietly flatter, so it gets its own words
  // and its own sentence naming the reason. The tier comes from the record.
  const TIER_WORD = {
    CARRIED_FROM_A_NAMED_SOURCE: ["carried", "carried"],
    CARRIED_WITH_THE_MARK_TYPED: ["carried, mark typed", "part-typed"],
    TYPED_BECAUSE_NO_SOURCE_WE_HOLD_CARRIES_IT: ["typed", "typed"],
  };
  const tierWord = (r) => (TIER_WORD[r.tier] || [r.carried_from ? "carried" : "typed", r.carried_from ? "carried" : "typed"]);
  const rulePage = (r) => {
    const c = r.carried_from;
    const [word, cls] = tierWord(r);
    return `    <article class="rd" data-id="${esc(r.id)}">
      <p class="rd-head"><span class="rd-n">${esc(r.n)}</span><span class="rd-kind">${esc(r.name_en)}</span><span class="rd-letter">${esc(r.letter)}</span><span class="rd-tier rd-${cls}">${esc(word)}</span></p>
      <p class="rd-law">${esc(r.the_c0_law)}</p>
      <p class="rd-plain">${esc(r.plainly)}</p>
      <p class="rd-src">${c
        ? `The passage is ${esc(c.work_id)} ${esc(c.unit_id)}, printed as ${esc(c.source)} wrote it${c.receipt_note ? ` \u2014 ${esc(c.receipt_note)}` : ""}.`
        : `No source this project holds carries this mark, so the passage is typed: ${esc((r.typed || {}).why || "")}${(r.typed || {}).where_the_wire_goes ? ` When the record lands it arrives at ${esc(r.typed.where_the_wire_goes)}, and this passage is replaced by the book.` : ""}`}${
        r.typed_rows_why ? ` The mark itself is typed, and the page says so on the word it is typed on: ${esc(r.typed_rows_why)}.` : ""}</p>
      <p class="rd-open"><a href="/demonstrations/${esc(r.id)}/">open the passage and press ${esc(r.press || "a word")}</a></p>
    </article>`;
  };
  const idx = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The eight rules \u00b7 ${SITE_NAME}</title>
<link rel="canonical" href="/demonstrations/">
<meta name="robots" content="noindex">
<style>${DOOR_CSS}${STAMP_CSS}</style>
</head><body><main>
  <p class="poc-back"><a href="/">${SITE_NAME}</a></p>
  <h1>The eight rules</h1>
  <p class="sub">${esc(RD.what)}</p>
  <p class="pc-law">${esc(RD.the_law_every_card_obeys)}</p>
${RD.rules.map(rulePage).join("\n")}
  <footer>${esc(RD.the_fence)} Recorded in data/rule-demonstrations-v1.json; the passages are built into zones by tools/build-demonstrations-v1.mjs and opened by the reader itself, so what answers a press here is the card that answers on every book.</footer>
</main></body></html>`;
  // Its own directory, made here rather than assumed: every other page in
  // this builder makes the folder it writes into, and this one relied on a
  // previous build having left one behind. That held until the first build
  // into a clean tree, which is exactly the build that has to work.
  mkdirSync(join(OUT, "demonstrations"), { recursive: true });
  writeFileSync(join(OUT, "demonstrations", "index.html"), idx);
  let rdPages = 0;
  for (const r of RD.rules) {
    const slug = `fixture-rule-${r.id}`;
    if (!existsSync(join(ZONES, `${slug}.bin`))) continue;
    mkdirSync(join(OUT, "demonstrations", r.id), { recursive: true });
    writeFileSync(join(OUT, "demonstrations", r.id, "index.html"),
      readerPage({ slug, canonical: `/demonstrations/${r.id}`, demonstration: r.plainly }));
    rdPages += 1;
  }
  console.log(`  demonstrations: 1 index + ${rdPages} rule page(s) of ${RD.rules.length}`);
}

writeFileSync(join(OUT, "README.md"), readme);
writeFileSync(join(OUT, "front-door-counts-receipt-v1.json"), countReceiptJson);
// One page, used at a withheld work's own address and at any historical address
// that pointed to it. A withdrawal does not release a published address; it
// changes what the address has to say. The build after the work returns writes
// the ordinary stub over this one, because both are derived from the zones on
// disk and neither is typed into a list.
// The reason a work is held is a fact in the record, so the page prints the
// record's sentence rather than one typed here. A page that says the same
// thing about every held work is a page that stops being read.
// A withholding carries its own provenance onto the page, the same as every
// other claim here. A sentence this lane wrote and a status a ledger issued
// are different kinds of thing, and a reader is entitled to know which one is
// keeping a book from them.
const heldFrom = (b) => {
  if (!b || b.serve_state !== "WITHHELD") return "";
  if (b.withheld_basis === "SEALED_HOLD_LEDGER") return `Held by the record: ${b.withheld_from}`;
  return `Held by this lane, not yet by a record: ${b.withheld_from}`;
};
const heldPage = (reason = "", from = "") => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Withheld · ${SITE_NAME}</title>
<link rel="canonical" href="/">
<script>
// Two faces, both the record's: linen by day, the tent by night. The device
// decides until the reader chooses; the choice stays on the device.
(() => {
  const root = document.documentElement;
  let held = null;
  try { held = localStorage.getItem("scheme"); } catch { /* still reads */ }
  const sys = matchMedia("(prefers-color-scheme: light)");
  const apply = () => { root.dataset.scheme = held === "day" || held === "night" ? held : (sys.matches ? "day" : "night"); };
  apply();
  if (sys.addEventListener) sys.addEventListener("change", apply);
  window.__face = { set(v) { held = v; try { localStorage.setItem("scheme", v); } catch { /* still reads */ } apply(); } };
})();
</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0d0a14;
  color:#b2a489;font:16px/1.6 Georgia,serif;padding:2rem;text-align:center}
  a{color:#eac86f} p{max-width:34rem} .prov{font-size:.82em;color:#8b7f69}
  :root[data-scheme="day"] body{background:#f1e9d8;color:#5f5645}
  :root[data-scheme="day"] a{color:#8a6b26} :root[data-scheme="day"] .prov{color:#7b7058}</style>
</head>
<body><p>This address is kept, and the work behind it is not being served.<br><br>
${reason ? esc(reason) + "<br><br>" : ""}Nothing is shown in the meantime, and the
address returns here when the holding ends.<br><br>
${from ? `<span class="prov">${esc(from)}</span><br><br>` : ""}<a href="/">${SITE_NAME}</a></p>
</body>
</html>
`;
for (const b of withheldBooks) {
  mkdirSync(join(OUT, b.slug), { recursive: true });
  writeFileSync(join(OUT, b.slug, "index.html"), heldPage(b.withheld_reason, heldFrom(b)));
}
for (const b of books) {
  mkdirSync(join(OUT, b.slug), { recursive: true });
  const r = readerPage(b);
  // The reader supplies no character of the text; a work page is the reader.
  if (HEBREW.test(r)) throw new Error(`${b.slug}: the work page printed a character of the text — refusing output`);
  writeFileSync(join(OUT, b.slug, "index.html"), r);
}
// Every zone on the shelf answers at its own address — the fleet's works
// included. The page is the reader, stamped with the bin's own name; the
// only Hebrew such a page may carry is that name, which is the recorded id
// (a record, the same standing as the atlas rows' ids) — so the base reader
// is asserted Hebrew-free once, and the emitted page is asserted to carry
// no Hebrew beyond the id's own occurrences.
if (HEBREW.test(ZONE_HTML)) throw new Error("zone.html itself carries Hebrew — refusing to emit any work page");
{
  const covered = new Set([...books.map((b) => b.slug), ...withheldBooks.map((b) => b.slug)]);
  let fleetPages = 0;
  for (const f of shelfZoneFiles()) {
    const slug = f.replace(/\.bin$/, "");
    if (covered.has(slug)) continue;
    const page = readerPage({ slug });
    const stripped = page.split(slug).join("");
    if (HEBREW.test(stripped)) throw new Error(`${slug}: the work page carries Hebrew beyond the recorded id — refusing output`);
    mkdirSync(join(OUT, slug), { recursive: true });
    writeFileSync(join(OUT, slug, "index.html"), page);
    fleetPages += 1;
  }
  console.log(`  ${n(fleetPages)} fleet work addresses emitted beside the ${books.length} book page${books.length === 1 ? "" : "s"}`);
}

// ---- reference groups: the owner's naming ruling, 2026-08-30 --------------
// A traditional book the chain records in pieces may be referred to — whole,
// or by any piece — under its traditional name. The ruling and each group
// are typed in the open in data/reference-groups-v1.json (a reference
// record, not a text record); this page is derived from that record and
// from the shelf's own state, and carries no words of any text.
const REF_GROUPS_PATH = arg("reference-groups", "data/reference-groups-v1.json");
if (existsSync(REF_GROUPS_PATH)) {
  const RG = JSON.parse(readFileSync(REF_GROUPS_PATH, "utf8"));
  for (const g of RG.groups || []) {
    // A gathering page presents several works at once, and works do not
    // share a license because a name gathers them. Each member carries its
    // own, read from its own zone's receipts — the same answer the door's
    // cards give. A member that does not serve presents no text and so owes
    // no license; it says what it awaits instead.
    const rows = g.members.map((id) => {
      const addr = addressOf(id);
      const zi = ZONE_INFO.get(addr);
      if (!zi) return `<p>${esc(plainId(id))} \u2014 not yet served; its card in <a href="/census/">the census</a> says what it awaits.</p>`;
      const lic = (zi.postures || []).map((x) =>
        `<span class="lic" title="${esc(x.full)}">${esc(x.name)}</span>`).join("");
      return `<p><a href="/${addr}">${esc(plainId(id))}</a> \u2014 serving; every word opens its own record.${lic
        ? ` <span class="lics">under ${lic}</span>` : ""}</p>`;
    }).join("\n");
    // The group's own English name is typed in the reference record, and a
    // typed English name waits on a source on record exactly like every
    // other name on this site. The ruling honors the TRADITIONAL name; the
    // English standing here until an attested one arrives is this record's,
    // and says so rather than borrowing the ruling's authority.
    const nameNote = `<p class="prov">This English name is typed in the reference record under the ruling below, and stands only until a source on record uses one \u2014 the same wait every other name on this site is under. The ruling honors the traditional name; the English here is this record\u2019s own.</p>`;
    const page = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(g.name_en)} \u00b7 ${SITE_NAME}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0d0a14;
  color:#b2a489;font:16px/1.6 Georgia,serif;padding:2rem}
  a{color:#eac86f} main{max-width:36rem} h1{font-size:1.3rem;letter-spacing:.08em;font-variant:small-caps;color:#eac86f}
  .prov{font-size:.82em;color:#8b7f69}
  .lics{font-size:.82em;color:#8b7f69}
  .lic{display:inline-block;margin-left:.35em;padding:0 .4em;border:1px solid #3a3348;
    border-radius:.6em;font-size:.92em;white-space:nowrap}</style>
</head>
<body><main><h1>${esc(g.name_en)}</h1>
${nameNote}
<p>${esc(g.note)}</p>
${rows}
<p class="prov">${esc(RG.ruling)} \u2014 ruled by ${esc(RG.ruled_by)}.</p>
<p><a href="/">${SITE_NAME}</a></p>
</main></body></html>\n`;
    mkdirSync(join(OUT, g.slug), { recursive: true });
    writeFileSync(join(OUT, g.slug, "index.html"), page);
  }
}

// A published address is a promise. Where a work has been republished under
// the address rule, the old address keeps answering — as a plain redirect to
// where the work now lives — driven by the recorded events in
// data/address-history-v1.json, never by a list typed here.
const HISTORY = arg("history", "data/address-history-v1.json");
if (existsSync(HISTORY)) {
  const hist = JSON.parse(readFileSync(HISTORY, "utf8"));
  for (const row of hist.republished || []) {
    // the plan's tier can be empty now; a redirect's target is wherever the
    // work actually serves — the fleet shelf, judged by the zone on disk at
    // the work's derived address
    const derived = addressOf(row.to_work_id);
    const target = slugOfWork.get(row.to_work_id)
      || (existsSync(join(ZONES, `${derived}.bin`)) ? derived : null);
    if (!target) throw new Error(`address history points at ${row.to_work_id}, which nothing publishes — refusing a redirect to nowhere`);
    const b = books.find((x) => x.slug === target);
    mkdirSync(join(OUT, row.from), { recursive: true });
    // A published address is a promise, and a withdrawal does not release it.
    // When the work an address points at is not currently served, the address
    // still answers — and says so, rather than forwarding a reader into a
    // reader with nothing in it. It stops saying so on the build after the
    // work comes back, because this is derived from the zones on disk and
    // never from a list typed here.
    if (!b) {
      const held = BOOKS.find((x) => x.slug === target);
      writeFileSync(join(OUT, row.from, "index.html"), heldPage(held ? held.withheld_reason : "", heldFrom(held)));
      continue;
    }
    const moved = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(b.disp)} · ${SITE_NAME}</title>
<link rel="canonical" href="/${target}">
<!-- This address was published on this site and later republished at
     /${target}, when its address was rederived from the work id by the
     address rule (${esc(row.on)}). A reader who kept this address still
     arrives; the bar is rewritten to where the work lives now. -->
<script>var q=location.search.replace(/^[?]/,"");location.replace("/${target}"+(q?"?"+q:""));</script>
<meta http-equiv="refresh" content="0; url=/${target}">
<script>
// Two faces, both the record's: linen by day, the tent by night. The device
// decides until the reader chooses; the choice stays on the device.
(() => {
  const root = document.documentElement;
  let held = null;
  try { held = localStorage.getItem("scheme"); } catch { /* still reads */ }
  const sys = matchMedia("(prefers-color-scheme: light)");
  const apply = () => { root.dataset.scheme = held === "day" || held === "night" ? held : (sys.matches ? "day" : "night"); };
  apply();
  if (sys.addEventListener) sys.addEventListener("change", apply);
  window.__face = { set(v) { held = v; try { localStorage.setItem("scheme", v); } catch { /* still reads */ } apply(); } };
})();
</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0d0a14;
  color:#b2a489;font:16px Georgia,serif} a{color:#eac86f}
  :root[data-scheme="day"] body{background:#f1e9d8;color:#5f5645}
  :root[data-scheme="day"] a{color:#8a6b26}</style>
</head>
<body><p>${esc(b.disp)} now lives at <a href="/${target}">/${target}</a></p>
</body>
</html>
`;
    if (HEBREW.test(moved)) throw new Error(`${row.from}: the redirect page printed a character of the text — refusing output`);
    writeFileSync(join(OUT, row.from, "index.html"), moved);
  }
}

console.log(`${OUT}/index.html + README.md · ${books.length} books · ${n(totalUnits)} commentary units`);
for (const b of books)
  console.log(`  ${b.slug.padEnd(9)} ${n(b.sections)} sections · ${n(b.words)} rendered COMPspan records` +
    (b.units ? ` · ${n(b.units)} commentary from ${b.works} work${b.works === 1 ? "" : "s"} · ${whereLine(b)}` : " · no commentary"));
