#!/usr/bin/env node
// RUN: page
// Every reading in an export can be walked back to the license it was released
// under, and the walk lands on the right place.
//
// The file used to list its sources at the foot and leave the reader to work
// out which of six stood behind which word. Naming licenses without attaching
// them to what they cover is most of the way to not naming them.
//
// So: every record carries a number, every number has an entry, no entry is
// unused, one source never carries two numbers, and — the check that matters —
// the record cited for a word is the record the card shows for that same
// word. Internal consistency is cheap; this proves the mapping is true.
//
// THE FILE IS TWO BLOCKS (the owner, 3 October 2026): the Hebrew, and then the
// records behind the readings, one after another, each as it was received and
// each with the word it was cited for. This check went on reading the earlier
// shape, a number after each reading inside the text, found "0 readings
// cited" from that day on, and stood in none of the round's chains, so it was
// red unseen until the whole suite was run on 10 November. In those five
// weeks the file took three faults this check exists to catch, and each is a
// law now:
//
//   C11  a record's wording year is the year its card shows (the file printed
//        the source's edition year under the word "wording", so a row of 1890
//        read "wording year not supplied")
//   C12  a scribal mark is text, never a reading: nothing with no letter in it
//        is listed as withheld, and the count said is the count listed (every
//        verse's closing mark was counted as a reading "not exported")
//   C13  the file speaks of no mark in its text that it does not print
// GUARDS: export-rule-v2-numbered-citation-per-reading-hebrew-on-the-work, provider-declaration-rule-v1-closed-set-ship-whole-by-default
//
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import fs from "node:fs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 }, acceptDownloads: true });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(defaultZoneUrl(), { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .xp-open");
await p.click("section.seg .xp-open");
await p.waitForSelector("section.seg .xp-menu .xp-row .xp");

const grab = async (nth) => {
  // the section's export menu, opened where it is not (one button in the pill row drops it)
  await p.evaluate(() => { const s = document.querySelector("section.seg"); const m = s.querySelector(".xp-menu"); if (!m || m.hidden) s.querySelector(".xp-open").click(); });
  await p.click(`section.seg .xp-row .xp:nth-of-type(${nth})`);
  await p.waitForFunction(() => /Press again|Refused/.test(document.querySelector("section.seg .xp-note")?.textContent || ""), { timeout: 30000 });
  const note = await p.evaluate(() => document.querySelector("section.seg .xp-note").textContent);
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("section.seg .xp-row .xp.armed")]);
  await p.waitForTimeout(150);
  return { text: fs.readFileSync(await dl.path(), "utf8"), note };
};

/** Pull the citation structure out of a file. */
const parse = (text) => {
  const lines = text.split("\n");
  // the records: from the block's heading to the next heading of its level;
  // each opens "N. " at the margin and holds indented field lines
  const records = [];
  let inRecords = false, cur = null;
  for (const line of lines) {
    if (/^# Records, as received/u.test(line)) { inRecords = true; continue; }
    if (inRecords && /^(#|---)/u.test(line)) { inRecords = false; cur = null; }
    if (!inRecords) continue;
    const open = /^(\d+)\. (.*)$/u.exec(line);
    if (open) { cur = { no: Number(open[1]), fields: {}, n: null, label: "", wording: null, at: null }; records.push(cur); const f = /^([a-z]+): (.*)$/u.exec(open[2]); if (f) cur.fields[f[1]] = f[2]; continue; }
    if (!cur) continue;
    const f = /^\s+([a-z]+): (.*)$/u.exec(line);
    if (!f) continue;
    cur.fields[f[1]] = f[2];
    if (f[1] === "source") {
      const s = /^\[(\d+)\] (.*)$/u.exec(f[2]);
      if (s) { cur.n = Number(s[1]); const w = / · wording (.*)$/u.exec(s[2]); cur.label = (w ? s[2].slice(0, w.index) : s[2]).trim(); cur.wording = w ? w[1].trim() : null; }
    }
    if (f[1] === "for") cur.at = f[2].trim().split(" ").pop();
  }
  const marks = records.filter((r) => r.n !== null).map((r) => r.n);
  // the entries under Sources
  const entries = new Map();
  let e = null;
  for (const line of lines) {
    const m = /^- \[(H|\d+)\] (.+)$/u.exec(line);
    if (m) { e = { key: m[1], head: m[2], obligations: [], record: null }; entries.set(m[1], e); continue; }
    if (e && /^ {4}obligation, in our words: /u.test(line)) e.obligations.push(line.replace(/^ {4}obligation, in our words: /u, ""));
    else if (e && /^ {4}record: /u.test(line)) e.record = e.record || line.replace(/^ {4}record: /u, "");
    else if (/^#|^---/u.test(line)) e = null;
  }
  // the Withheld block: what it says it holds, and what it lists
  const wAt = lines.findIndex((l) => /^## Withheld/u.test(l));
  const withheld = { said: null, listed: [] };
  if (wAt > -1) {
    for (let i = wAt + 1; i < lines.length && !/^## /u.test(lines[i]); i += 1) {
      const said = /^(\d+) readings? (?:was|were) not exported/u.exec(lines[i]);
      if (said) withheld.said = Number(said[1]);
      const item = /^- (\S*) (.*?): (.*)$/u.exec(lines[i]);
      if (item) withheld.listed.push({ at: item[1], he: item[2], why: item[3] });
    }
  }
  return { records, marks, entries, withheld };
};

// ---- the Hebrew + English file ---------------------------------------
const { text: both, note: bothNote } = await grab(3);
const B = parse(both);
check("C1  every record of the file carries a citation", B.records.length > 0 && B.records.every((r) => r.n !== null),
  `${B.records.length} records, ${B.marks.length} cited${B.records.some((r) => r.n === null) ? ` · record ${B.records.find((r) => r.n === null).no} carries none` : ""}`);
check("C2  every mark has an entry under Sources",
  [...new Set(B.marks)].every((n) => B.entries.has(String(n))),
  [...new Set(B.marks)].filter((n) => !B.entries.has(String(n))).join(", ") || "none missing");
check("C3  no entry is left unused",
  [...B.entries.keys()].filter((k) => k !== "H").every((k) => B.marks.includes(Number(k))),
  [...B.entries.keys()].filter((k) => k !== "H" && !B.marks.includes(Number(k))).join(", ") || "none unused");
check("C4  one source never carries two numbers", (() => {
  const heads = [...B.entries.entries()].filter(([k]) => k !== "H").map(([, v]) => v.head.split(" — ")[1]);
  return new Set(heads).size === heads.length;
})(), `${B.entries.size - 1} numbered sources`);
check("C5  every numbered entry names a license before it names anything else",
  [...B.entries.entries()].filter(([k]) => k !== "H").every(([, v]) => /^[a-z0-9_]+ — /.test(v.head)),
  [...B.entries.values()].filter((v) => v.key !== "H")[0]?.head.slice(0, 46) || "");
check("C6  the Hebrew has an entry of its own", B.entries.has("H") && /CC-|PUBLIC|LIC/i.test(B.entries.get("H").head),
  (B.entries.get("H")?.head || "absent").slice(0, 46));
// The obligations a work carries are the work's, not this file's to name. An
// earlier version tested for /Noncommercial/, which is I Kings' license and
// nobody else's; run against a public-domain work it failed a file that was
// correct, because a public-domain work has no obligation to carry. What is
// actually required is that the entry and the license agree: a posture that
// obliges must show what it obliges, and one that does not must not invent one.
{
  const H = B.entries.get("H");
  const head = H?.head || "";
  const obl = H?.obligations || [];
  // any gated posture counts, not one typed token — the rights vocabulary is
  // the record's own (ALLOW_WITH_PROVENANCE_GATE joined it with the canonical
  // resolution) and a gate of any name must show what the page says about it
  const freely = /PUBLIC_DOMAIN|\bCC0\b/i.test(head) && !/ALLOW_WITH_[A-Z_]+/i.test(head);
  check("C7  the Hebrew entry's obligations agree with its license",
    freely ? obl.length === 0 : obl.length > 0,
    freely ? `${head.slice(0, 34)} · ${obl.length} obligation(s), expected none`
           : `${head.slice(0, 34)} · ${obl.join(" | ").slice(0, 60) || "none carried"}`);
}
check("C8  the numbers climb in the order the reader meets them",
  (() => { const seen = []; for (const n of B.marks) if (!seen.includes(n)) seen.push(n);
           return seen.every((n, i) => n === i + 1); })(), B.marks.join(" "));
check("C9  the file says how to read its marks", /^Citations: /m.test(both));

// ---- the record cited for a word is the record the card shows for it --
//
// Walk the first words of the section the file was made from: read the source
// and its year off the card, find the record the file cites for that word's
// address, and look its entry up. They must be the same record.
// Only words that carry a reading can be walked: a word the catalog has
// nothing for opens a card with no reading pills in it, and waiting twenty
// seconds for one is how this check used to die rather than report.
// the export menu left open after the grab would stand over the first words
await p.keyboard.press("Escape"); await p.waitForTimeout(200);
const walk = await p.evaluate(() => {
  const sec = document.querySelector("section.seg");
  const label = (sec.querySelector(".vnum") || {}).textContent || "";
  const out = [];
  [...sec.querySelectorAll(".he-text .wb")].forEach((wb, i) => {
    if (wb.classList.contains("mark")) return;
    const n = [...sec.querySelectorAll(".he-text .wb:not(.mark)")].indexOf(wb) + 1;
    const g = wb.querySelector(":scope > .g");
    if (g && g.textContent.trim() && g.textContent.trim() !== "—" && !wb.classList.contains("kq")) out.push({ i, at: `${label.trim()}:${n}` });
  });
  return out.slice(0, 6);
});
let checked = 0, agreed = 0, yearsAgreed = 0; const disagreed = [], yearsOff = [];
for (const w of walk) {
  await p.evaluate((i) => { const wb = document.querySelector("section.seg").querySelectorAll(".he-text .wb")[i]; (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, w.i);
  await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
  await p.waitForTimeout(250);
  // a card that opens on the core block of the source's set (core-block-rule-v1, 14 November 2026) shows that
  // block's record; the line, and so the file, reads the set: the card is stood on the set whole again first
  if (await p.evaluate(() => { const blk = document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]'); const cut = document.querySelector('#hud .b-cut .s-pills button[aria-pressed="true"]'); if (blk && cut && document.querySelectorAll("#hud .b-cell .s-pills button").length > 1) { cut.click(); return true; } return false; })) await p.waitForTimeout(700);
  const card = await p.evaluate(() => {
    const att = (document.querySelector("#hud .d-card .d-foot .att")?.textContent || "");
    return { reading: (document.querySelector("#hud .r-now .v")?.textContent || "").trim(), source: att.split(" · ")[0].trim(), wording: (/wording (\d{3,4})/u.exec(att) || [])[1] || null };
  });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(80);
  const rec = B.records.find((r) => r.at === w.at);
  if (!rec) continue;
  const entry = B.entries.get(String(rec.n));
  checked += 1;
  if (entry && card.source && entry.head.includes(card.source) && rec.label === card.source) agreed += 1;
  else disagreed.push(`${w.at} "${card.reading}" → [${rec.n}] ${rec.label.slice(0, 28)} but the card says ${card.source.slice(0, 28)}`);
  const fileYear = (/(\d{3,4})/u.exec(rec.wording || "") || [])[1] || null;
  if (fileYear === card.wording) yearsAgreed += 1; else yearsOff.push(`${w.at}: the card says ${card.wording || "no year"}, the file "${rec.wording}"`);
}
check("C10 the record cited for a word is the record the card shows for it",
  checked > 0 && agreed === checked, `${agreed} of ${checked} words walked back${disagreed.length ? " · " + disagreed[0] : ""}`);
check("C11 and its wording year is the year the card shows", checked > 0 && yearsAgreed === checked,
  `${yearsAgreed} of ${checked}${yearsOff.length ? " · " + yearsOff[0] : ""}`);
// C12, C13: marks. A scribal mark's Hebrew holds no letter (codepoints are
// escaped: a check may not type a character of the text).
{
  const LETTER = /[א-ת]/u;
  const marksListed = B.withheld.listed.filter((x) => !LETTER.test(x.he.normalize("NFC")));
  const saidRight = B.withheld.said === null ? B.withheld.listed.length === 0 : B.withheld.said === B.withheld.listed.length;
  const noteSaid = Number((/(\d+) readings? withheld/u.exec(bothNote) || [])[1] || 0);
  check("C12 a scribal mark is text, never a withheld reading; the count said is the count listed",
    marksListed.length === 0 && saidRight && noteSaid === B.withheld.listed.length,
    `${B.withheld.listed.length} listed, ${B.withheld.said === null ? "no count said" : `${B.withheld.said} said`} in the file, ${noteSaid} on the page${marksListed.length ? ` · listed with no letter: ${marksListed.map((x) => x.at).join(", ")}` : ""}`);
  check("C13 the file speaks of no mark in its text that it does not print",
    !/marked \[(withheld|not reached)\]/u.test(both) || /\[(withheld|not reached)\]/u.test(both.split("# Records, as received")[0].split("# The Hebrew text")[1] || ""),
    /marked \[/u.test(both) ? "says readings are marked where they stood" : "says nothing of marks in the text");
}

// ---- the English-only file carries the same apparatus -----------------
const { text: en } = await grab(2);
const E = parse(en);
check("C14 the English file numbers its records too", E.marks.length > 0 && E.entries.size > 1,
  `${new Set(E.marks).size} sources cited in ${E.records.length} records`);
check("C15 and still names the Hebrew's license, which it did not carry a word of",
  E.entries.has("H"), (E.entries.get("H")?.head || "absent").slice(0, 40));

// ---- the Hebrew-only file -------------------------------------------
const { text: he } = await grab(1);
const H = parse(he);
check("C16 the Hebrew-only file cites the Hebrew and nothing else",
  H.entries.has("H") && H.entries.size === 1, `${H.entries.size} entries`);
check("C17 and carries no record it did not export", H.records.length === 0 && !/^\s+source: \[\d+\]/mu.test(he), `${H.records.length} records`);

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
