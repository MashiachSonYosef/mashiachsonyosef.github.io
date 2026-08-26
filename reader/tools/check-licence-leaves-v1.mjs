#!/usr/bin/env node
// Nothing licensed leaves this page without its licence.
//
// The Hebrew of 1 Kings is CC-BY-NC, ALLOW_WITH_OBLIGATIONS. It is the largest
// thing any export carries. An earlier build printed the work receipt in its
// place and shipped the text with no licence at all.
// GUARDS: provider-declaration-rule-v1-closed-set-ship-whole-by-default, licence-wording-rule-v1-the-summary-is-ours-and-the-licence-governs, export-custody-rule-v1-what-leaves-carries-its-own-way-back
//
// And nothing leaves without its way back. A hash on a card was asked for and
// refused — on the page the chain is a click away. A file is past the border,
// which is where a hash does its work: each section in it names the unit it
// was served from and the c0 rows it stands on, and a Custody section at the
// foot carries the sealed artifacts that answer for them, hashes whole. All
// of it is read from the zone's own record here and compared to the file, so
// the file cannot say a custody the zone does not hold.
//
// And nothing licensed leaves it wearing words it did not say. Every
// obligation this page prints is a one-line summary written here; a licence is
// a document and a summary of it is not that document. So an export has to
// name the licence, and it has to say — in the file, above the lines — that
// the lines are ours. An earlier build printed three unmarked sentences beside
// a licence chip, and one of them ("the chain records this text as allowed
// with obligations") credited the chain with a sentence the chain never
// carried.
//
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import fs from "node:fs";
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 }, acceptDownloads: true });
await p.context().grantPermissions(["clipboard-read", "clipboard-write"]);
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(defaultZoneUrl(), { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .xp-row .xp");

const grab = async (nth) => {
  await p.click(`section.seg .xp-row .xp:nth-of-type(${nth})`);
  await p.waitForFunction(() => /Press again|Refused/.test(document.querySelector("section.seg .xp-note")?.textContent || ""), { timeout: 30000 });
  const note = await p.evaluate(() => document.querySelector("section.seg .xp-note").textContent.trim());
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("section.seg .xp-row .xp.armed")]);
  return { note, text: fs.readFileSync(await dl.path(), "utf8") };
};

// How many licence links the served work's own rights record holds. Asked of
// the zone rather than assumed, because whether a link must appear in the file
// is a fact about the work and not about this check.
const linkCount = await p.evaluate(() =>
  ((window.__zone && window.__zone.emitted_from && window.__zone.emitted_from.license_links) || []).length);

// The custody the zone itself holds, asked of the zone so the file is
// compared to the record and never to a string typed here.
const custody = await p.evaluate(() => {
  const z = window.__zone || {};
  const ef = z.emitted_from || {};
  const s0 = (z.sections || [])[0] || {};
  return {
    unit: s0.unit || null, c0First: s0.c0_first ?? null, c0Last: s0.c0_last ?? null,
    oracleSha: (ef.identity_oracle || {}).bridge_sha256 || null,
    pointerSha: ((ef.walk || {}).pointer || {}).sha256 || null,
    moduleSha: ((ef.walk || {}).module || {}).sha256 || null,
    left: location.origin + location.pathname + location.search,
  };
});

for (const [nth, kind] of [[1, "hebrew"], [2, "english"], [3, "both"]]) {
  const { note, text } = await grab(nth);
  // the Hebrew carries a citation mark of its own, so the licence is not just
  // stated somewhere in the file — it is attached to the text it covers
  // The licence is the work's, not this file's to name. This tested for
  // CC-BY-NC, which is I Kings' licence and nobody else's; run against a
  // public-domain work it failed a file that was correct, because a
  // public-domain work has no noncommercial obligation to carry and no
  // licence link to point at. What is required is that the file and the work
  // agree — the same rule check-citations was corrected to on 2026-08-23.
  const declared = (text.match(/Hebrew text \[H\] · license: (.+)/) || [])[1] || "";
  const obliged = /ALLOW_WITH_OBLIGATIONS/.test(declared) ||
                  /\bNC\b|NONCOMMERCIAL/i.test(declared);
  const hasFamily = /Hebrew text \[H\] · license: \S/.test(text);
  const hasNC = obliged ? /Noncommercial use only/.test(text) : true;
  const hasLink = /Hebrew text \[H\] · License family/.test(text);
  const hasEntry = /^- \[H\] \S/m.test(text);
  check(`${kind} export names the Hebrew's licence`, hasFamily, text.split("\n").find(l => /Hebrew text .*· license/.test(l)) || "absent");
  check(`${kind} export carries the noncommercial obligation`, hasNC);
  // A link is carried when the zone records one. A work whose rights record
  // names no link cannot print one, and printing one anyway is the defect.
  check(`${kind} export carries every licence link the record holds`,
    linkCount === 0 ? !hasLink : hasLink,
    linkCount === 0 ? "the record holds none, and none is printed" : `${linkCount} recorded`);
  check(`${kind} export gives the Hebrew a citation entry of its own`, hasEntry,
    text.split("\n").find(l => /^- \[H\]/.test(l))?.slice(0, 60) || "absent");
  if (kind !== "hebrew") {
    check(`${kind} export writes the record's text, not the page's rendering`,
      !/ \+ /.test(text.split("\n").find(l => /love|abide/.test(l)) || ""),
      (text.split("\n").find(l => /love|abide/.test(l)) || "").slice(0, 70));
  }
  // whose words the obligations are, said in the file rather than assumed
  check(`${kind} export says the obligation lines are its own words`,
    /plain English written in this reader/.test(text) && /licence-wording-rule-v1/.test(text),
    (text.split("\n").find((l) => /plain English written/.test(l)) || "absent").slice(0, 70));
  // What must never appear is an unlabelled obligation line, which would read
  // as the licence's own words. A work with nothing to oblige prints no line
  // at all, and that is the correct file rather than a missing one — the same
  // correction this file took above, and check-citations took before it.
  check(`${kind} export labels every obligation line as ours`,
    !/^ {4}obligation: /m.test(text) &&
      (obliged ? /^ {4}obligation, in our words: /m.test(text) : true),
    (text.split("\n").find((l) => /^ {4}obligation/.test(l))
      || (obliged ? "no obligation line, and this licence obliges" : "none to label")).trim().slice(0, 60));
  check(`${kind} export puts no words in the chain's mouth`,
    !/chain records this text as allowed with obligations/.test(text));
  // the way back: the section's chain address, and the artifacts that answer
  const unitLine = text.split("\n").find((l) => /^unit: /.test(l)) || "";
  check(`${kind} export names the section's unit and c0 rows, the zone's own`,
    custody.unit
      ? unitLine.includes(`unit: ${custody.unit}`) &&
        (custody.c0First == null || unitLine.includes(`c0 rows ${custody.c0First}–${custody.c0Last}`))
      : unitLine === "",
    unitLine.slice(0, 70) || "the zone records no unit, and none is printed");
  check(`${kind} export carries a Custody section, and it stands last`,
    /^## Custody$/m.test(text) && text.lastIndexOf("\n## ") === text.indexOf("\n## Custody"));
  check(`${kind} export carries the identity oracle's hash whole`,
    custody.oracleSha
      ? /^[0-9a-f]{64}$/.test(custody.oracleSha) && text.includes(`sha256 ${custody.oracleSha}`)
      : !/identity oracle:/.test(text),
    custody.oracleSha ? `${custody.oracleSha.slice(0, 16)}… carried entire` : "none recorded, none printed");
  check(`${kind} export carries the serve pointer and walker hashes the zone records`,
    (!custody.pointerSha || text.includes(`serve pointer: sha256 ${custody.pointerSha}`)) &&
    (!custody.moduleSha || text.includes(`walker module: sha256 ${custody.moduleSha}`)));
  check(`${kind} export says the custody sentences are its own words`,
    /_These sentences are plain English written in this reader/.test(text) &&
    /export-custody-rule-v1/.test(text));
  check(`${kind} export names the page it left`,
    text.includes(`this file left: ${custody.left}`), custody.left);
  if (nth === 1) check("the confirm says the licence before anything is written",
    /·\s*[A-Z0-9][A-Z0-9._-]*/.test(note), note.slice(0, 90));
  if (nth === 1) check("the confirm says the obligation is summarised, not quoted",
    obliged ? /in our words/.test(note) : !/in our words/.test(note),
    (obliged ? note : `${note.slice(0, 70)} — nothing to summarise`).slice(0, 110));
  await p.waitForTimeout(200);
}

// Nothing else on the page hands text over. A copy button was the site
// redistributing on a press, which is the moment an obligation attaches; it was
// removed rather than papered over with a notice. The reader's own selection is
// the reader's act, the same act they perform on any page they read.
const handers = await p.evaluate(() => {
  const seen = [];
  // a control that writes to a clipboard, by class or by handler
  document.querySelectorAll(".cp, .cp-row, [data-copy]").forEach((el) => seen.push(el.className || "data-copy"));
  return { seen, wrote: window.__clipboardWrites || 0 };
});
check("no control on the page writes to a clipboard", handers.seen.length === 0, handers.seen.join(", "));

// and pressing everything a section offers never reaches the clipboard
await p.evaluate(() => {
  window.__clipboardWrites = 0;
  const real = navigator.clipboard.writeText.bind(navigator.clipboard);
  navigator.clipboard.writeText = (t) => { window.__clipboardWrites += 1; return real(t); };
});
for (const sel of ["section.seg .c-bar", "section.seg .seg-row", "section.seg .he-text .wb"]) {
  const el = await p.$(sel);
  if (el) { await el.click(); await p.waitForTimeout(150); }
}
await p.keyboard.press("Escape");
const wrote = await p.evaluate(() => window.__clipboardWrites);
check("pressing a section's controls never writes to a clipboard", wrote === 0, `${wrote} writes`);
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
