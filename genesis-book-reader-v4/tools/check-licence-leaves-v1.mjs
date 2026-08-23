#!/usr/bin/env node
// Nothing licensed leaves this page without its licence.
//
// The Hebrew of 1 Kings is CC-BY-NC, ALLOW_WITH_OBLIGATIONS. It is the largest
// thing any export carries. An earlier build printed the work receipt in its
// place and shipped the text with no licence at all.
// GUARDS: provider-declaration-rule-v1-closed-set-ship-whole-by-default, licence-wording-rule-v1-the-summary-is-ours-and-the-licence-governs
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
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
import fs from "node:fs";
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
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

for (const [nth, kind] of [[1, "hebrew"], [2, "english"], [3, "both"]]) {
  const { note, text } = await grab(nth);
  // the Hebrew carries a citation mark of its own, so the licence is not just
  // stated somewhere in the file — it is attached to the text it covers
  const hasFamily = /Hebrew text \[H\] · licence: CC-BY-NC/.test(text);
  const hasNC = /Noncommercial use only/.test(text);
  const hasLink = /Hebrew text \[H\] · License family/.test(text);
  const hasEntry = /^- \[H\] CC-BY-NC/m.test(text);
  check(`${kind} export names the Hebrew's licence`, hasFamily, text.split("\n").find(l => /Hebrew text .*· licence/.test(l)) || "absent");
  check(`${kind} export carries the noncommercial obligation`, hasNC);
  check(`${kind} export carries the recorded licence link`, hasLink);
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
  check(`${kind} export labels every obligation line as ours`,
    !/^ {4}obligation: /m.test(text) && /^ {4}obligation, in our words: /m.test(text),
    (text.split("\n").find((l) => /^ {4}obligation/.test(l)) || "no obligation line").trim().slice(0, 60));
  check(`${kind} export puts no words in the chain's mouth`,
    !/chain records this text as allowed with obligations/.test(text));
  if (nth === 1) check("the confirm says the licence before anything is written", /CC-BY-NC/.test(note), note.slice(0, 90));
  if (nth === 1) check("the confirm says the obligation is summarised, not quoted", /in our words/.test(note), note.slice(0, 110));
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
