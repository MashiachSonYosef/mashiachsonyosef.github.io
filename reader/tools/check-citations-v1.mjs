#!/usr/bin/env node
// Every word in an export can be walked back to the licence it was released
// under, and the walk lands on the right place.
//
// The file used to list its sources at the foot and leave the reader to work
// out which of six stood behind which word. Naming licences without attaching
// them to what they cover is most of the way to not naming them.
//
// So: every reading carries a number, every number has an entry, no entry is
// unused, one source never carries two numbers, and — the check that matters —
// the number under a word resolves to the same record the card shows for that
// same word. Internal consistency is cheap; this proves the mapping is true.
// GUARDS: export-rule-v2-numbered-citation-per-reading-hebrew-on-the-work, provider-declaration-rule-v1-closed-set-ship-whole-by-default
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
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(defaultZoneUrl(), { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .xp-row .xp");

const grab = async (nth) => {
  await p.click(`section.seg .xp-row .xp:nth-of-type(${nth})`);
  await p.waitForFunction(() => /Press again|Refused/.test(document.querySelector("section.seg .xp-note")?.textContent || ""), { timeout: 30000 });
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("section.seg .xp-row .xp.armed")]);
  await p.waitForTimeout(150);
  return fs.readFileSync(await dl.path(), "utf8");
};

/** Pull the citation structure out of a file. */
const parse = (text) => {
  // the reading lines: not the legend, not a source entry, not a heading. A
  // reading can be several words ("and/ the/ king"), so the marks are read by
  // splitting on the marks themselves rather than on spaces.
  const readings = text.split("\n").filter((l) =>
    /\[(\d+|withheld)\]/.test(l) && !/^- /.test(l) && !/^ {4}/.test(l) &&
    !/^Citations: /.test(l) && !/^#/.test(l) && !/^\d+ reading/.test(l)).join(" ");
  const cites = [...readings.matchAll(/([^[\]]*?)\s*\[(\d+)\]/g)]
    .map((m) => ({ text: m[1].trim(), n: Number(m[2]) }));
  const marks = cites.map((c) => c.n);
  const entries = new Map();
  let cur = null;
  for (const line of text.split("\n")) {
    const m = /^- \[(H|\d+)\] (.+)$/.exec(line);
    if (m) { cur = { key: m[1], head: m[2], obligations: [], record: null }; entries.set(m[1], cur); continue; }
    if (cur && /^ {4}obligation, in our words: /.test(line)) cur.obligations.push(line.replace(/^ {4}obligation, in our words: /, ""));
    else if (cur && /^ {4}record: /.test(line)) cur.record = cur.record || line.replace(/^ {4}record: /, "");
    else if (/^#|^---/.test(line)) cur = null;
  }
  return { readings, marks, cites, entries };
};

// ---- the Hebrew + English file ---------------------------------------
const both = await grab(3);
const B = parse(both);
// Nothing on a reading line stands outside a citation: strip every "text[n]"
// and every [withheld], and what is left must be whitespace.
//
// The text of a reading may itself carry square brackets — a lexicon writes a
// supplied word that way, "to/ [the] hearing of", "and/ [he is] going away".
// The first version of this stripper used [^[\]]*? for the text, a class that
// cannot cross a "[", so it stopped dead at the first supplied word and
// reported the reading as uncited. It was reading its own blind spot as a
// defect in the file. The text run now also admits a bracket group that is not
// a citation, which is the difference between [the] and [1].
//
// What this does NOT catch, stated rather than implied: an uncited run that is
// followed by a cited one on the same line. The text part is lazy but
// unbounded, so it will swallow the pair. Only an uncited run after the last
// citation on a line is found here. Closing that needs a per-reading emission
// from the export rather than a regex over its prose.
const uncited = (readings) => readings
  .replace(/(?:[^[\]]|\[(?!\d+\])[^\]]*\])*?\s*\[\d+\]/g, " ")
  .replace(/\[withheld\]/g, " ").trim();
check("no reading stands in the file without a citation",
  B.marks.length > 0 && uncited(B.readings) === "",
  `${B.marks.length} readings cited${uncited(B.readings) ? `, uncited: "${uncited(B.readings).slice(0, 40)}"` : ""}`);
check("every mark has an entry under Sources",
  [...new Set(B.marks)].every((n) => B.entries.has(String(n))),
  [...new Set(B.marks)].filter((n) => !B.entries.has(String(n))).join(", ") || "none missing");
check("no entry is left unused",
  [...B.entries.keys()].filter((k) => k !== "H").every((k) => B.marks.includes(Number(k))),
  [...B.entries.keys()].filter((k) => k !== "H" && !B.marks.includes(Number(k))).join(", ") || "none unused");
check("one source never carries two numbers", (() => {
  const heads = [...B.entries.entries()].filter(([k]) => k !== "H").map(([, v]) => v.head.split(" — ")[1]);
  return new Set(heads).size === heads.length;
})(), `${B.entries.size - 1} numbered sources`);
check("every numbered entry names a licence before it names anything else",
  [...B.entries.entries()].filter(([k]) => k !== "H").every(([, v]) => /^[a-z0-9_]+ — /.test(v.head)),
  [...B.entries.values()].filter((v) => v.key !== "H")[0]?.head.slice(0, 46) || "");
check("the Hebrew has an entry of its own", B.entries.has("H") && /CC-|PUBLIC|LIC/i.test(B.entries.get("H").head),
  (B.entries.get("H")?.head || "absent").slice(0, 46));
// The obligations a work carries are the work's, not this file's to name. An
// earlier version tested for /Noncommercial/, which is I Kings' licence and
// nobody else's; run against a public-domain work it failed a file that was
// correct, because a public-domain work has no obligation to carry. What is
// actually required is that the entry and the licence agree: a posture that
// obliges must show what it obliges, and one that does not must not invent one.
{
  const H = B.entries.get("H");
  const head = H?.head || "";
  const obl = H?.obligations || [];
  // any gated posture counts, not one typed token — the rights vocabulary is
  // the record's own (ALLOW_WITH_PROVENANCE_GATE joined it with the canonical
  // resolution) and a gate of any name must show what the page says about it
  const freely = /PUBLIC_DOMAIN|\bCC0\b/i.test(head) && !/ALLOW_WITH_[A-Z_]+/i.test(head);
  check("the Hebrew entry's obligations agree with its licence",
    freely ? obl.length === 0 : obl.length > 0,
    freely ? `${head.slice(0, 34)} · ${obl.length} obligation(s), expected none`
           : `${head.slice(0, 34)} · ${obl.join(" | ").slice(0, 60) || "none carried"}`);
}
check("the numbers climb in the order the reader meets them",
  (() => { const seen = []; for (const n of B.marks) if (!seen.includes(n)) seen.push(n);
           return seen.every((n, i) => n === i + 1); })(), B.marks.join(" "));
check("the file says how to read its marks", /^Citations: /m.test(both));

// ---- the mark under a word is the record the card shows for it --------
//
// Walk the first few words: read the source off the HUD, then read the number
// off the file and look its entry up. They must be the same record.
// Only words that carry a reading can be walked: a word the catalog has
// nothing for opens a card with no reading pills in it, and waiting twenty
// seconds for one is how this check used to die rather than report. 677 of
// Targum Ruth's 2,139 words are that word.
const allWbs = await p.$$("section.seg .he-text .wb");
const wbs = [];
for (const wb of allWbs) {
  const has = await wb.evaluate((el) => {
    const g = el.querySelector(".g");
    return !!(g && g.textContent.trim() && g.textContent.trim() !== "—");
  });
  if (has) wbs.push(wb);
  if (wbs.length >= 6) break;
}
let checked = 0, agreed = 0, disagreed = [];
for (let i = 0; i < wbs.length; i += 1) {
  await wbs[i].click();
  await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
  await p.waitForTimeout(250);
  const card = await p.evaluate(() => ({
    reading: (document.querySelector("#hud .r-now .v")?.textContent || "").trim(),
    source: (document.querySelector("#hud .d-card .d-foot .att")?.textContent || "").split(" · ")[0].trim(),
  }));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(80);
  // the file writes the record's own text, the card the page's rendering of it
  const bare = (s) => s.replace(/[\s+/]/g, "");
  const hit = B.cites.find((c) => bare(c.text) === bare(card.reading));
  if (!hit) continue;
  const n = String(hit.n);
  const entry = B.entries.get(n);
  checked += 1;
  if (entry && entry.head.includes(card.source)) agreed += 1;
  else disagreed.push(`${card.reading} → [${n}] ${entry ? entry.head.split(" — ")[1]?.slice(0, 28) : "no entry"} but the card says ${card.source.slice(0, 28)}`);
}
check("the number under a word resolves to the record the card shows for it",
  checked > 0 && agreed === checked, `${agreed} of ${checked} words walked back${disagreed.length ? " · " + disagreed[0] : ""}`);

// ---- the English-only file carries the same apparatus -----------------
const en = await grab(2);
const E = parse(en);
check("the English file numbers its readings too", E.marks.length > 0 && E.entries.size > 1,
  `${new Set(E.marks).size} sources cited`);
check("and still names the Hebrew's licence, which it did not carry a word of",
  E.entries.has("H"), (E.entries.get("H")?.head || "absent").slice(0, 40));

// ---- the Hebrew-only file -------------------------------------------
const he = await grab(1);
const H = parse(he);
check("the Hebrew-only file cites the Hebrew and nothing else",
  H.entries.has("H") && H.entries.size === 1, `${H.entries.size} entries`);
check("and does not print a reading it did not export", !/\[\d+\]/.test(H.readings));

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
