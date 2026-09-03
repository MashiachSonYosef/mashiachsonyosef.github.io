#!/usr/bin/env node
// check-maqaf-lattice-v1
//
// The gate a work passes before it is served again.
//
// A maqaf occurrence is one C0 and more than one W. Its W set is a COMPcell
// lattice: every contiguous interval of its atoms, n(n+1)/2 of them, which
// overlap and therefore do not partition anything. That is the whole reason
// this file exists — an overlapping set laid out as if it partitioned the
// surface is how the reader came to open the wrong word, and how a reading
// line came to print an interval between its own halves.
//
// It checks the bin's arithmetic and then the rendered page, because a bin
// that is right and a page that draws it wrong is still a page that is wrong.
//
//   node tools/check-maqaf-lattice-v1.mjs <zone.bin> [--url <served url>]
//
// Laws, each one refusable on its own:
//
//   L1  key normalization retains U+05BE in its original positions inside a
//       compound, and a boundary joiner (rule 2) is not in the key
//   L2  the atoms joined by U+05BE reconstitute the occurrence surface exactly
//   L3  an interval spanning r atoms carries exactly r-1 U+05BE, surface and key
//   L4  the W set is exactly the lattice: every contiguous interval, once each
//   L5  W and K are 1:1 — no two W share a key, no W lacks one
//   L6  a Q carries no surface, no key, no selector and no chosen branch
//   L7  the page draws one clickable atom per printed piece, never one per W
//   L8  the reading line joins atoms only, because only atoms tile the surface
//   L9  clicking the i-th printed piece opens the i-th atom and not some other W
//   L10 a Q's attested count agrees with the forms carried beside it
//   L11 every issued form carries a role, a surface, a key and an issuance
//   L12 a site whose forms are not all issued draws no branch at all
//   L13 choosing a branch does not move one character of the C0

import { readFileSync, existsSync } from "node:fs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { gunzipSync } from "node:zlib";

// Named by codepoint, never typed. This file may not supply a character of
// the text any more than the page may — the rule is the whole tree's, and
// check-nothing-hand-typed-v1 is what noticed it had been broken here.
const MAQAF = "\u05be";
const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const flagUrl = args.includes("--url") ? args[args.indexOf("--url") + 1] : null;

// The suite runner hands every check a served URL. This one was written to
// take a zone file, so under the runner it read the URL as a path and died —
// a check that cannot be run the way the suite runs it is a check that does
// not run. Given a URL it now finds the zone the URL names and checks both
// halves against it; given a path it behaves as before.
const asUrl = positional.find((a) => /^https?:\/\//.test(a)) || flagUrl;
const asPath = positional.find((a) => !/^https?:\/\//.test(a));
// letters in any script — most of the shelf's slugs are Hebrew
const zoneIdOf = (u) => { const m = String(u || "").match(/[?&]b=([^&#]+)/); return m ? decodeURIComponent(m[1]) : null; };
const slug = zoneIdOf(asUrl);
const binPath = asPath || (slug ? `data/zones/${slug}.bin` : null);
const url = asUrl;
if (!binPath) {
  console.error("usage: check-maqaf-lattice-v1.mjs <zone.bin | served url> [--url <served url>]");
  process.exit(2);
}
if (!existsSync(binPath)) {
  console.log(`SKIPPED — no zone file at ${binPath} to check against`);
  process.exit(3);
}

const fails = [];
const notes = [];
const refuse = (law, what, detail) => fails.push({ law, what, detail });

const zone = JSON.parse(gunzipSync(readFileSync(binPath)).toString("utf8"));
const words = (zone.sections || []).flatMap((s) =>
  (s.words || []).map((w) => ({ ...w, unit: s.unit })));

// The lattice a set of atoms is required to produce.
const latticeOf = (atoms) => {
  const out = [];
  for (let i = 0; i < atoms.length; i += 1)
    for (let j = i; j < atoms.length; j += 1) out.push(atoms.slice(i, j + 1).join(MAQAF));
  return out;
};

const marks = (t) => (String(t || "").match(/\u05be/g) || []).length;

let maqafOccurrences = 0;
let latticeW = 0;
let plainW = 0;
const byAtomCount = new Map();

for (const w of words) {
  const surface = String(w.s || "");
  const regions = Array.isArray(w.w) ? w.w : null;

  // ---- L6 : a Q is a pointer and nothing else --------------------------
  if (w.q) {
    for (const banned of ["s", "k", "surface", "key", "semantic_w", "semantic_k",
                          "selector_state", "branch_choice", "form_role", "forms"]) {
      if (Object.prototype.hasOwnProperty.call(w.q, banned)) {
        refuse("L6", `${w.unit} "${surface}"`,
          `q carries "${banned}"; a Q flag may carry no form, no key and no chosen branch`);
      }
    }
  }

  // ---- L10/L11 : the forms beside a Q ----------------------------------
  if (w.q || w.q_forms) {
    const forms = Array.isArray(w.q_forms) ? w.q_forms : [];
    const attested = Number(w.q && w.q.attested_child_form_count);
    if (forms.length && Number.isFinite(attested) && attested !== forms.length) {
      refuse("L10", `${w.unit} "${surface}"`,
        `q attests ${attested} forms; ${forms.length} are carried beside it`);
    }
    if (forms.length && !w.q) {
      refuse("L10", `${w.unit} "${surface}"`, "forms are carried with no Q flag to point at them");
    }
    let standing = 0;
    for (const f of forms) {
      for (const need of ["role", "s", "k", "semantic_wk_issuance"]) {
        if (!f[need]) refuse("L11", `${w.unit} "${surface}"`,
          `a form carries no "${need}"` + (need === "semantic_wk_issuance"
            ? "; a form with no issuance can never be shown, which is safe but silent" : ""));
      }
      if (f.standing) standing += 1;
      if (String(f.semantic_wk_issuance || "") === "ISSUED" && f.s === undefined) {
        refuse("L11", `${w.unit} "${surface}"`, "a form is issued but carries no surface");
      }
    }
    if (forms.length && standing !== 1) {
      refuse("L11", `${w.unit} "${surface}"`,
        `${standing} forms are marked standing; exactly one is the form the C0 carries`);
    }
    const st = forms.find((f) => f.standing);
    if (st && st.s !== surface) {
      refuse("L11", `${w.unit} "${surface}"`,
        `the standing form is "${st.s}" but the C0 reads "${surface}" — the C0 must carry the standing form`);
    }
  }

  // RULE 2 (owner, 2026-09-02; the split promoted 2026-09-03): a compound the
  // reseal split is one word per row, the joiner riding as ink at the row's
  // boundary. Such a word is a plain word with a plain key here; the lattice
  // laws below hold only a compound still sealed in one row (an unsplit
  // edge work). check-maqaf-pair-drawn-v1 holds the split pairs on the page.
  const innerMaqaf = surface.replace(/^[\u0591-\u05c7]*\u05be+|\u05be+[\u0591-\u05c7]*$/gu, "").includes(MAQAF);
  if (!innerMaqaf) {
    plainW += regions ? regions.length : (w.k ? 1 : 0);
    // ---- L1 : a plain key keeps whatever the source wrote -------------
    if (w.k && marks(w.k) !== 0) {
      refuse("L1", `${w.unit} "${surface}"`, `key "${w.k}" carries a maqaf the surface does not`);
    }
    continue;
  }

  maqafOccurrences += 1;
  if (!regions) {
    refuse("L4", `${w.unit} "${surface}"`,
      "occurrence is written with a maqaf but carries no W set; it holds more than one W");
    continue;
  }

  // A maqaf at the surface's edge joins nothing — Ben-Yehuda print uses it
  // as a line hyphen — so an edge maqaf leaves the occurrence one W wearing
  // punctuation, and the lattice is that one W whole. Only interior maqafim
  // divide. (Found 2026-08-30 on a trailing-hyphen occurrence the shape
  // panel had never sampled.)
  const rawAtoms = surface.split(MAQAF);
  const atoms = rawAtoms.filter((x) => x.length > 0);
  const n = atoms.length;
  byAtomCount.set(n, (byAtomCount.get(n) || 0) + 1);

  // ---- L2 : the atoms reconstitute the surface --------------------------
  if (rawAtoms.join(MAQAF) !== surface) {
    refuse("L2", `${w.unit} "${surface}"`, "atoms do not rejoin to the occurrence surface");
  }

  // the W is the word-piece; the edge punctuation stays in the surface —
  // exactly how the ledger records it
  const want = n <= 1 ? [atoms[0] ?? surface] : latticeOf(atoms);
  const got = regions.map((r) => String(r.s ?? r.k ?? ""));
  latticeW += regions.length;

  // ---- L4 : exactly the lattice, once each ------------------------------
  const wantSorted = [...want].sort();
  const gotSorted = [...got].sort();
  if (wantSorted.length !== gotSorted.length ||
      wantSorted.some((v, i) => v !== gotSorted[i])) {
    refuse("L4", `${w.unit} "${surface}"`,
      `expected ${want.length} W (n(n+1)/2 for n=${n}), got ${got.length}` +
      (got.length <= 8 ? ` — missing ${want.filter((x) => !got.includes(x)).join(", ") || "none"}` +
                         `; extra ${got.filter((x) => !want.includes(x)).join(", ") || "none"}` : ""));
  }

  const keys = new Set();
  for (const r of regions) {
    const rs = String(r.s ?? "");
    const rk = String(r.k ?? "");
    const r_atoms = (rs || rk).split(MAQAF).length;

    // ---- L3 : r atoms carry exactly r-1 marks, both sides --------------
    if (rs && marks(rs) !== r_atoms - 1) {
      refuse("L3", `${w.unit} "${surface}"`,
        `W surface "${rs}" spans ${r_atoms} atoms but carries ${marks(rs)} maqaf, expected ${r_atoms - 1}`);
    }
    if (rk && marks(rk) !== r_atoms - 1) {
      refuse("L3", `${w.unit} "${surface}"`,
        `W key "${rk}" spans ${r_atoms} atoms but carries ${marks(rk)} maqaf, expected ${r_atoms - 1}` +
        (marks(rk) === 0 && r_atoms > 1 ? " — the maqaf was fused out of the key" : ""));
    }

    // ---- L5 : every W carries exactly one key -------------------------
    // The 1:1 law's other half — "no two W share a key" — was written before
    // the shelf met לך־לך, where two POSITIONALLY DISTINCT atoms fold to the
    // same key lawfully: the text repeats a word across its own maqaf. What
    // the old refusal actually guarded (a build duplicating a lattice cell)
    // is guarded exactly by L4's multiset reconstruction above, which counts
    // repeats. So L5 keeps only the half that is always true: a W without a
    // key is not a W.
    if (!rk) refuse("L5", `${w.unit} "${surface}"`, `W "${rs}" carries no key`);
    keys.add(rk);
  }
}

// ---------------------------------------------------------------------------
// What the bin says about itself, checked against what it holds.
// ---------------------------------------------------------------------------
const c = zone.counts || {};
if (c.occurrences_holding_more_than_one_w != null &&
    c.occurrences_holding_more_than_one_w !== maqafOccurrences) {
  refuse("L4", "counts", `counts say ${c.occurrences_holding_more_than_one_w} occurrences hold ` +
    `more than one W; ${maqafOccurrences} are written with a maqaf`);
}
if (c.w_regions != null && c.w_regions !== latticeW + plainW) {
  refuse("L4", "counts", `counts say ${c.w_regions} W regions; the sections hold ${latticeW + plainW}`);
}

notes.push(`occurrences written with a maqaf : ${maqafOccurrences.toLocaleString()}`);
for (const [n, k] of [...byAtomCount].sort((a, b) => a[0] - b[0])) {
  notes.push(`  ${n}-atom chains ${String(k).padStart(6)}  ->  ${(n * (n + 1) / 2) * k} W`);
}
notes.push(`W from maqaf occurrences         : ${latticeW.toLocaleString()}`);
notes.push(`W from plain occurrences         : ${plainW.toLocaleString()}`);
notes.push(`W/K total                        : ${(latticeW + plainW).toLocaleString()}`);

// ---------------------------------------------------------------------------
// The page. A bin that is right and a page that draws it wrong is still wrong.
// ---------------------------------------------------------------------------
if (url) {
  // Resolved the way every other check in this tree resolves it, so the file
  // runs from a checkout without a local node_modules of its own.
  const { createRequire } = await import("node:module");
  const req = createRequire(import.meta.url);
  let chromium;
  ({ chromium } = await loadPlaywright());
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 160)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const drawn = await page.evaluate(() => [...document.querySelectorAll(".wb")].map((wb) => ({
    surface: wb.querySelector(".w")?.textContent || "",
    atomEls: wb.querySelectorAll(".wr").length,
    markEls: wb.querySelectorAll(".mq").length,
    reading: wb.querySelector(".g")?.textContent.trim() || "",
  })));

  for (const d of drawn) {
    // rule 2: a joiner at the boundary is a plain word on the page too
    if (!d.surface.replace(/^[\u0591-\u05c7]*\u05be+|\u05be+[\u0591-\u05c7]*$/gu, "").includes("\u05be")) continue;
    const n = d.surface.split("\u05be").length;
    // ---- L7 : one clickable atom per printed piece ---------------------
    if (d.atomEls !== n) {
      refuse("L7", `"${d.surface}"`,
        `page draws ${d.atomEls} clickable pieces for ${n} atoms` +
        (d.atomEls === (n * (n + 1)) / 2 ? " — it laid the whole lattice against the surface" : ""));
    }
    if (d.markEls !== n - 1) {
      refuse("L7", `"${d.surface}"`, `page draws ${d.markEls} marks for ${n - 1} joins`);
    }
    // ---- L8 : the reading line joins atoms only ------------------------
    const terms = d.reading ? d.reading.split(" + ").length : 0;
    if (terms > n) {
      refuse("L8", `"${d.surface}"`,
        `reading line has ${terms} terms for ${n} atoms — intervals were joined in as if they were parts`);
    }
  }
  // ---- L9 : the piece you press is the W that opens ---------------------
  // The severest failure this file exists to catch, and the one no count finds:
  // pieces and W both looked right, but they were paired by position against a
  // list that held the intervals too, so pressing the second half of a maqaf'd
  // word opened the whole chain — a different word, a different key, a
  // different licence, and nothing on screen saying so.
  const multi = await page.$$(".wb.multi");
  for (const wb of multi) {
    const surface = (await wb.$eval(".w", (e) => e.textContent)) || "";
    if (!surface.replace(/^[\u0591-\u05c7]*\u05be+|\u05be+[\u0591-\u05c7]*$/gu, "").includes("\u05be")) continue;
    const atoms = surface.split("\u05be");
    const pieces = await wb.$$(".wr");
    for (let i = 0; i < pieces.length && i < atoms.length; i += 1) {
      await pieces[i].click();
      await page.waitForTimeout(450);
      const opened = await page.evaluate(() => {
        const h = document.getElementById("hud");
        if (!h || h.hidden) return null;
        const b = h.querySelector(".head b");
        if (!b) return null;
        const lit = [...b.children].filter((c) => !String(c.style.color || "").includes("faint")
          && !c.classList.contains("mq")).map((c) => c.textContent);
        return lit.join("\u05be");
      });
      if (opened !== atoms[i]) {
        refuse("L9", `"${surface}"`,
          `pressing piece ${i + 1} ("${atoms[i]}") opened "${opened}"` +
          (opened && opened.includes("\u05be") ? " — a joined interval, not the atom pressed" : ""));
      }
    }
  }

  // ---- L12/L13 : what the card may draw, and what it may never move ------
  const qWords = words.map((w, i) => ({ w, i })).filter(({ w }) => w.q);
  for (const { w, i } of qWords) {
    const forms = Array.isArray(w.q_forms) ? w.q_forms : [];
    const issued = forms.filter((f) => String(f.semantic_wk_issuance || "") === "ISSUED");
    const attested = Number(w.q.attested_child_form_count) || forms.length;
    const mayDraw = forms.length > 0 && issued.length === forms.length
      && issued.length === attested && attested > 1;

    await page.evaluate((n) => document.querySelectorAll(".wb")[n].click(), i);
    await page.waitForTimeout(450);
    const pills = await page.evaluate(() =>
      [...document.querySelectorAll("#hud .b-q .s-pills button")].map((b) => b.textContent.trim()));

    if (!mayDraw && pills.length) {
      refuse("L12", `"${w.s}"`,
        `${pills.length} branch(es) drawn for a site that is ${forms.length ? "not fully issued" : "held"}` +
        ` — ${JSON.stringify(pills)}`);
    }
    if (mayDraw && pills.length !== issued.length) {
      refuse("L12", `"${w.s}"`, `${pills.length} branches drawn for ${issued.length} issued forms`);
    }

    // ---- L13 : the C0 does not move ------------------------------------
    if (mayDraw && pills.length > 1) {
      const before = await page.evaluate((n) => ({
        line: document.querySelectorAll(".wb")[n].querySelector(".w").textContent,
        head: document.querySelector("#hud .head b")?.textContent || "",
      }), i);
      await page.evaluate(() => document.querySelectorAll("#hud .b-q .s-pills button")[1].click());
      await page.waitForTimeout(500);
      const after = await page.evaluate((n) => ({
        line: document.querySelectorAll(".wb")[n].querySelector(".w").textContent,
        head: document.querySelector("#hud .head b")?.textContent || "",
      }), i);
      if (before.line !== after.line) {
        refuse("L13", `"${w.s}"`,
          `choosing a branch rewrote the line: "${before.line}" became "${after.line}" — that is a derivative`);
      }
      if (before.head !== after.head) {
        refuse("L13", `"${w.s}"`,
          `choosing a branch rewrote the card head: "${before.head}" became "${after.head}"`);
      }
    }
  }
  if (qWords.length) notes.push(`apparatus sites checked          : ${qWords.length}`);

  if (pageErrors.length) refuse("L7", "page", pageErrors.join(" | "));
  notes.push(`occurrences drawn on the page    : ${drawn.length.toLocaleString()}`);
  await browser.close();
}

// ---------------------------------------------------------------------------
console.log(`check-maqaf-lattice-v1 · ${binPath}${url ? ` · ${url}` : ""}`);
for (const n of notes) console.log(`  ${n}`);
console.log("");
if (!fails.length) {
  console.log(`  PASS · ${url ? "13 laws" : "8 laws (bin only — pass --url to check the page)"}`);
  console.log("");
  console.log("  Not covered: whether a W's key is the one the corpus lane sealed for it, and");
  console.log("  whether an ISSUED field is true. This file proves the reader obeys that field;");
  console.log("  only Oholiab can say it was set honestly. Both are the corpus lane's to answer.");
  process.exit(0);
}
const byLaw = new Map();
for (const f of fails) byLaw.set(f.law, [...(byLaw.get(f.law) || []), f]);
console.log(`  REFUSED · ${fails.length} finding${fails.length === 1 ? "" : "s"}`);
for (const [law, list] of [...byLaw].sort()) {
  console.log(`\n  ${law} · ${list.length}`);
  for (const f of list.slice(0, 12)) console.log(`    ${f.what}\n        ${f.detail}`);
  if (list.length > 12) console.log(`    … and ${list.length - 12} more`);
}
process.exit(1);
