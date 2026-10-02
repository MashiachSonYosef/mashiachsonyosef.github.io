#!/usr/bin/env node
// GUARDS: v-volume-rule-v1-a-count-is-served-only-with-the-scope-it-was-counted-over
//
// THE COUNTS LAYER, PRESSED. The projection check reads the numbers out of
// the sidecars; this one opens the page and presses a word.
//
// The owner ruled on 2026-09-14: the verse, chapter and book counts are
// served, and the scope is said out loud. The scope is the whole of the
// ruling, because without it the page contradicts its own door — V holds no
// commentary on Amos and this site serves one, and both sentences are true
// of different sets. A number with no set beside it is how two truths come
// to look like a lie.
//
// So this check is about four sentences and one silence:
//
//   V1  a verse the ledger counts says its number, and names the scope
//   V2  a verse it counts nothing on falls to its chapter, and names the scope
//   V3  a chapter it counts nothing on falls to its book, and names the scope
//   V4  a book it counts nothing on says so by the book's own name — V's
//       proposed name, which the owner adopted — and names the scope
//   V5  NOTHING IN THE PANEL IS PRESSABLE. The word layer is not served
//       because this lane holds none of the fourteen works that anchor it,
//       so a count here opens nothing, and a page that makes it look like it
//       does has made the offer the ruling was written to avoid.
//   V6  "1 comment", never "1 comments"
//   V7  the panel names the set the count was taken over
//   V8  and it is sized like the footnote it is, because fixed prose on this
//       card is bought from the controls and paid for by the card's place
//       under the word
//
// Every case is found by reading the sidecars, never by naming a book: the
// verse pressed is whatever verse on this shelf exhibits that case today.
// SKIPS by name when no volume sidecar rides beside a served book.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesServed, zonesWithVolume } from "./zones-on-disk-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const served = new Set(zonesServed());
const books = zonesWithVolume().filter((z) => served.has(z));
if (!books.length) {
  console.log("SKIPPED — no served book carries a <slug>.volume.bin, so check-v-volume-in-card-v1 has no count to press");
  process.exit(3);
}

const vol = new Map(), zoneOf = new Map();
for (const b of books) {
  vol.set(b, JSON.parse(gunzipSync(readFileSync(`data/zones/${b}.volume.bin`)).toString("utf8")));
  zoneOf.set(b, JSON.parse(gunzipSync(readFileSync(`data/zones/${b}.bin`)).toString("utf8")));
}

// One site per case, found rather than named. A site is a book, a section of
// it that carries a pressable word, and what the sidecar says about it.
const siteFor = (want) => {
  for (const b of books) {
    const v = vol.get(b), z = zoneOf.get(b);
    const BN = (v.book || {}).pairs || 0;
    for (const s of z.sections || []) {
      const ref = s.label, ch = String(ref).split(":")[0];
      const N = (v.verses || {})[ref] || 0, CN = (v.chapters || {})[ch] || 0;
      if (!(s.words || []).some((w) => !w.mark && (w.k || w.w))) continue;
      if (!want({ N, CN, BN })) continue;
      return { book: b, ref, N, CN, BN, display: v.display_name, scope: (v.scope || {}).say };
    }
  }
  return null;
};
const CASES = [
  ["V1  a verse the ledger counts says its number, and names the scope", ({ N }) => N > 1],
  ["V2  a verse it counts nothing on falls to its chapter, and names the scope", ({ N, CN }) => !N && CN > 0],
  ["V3  a chapter it counts nothing on falls to its book, and names the scope", ({ N, CN, BN }) => !N && !CN && BN > 0],
  ["V4  a book it counts nothing on says so by the book's own name", ({ BN }) => !BN],
  ["V6  the singular is a singular", ({ N }) => N === 1],
];

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const BASE = (defaultZoneUrl()).split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });

console.log(`— ${books.length} served book(s) carry a volume sidecar · ${books.filter((x) => (vol.get(x).book || {}).pairs).length} of them carry a count —`);

// Press the first pressable word of a verse and read the panel back.
const readPanel = async (book, ref) => {
  await p.goto(`${BASE}?b=${book}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const open = () => p.evaluate((lab) => {
    const s = [...document.querySelectorAll("section.seg")].find((x) => x.textContent.trimStart().startsWith(lab));
    if (!s) return { err: "the section is not rendered" };
    s.scrollIntoView({ block: "center" });
    const t = [...s.querySelectorAll(".wb")].filter((e) => !e.classList.contains("mark"))
      .flatMap((wb) => { const rs = [...wb.querySelectorAll(".wr")]; return rs.length ? rs : [wb]; })[0];
    if (!t) return { err: "the verse draws no pressable word" };
    t.scrollIntoView({ block: "center" });
    t.click();
    return { ok: true };
  }, ref);
  await open();
  await p.waitForTimeout(400);
  const r = await open();           // twice: the first scroll renders the verse
  await p.waitForTimeout(1200);
  if (r.err) return { err: r.err };
  return p.evaluate(() => {
    const box = document.querySelector("#hud .vol");
    if (!box) return { drawn: false };
    return {
      drawn: true,
      say: (box.querySelector(".vol-say") || {}).textContent || "",
      n: (box.querySelector(".vol-n") || {}).textContent || "",
      // a count is not an offer: nothing here may be a link or a control
      pressable: box.querySelectorAll("a, button, [role=button], [onclick]").length,
    };
  });
};

let pressable = 0, panels = 0;
for (const [name, want] of CASES) {
  const site = siteFor(want);
  if (!site) { check(name, false, "no verse on this shelf exhibits that case — the check cannot stand on nothing"); continue; }
  const got = await readPanel(site.book, site.ref);
  if (got.err || !got.drawn) { check(name, false, `${site.book} ${site.ref} · ${got.err || "no panel drew"}`); continue; }
  panels += 1;
  pressable += got.pressable;
  const scopeSaid = got.say.includes(site.scope);
  // what the sentence must carry, by case
  const N = site.N, CN = site.CN, BN = site.BN;
  const want_n = N ? N : CN ? CN : BN ? BN : null;
  const noun = `${(want_n || 0).toLocaleString()} comment${want_n === 1 ? "" : "s"}`;
  // The shape asserts what the sentence must SAY, not how it was worded on
  // the day the check was written. The panel was three paragraphs until the
  // overlaps gate showed what they cost the card; it is one sentence now, and
  // two of these patterns had to be edited to admit a comma. A check that
  // pins the prose fails every time the prose improves, and a check nobody
  // can improve the prose past is a check that stops being read.
  const shape = N ? /^[\d,]+ comments? on this verse\b/u
    : CN ? /^No commentary on this verse\. [\d,]+ comments? in this chapter\b/u
      : BN ? /^No commentary in this chapter\. [\d,]+ comments? in this book\b/u
        : new RegExp(`^No commentary on ${site.display.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\b`, "u");
  const numOk = want_n === null ? got.n === "" : got.n === noun;
  check(name, scopeSaid && numOk && shape.test(got.say),
    `${site.book} ${site.ref} · ${JSON.stringify(got.say)}`);
}

check("V5  nothing in the panel is pressable — a count is not an offer",
  panels > 0 && pressable === 0,
  panels ? `${pressable} control(s) across ${panels} panel(s)` : "no panel drew to look at");

// And the one thing the panel must always say about itself: that the set it
// counted over is not this site's shelf. It is the sentence that stops "V
// holds no commentary on Amos" from reading as a contradiction of the door.
const lastSay = await p.evaluate(() => (document.querySelector("#hud .vol-say") || {}).textContent || "");
check("V7  the panel names the set it counted over, and says it is not this shelf",
  /\b\d+ works\b/u.test(lastSay) && /not this site's shelf/u.test(lastSay) && /not opened from here/u.test(lastSay),
  JSON.stringify(lastSay));

// V8 — AND IT COSTS THE CARD LITTLE ENOUGH TO STAY UNDER ITS WORD.
//
// placeHud caps the card to the room beneath the word and releases that cap
// the moment fitBands reports the bands can no longer hold a row each. So
// fixed prose on this card is not free: it is bought from the controls, and
// past a point the card pays by standing somewhere else. The first draft of
// this panel took 134px in three paragraphs and cost the card its place under
// the word on a 360x640 phone — check-nothing-overlaps-v1 caught it, and this
// clause is here so that gate is not the only thing standing between a longer
// sentence and a card over the reader's text.
const panelH = await p.evaluate(() => {
  const el = document.querySelector("#hud .vol");
  return el ? Math.round(el.getBoundingClientRect().height) : null;
});
const BUDGET = 80;
check("V8  the panel is a footnote and is sized like one",
  panelH !== null && panelH <= BUDGET,
  panelH === null ? "no panel to measure" : `${panelH}px of a ${BUDGET}px budget on a 412px screen`);

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
