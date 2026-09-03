#!/usr/bin/env node
// GUARDS: exact-k-rule-v2-ascii-abbreviation-marks-and-boundary-maqaf, maqaf-rule-v2-one-c0-per-word
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// RULE 2 ON THE PAGE. The owner (2026-09-02): a maqaf compound is as many C0s
// as it has words; each is an ordinary word with its own card; nothing is
// grouped over them; the joiner rides as ink on the word before. The corpus
// lane split the compounds (bridge-v2, promoted 2026-09-03) and the zone
// carries, on every maqaf-final word, the join the reader draws: the next
// word follows without a separator, in one wrapper, and both cards say in
// one line that they are joined. This check opens the served page and holds
// it to that on the first joined runs it finds.
//
//   L1  in the bin: every maqaf-final word keys without the joiner and
//       carries the join; the word after it says it follows a joiner
//   L2  on the page: a joined run is one wrapper holding one clickable word
//       per row, nothing between them but the rows' own ink, and the run's
//       text is the rows' surfaces concatenated, maqaf included
//   L3  pressing the first word opens a card headed by that word, joiner
//       and all, whose head says it is joined to the next word; pressing
//       the next opens its own card, which says it follows a joiner
//   L4  no word of a split pair is drawn as pieces (no lattice over a pair)
//
// What this does NOT prove: anything about a compound still sealed in one
// row (check-maqaf-lattice-v1 keeps those laws); that every run on the page
// is right (it samples the first runs, budgeted).
//
// Run: node tools/check-maqaf-pair-drawn-v1.mjs <served zone url>
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const URL_ARG = process.argv[2];
if (!URL_ARG || !/^https?:/u.test(URL_ARG)) { console.log("SKIPPED — needs a served zone url"); process.exit(3); }
const slug = decodeURIComponent((URL_ARG.match(/[?&]b=([^&]+)/u) || [])[1] || "");
const binPath = join(K3, "data", "zones", `${slug}.bin`);
if (!slug || !existsSync(binPath)) { console.log(`SKIPPED — no zone file for ${slug || "(no b=)"}`); process.exit(3); }

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");
const esc = (s) => String(s).replace(/[\u0590-\u05ff]/gu, (c) => "\\u" + c.charCodeAt(0).toString(16));
const MAQAF = "\u05be";
const joinsNext = (s) => /\u05be[\u0591-\u05c7]*$/u.test(String(s || ""));

const zone = JSON.parse(gunzipSync(readFileSync(binPath)).toString("utf8"));
const words = (zone.sections || []).flatMap((s) => (s.words || []));
// L1
const l1 = []; let joiners = 0;
for (let i = 0; i < words.length; i += 1) {
  const w = words[i]; if (w.held || w.kq) continue;
  if (!joinsNext(w.s)) continue;
  joiners += 1;
  if (w.k && w.k.endsWith(MAQAF)) l1.push(`${esc(w.s)}: key keeps the joiner`);
  if (!(w.presentation_join && w.presentation_join.join_next_without_separator)) l1.push(`${esc(w.s)}: no join carried`);
  const n = words[i + 1];
  if (n && !n.held && !(n.after_maqaf || (n.presentation_join && n.presentation_join.join_previous_without_separator))) l1.push(`${esc(w.s)}: the next word does not say it follows a joiner`);
}
check("L1  every maqaf-final word keys without the joiner, carries the join, and the next word knows", l1.length === 0, l1.length ? `${l1.length} — ${few(l1)}` : `${joiners} joiners`);
if (!joiners) { console.log("SKIPPED — this zone carries no maqaf-final word; L2 to L4 had nothing to judge"); process.exit(bad ? 1 : 3); }

// the runs the bin expects: consecutive words linked by joins
const runs = [];
for (let i = 0; i < words.length; i += 1) {
  const w = words[i]; if (w.held || !w.presentation_join || !w.presentation_join.join_next_without_separator || w.kq) continue;
  const run = [w]; let j = i + 1;
  while (j < words.length && words[j].presentation_join && words[j].presentation_join.join_previous_without_separator && !words[j].held) { run.push(words[j]); if (!words[j].presentation_join.join_next_without_separator) break; j += 1; }
  runs.push(run); i = j;
}
const expected = runs.slice(0, 6).map((r) => ({ text: r.map((w) => w.s).join(""), n: r.length, first: r[0].s, second: r[1] ? r[1].s : null }));

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
await page.goto(URL_ARG, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
const drawn = await page.evaluate((n) => [...document.querySelectorAll("section.seg .he-text .wjoin")].slice(0, n).map((j) => ({
  n: j.querySelectorAll(":scope > .wb").length,
  text: [...j.querySelectorAll(":scope > .wb > .w")].map((w) => w.textContent).join(""),
  between: [...j.childNodes].filter((c) => c.nodeType === 3 && c.textContent.trim() === "").length,
  pieces: j.querySelectorAll(".wr, .mq").length,
})), expected.length);
// L2
const l2 = [];
expected.forEach((e, i) => {
  const d = drawn[i];
  if (!d) { l2.push(`run ${i + 1} ${esc(e.text)}: not drawn as a wrapper`); return; }
  if (d.n !== e.n) l2.push(`run ${i + 1}: ${d.n} words drawn for ${e.n} rows`);
  if (d.text !== e.text) l2.push(`run ${i + 1}: page ${esc(d.text)} vs rows ${esc(e.text)}`);
  if (d.between) l2.push(`run ${i + 1}: ${d.between} blank text node(s) between the words`);
});
check("L2  a joined run is one wrapper of one clickable word per row, the rows' ink concatenated", l2.length === 0, l2.length ? `${l2.length} — ${few(l2)}` : `${expected.length} runs sampled of ${runs.length}`);
// L4
const l4 = drawn.filter((d) => d.pieces).length;
check("L4  no word of a split pair is drawn as pieces", l4 === 0, l4 ? `${l4} runs carry pieces or marks` : "none");
// L3
const l3 = [];
if (expected.length) {
  const first = page.locator("section.seg .he-text .wjoin").first();
  await first.scrollIntoViewIfNeeded();
  await first.locator(":scope > .wb > .w").first().click();
  await page.waitForTimeout(600);
  const h1 = await page.evaluate(() => { const h = document.querySelector("#hud .head"); return h ? { b: (h.querySelector("b") || {}).textContent || "", text: h.innerText } : null; });
  if (!h1) l3.push("no card opened on the first word");
  else {
    if (h1.b.trim() !== expected[0].first) l3.push(`first card headed ${esc(h1.b)}, not ${esc(expected[0].first)}`);
    if (!/joined by a maqaf to the (next word|words before and after)/u.test(h1.text)) l3.push("first card does not say it is joined to the next word");
  }
  if (expected[0].second) {
    await first.locator(":scope > .wb > .w").nth(1).click();
    await page.waitForTimeout(600);
    const h2 = await page.evaluate(() => { const h = document.querySelector("#hud .head"); return h ? { b: (h.querySelector("b") || {}).textContent || "", text: h.innerText } : null; });
    if (!h2) l3.push("no card opened on the second word");
    else {
      if (h2.b.trim() !== expected[0].second) l3.push(`second card headed ${esc(h2.b)}, not ${esc(expected[0].second)}`);
      if (!/joined by a maqaf to the (word before|words before and after)/u.test(h2.text)) l3.push("second card does not say it follows a joiner");
    }
  }
}
check("L3  each word of a pair opens its own card, headed by its own ink, saying it is joined", l3.length === 0, l3.length ? few(l3) : "both cards open and say so");
if (errs.length) check("  no page error", false, errs[0].slice(0, 120));
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
