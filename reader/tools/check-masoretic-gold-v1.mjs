#!/usr/bin/env node
// check-masoretic-gold-v1 · every Masoretic mark on the line is gold by its class, and its letters keep their ink and their place
//
// GUARDS: masoretic-marks-rule-v1-every-mark-is-gold-by-its-class-never-by-a-code-point-range
// LEDGER: -
// no frame letter. This writes nothing: it reads data/masoretic-marks-v1.json
// (written by tools/project-masoretic-marks-v1.mjs) and the page.
//
// The owner's vote, relayed by Moses on 2026-10-11: "every mark gold, vowels
// included", and "Colour by class, never by code point range".
//
// G1  the record: 39 books laid on the zones with nothing astray, and a code
//     point is gold exactly where every class the lane gave it in that kind
//     of word is a mark class, so no letter is ever gold
// G2  the page, on the first book the record carries: every run of the
//     opening sections' words that holds a mark is gold (a leaf of marks, or
//     a leaf whose letters are laid over it), each laid-over string is the
//     run with its gold characters taken out, the marks are drawn in the
//     marks' gold and the letters in the word's own ink, the letters laid over
//     are silent to a screen reader, and every word's text is still the
//     zone's word byte for byte
// G3  the letters lie on their own: with the marks' gold set to the letters'
//     ink, the opening verse draws as it does with the gold off, to within
//     the edge pixels a glyph drawn twice darkens (no pixel moves by more
//     than 60 of 255 in any channel)
// G4  a work the record does not carry is one color, as before
// G5  the card's head (the owner, 2026-10-10: "if you can do the vowels in
//     gold in the same push go for it"): a card opened on a word that holds
//     a mark wears the gold at its head, each run with its letters laid over
//     in the head's own ink and silent to a screen reader, the head's text
//     still the word byte for byte, and drawn in one ink it is the plain head
//     to within its edge pixels
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const PORT = process.env.SERVE_PORT || "8899";   // the runner serves 8899; a hand run says its own
let bad = 0;
const check = (name, ok, say) => { console.log(`${ok ? "  ok " : "FAIL "} ${name}${say ? `  ·  ${say}` : ""}`); if (!ok) bad += 1; };

// G1 — the record
const R = JSON.parse(readFileSync("data/masoretic-marks-v1.json", "utf8"));
const markOf = { places: new Set(R.mark_classes.places), mark_words: new Set(R.mark_classes.mark_words) };
const astray = [];
for (const kind of ["places", "mark_words"]) {
  const gold = new Set(R.gold[kind]);
  for (const [cp, cls] of Object.entries(R.classes_seen[kind])) {
    const names = Object.keys(cls), marks = names.filter((c) => markOf[kind].has(c));
    const should = marks.length > 0 && marks.length === names.length;
    if (should !== gold.has(cp) || (marks.length && !should)) astray.push(`${kind} U+${cp}`);
    if (names.includes("LETTER") && gold.has(cp)) astray.push(`${kind} U+${cp} is a letter`);
  }
  for (const cp of gold) if (!R.classes_seen[kind][cp]) astray.push(`${kind} U+${cp} gold and never seen`);
}
check("G1  the record lays 39 books on the zones, and a code point is gold exactly where every class it is given is a mark",
  R.candidate_only === true && R.books.length === 39 && R.counts.mismatched === 0 && R.counts.disagreeing_code_points === 0
    && /^[0-9a-f]{64}$/.test(R.from.classes.sha256) && R.relay === "FOR-ELIJAH-v72.2.1.md" && astray.length === 0 && R.gold.places.length > 0,
  `${R.books.length} books · ${R.counts.places.toLocaleString()} places · ${R.counts.marks_places.toLocaleString()} marks · ${R.gold.places.length} + ${R.gold.mark_words.length} code points gold${astray.length ? ` · astray: ${astray.slice(0, 4).join(", ")}` : ""}`);

// G2-G4 — the page
const BOOK = R.books[0];
const Z = JSON.parse(gunzipSync(readFileSync(`data/zones/${BOOK}.bin`)).toString("utf8"));
const zoneWords = new Map();
for (const sec of Z.sections || []) zoneWords.set(sec.label, (sec.words || []).map((w) => w.s));
// a work the record does not carry: the first the store pins that is not one of its books
const store = JSON.parse(readFileSync("data/zone-store-v1.json", "utf8"));
const other = Object.keys(store.pins || {}).map((k) => k.replace(/\.bin$/u, "")).sort().find((k) => !R.books.includes(k));
const { chromium } = await loadPlaywright();
const b = await chromium.launch(launchOptions());
const open = async (book) => {
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`http://127.0.0.1:${PORT}/zone.html?b=${encodeURIComponent(book)}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(600);
  return p;
};
const p = await open(BOOK);
const g2 = await p.evaluate(([gp, gm]) => {
  const goldP = new Set(gp.map((h) => String.fromCodePoint(parseInt(h, 16)))), goldM = new Set(gm.map((h) => String.fromCodePoint(parseInt(h, 16))));
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--mark-ink").trim();
  const probe = document.createElement("span"); probe.style.color = ink; document.body.append(probe);
  const inkRgb = getComputedStyle(probe).color; probe.remove();
  let runs = 0, gold = 0, wrongL = 0, wrongInk = 0, loud = 0, leaves = 0;
  const words = [];
  for (const sec of document.querySelectorAll("section.seg")) {
    const label = sec.querySelector(".vnum")?.textContent || "";
    const ws = [...sec.querySelectorAll(".he-text .wb > .w")];
    if (!ws.length) continue;
    words.push([label, ws.map((w) => w.textContent)]);
    for (const w of ws) {
      const set = w.closest(".wb.mark") ? goldM : goldP;
      const tw = document.createTreeWalker(w, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (![...n.data].some((c) => set.has(c))) continue;
        runs += 1;
        const leaf = n.parentElement.closest(".mg, .mg-all");
        if (!leaf) continue;
        gold += 1;
        const cs = getComputedStyle(leaf);
        if (cs.webkitTextFillColor !== inkRgb) wrongInk += 1;
        if (!leaf.classList.contains("mg")) continue;
        leaves += 1;
        const want = [...leaf.textContent].filter((c) => !set.has(c)).join("");
        if (leaf.dataset.l !== want) wrongL += 1;
        const bs = getComputedStyle(leaf, "::before");
        if (bs.webkitTextFillColor !== cs.color) wrongInk += 1;
        if (!/\/\s*""\s*$/u.test(bs.content)) loud += 1;
      }
    }
  }
  return { on: document.documentElement.dataset.markInk, inkRgb, runs, gold, leaves, wrongL, wrongInk, loud, words };
}, [R.gold.places, R.gold.mark_words]);
let textOff = 0, textN = 0;
for (const [label, ws] of g2.words) {
  const z = zoneWords.get(label);
  if (!z) continue;
  // a joined run's words are drawn in one cell; the words drawn are compared in order
  const flat = z.join(""), drawn = ws.join("");
  textN += 1;
  if (flat !== drawn) textOff += 1;
}
check(`G2  on ${BOOK}, every run of the opening words that holds a mark is gold, and the letters laid over are the run without its marks`,
  g2.on === "gold" && g2.runs > 0 && g2.gold === g2.runs && g2.wrongL === 0 && g2.leaves > 0,
  `${g2.gold} of ${g2.runs} runs gold · ${g2.leaves} with letters laid over · ${g2.wrongL} laid-over strings astray`);
check("    the marks wear the marks' gold and the letters the word's own ink, silent to a screen reader",
  g2.wrongInk === 0 && g2.loud === 0, `gold ${g2.inkRgb} · ${g2.wrongInk} in the wrong ink · ${g2.loud} laid-over strings a screen reader would speak`);
check("    and every word's text is still the zone's word, byte for byte", textN > 0 && textOff === 0, `${textN} sections · ${textOff} astray`);

// G3 — the letters lie on their own
const sec = await p.$("section.seg .he-text");
await p.addStyleTag({ content: ".g, .g-lic, .lic-chip { visibility: hidden !important; }" });
await p.evaluate(() => { const r = document.documentElement; r.style.setProperty("--mark-ink", getComputedStyle(document.querySelector(".he-text .w")).color); });
const twice = (await sec.screenshot()).toString("base64");
await p.evaluate(() => { document.documentElement.dataset.markInk = "none"; });
const plain = (await sec.screenshot()).toString("base64");
await p.evaluate(() => { const r = document.documentElement; r.style.removeProperty("--mark-ink"); r.dataset.markInk = "gold"; });
const g3 = await p.evaluate(async ([a, c]) => {
  const load = async (b64) => { const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode(); const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const x = cv.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
  const A = await load(a), C = await load(c);
  if (A.width !== C.width || A.height !== C.height) return { size: `${A.width}x${A.height} against ${C.width}x${C.height}` };
  let moved = 0, worst = 0;
  for (let i = 0; i < A.data.length; i += 4) {
    const d = Math.max(Math.abs(A.data[i] - C.data[i]), Math.abs(A.data[i + 1] - C.data[i + 1]), Math.abs(A.data[i + 2] - C.data[i + 2]));
    if (d > worst) worst = d;
    if (d > 60) moved += 1;
  }
  return { moved, worst };
}, [twice, plain]);
check("G3  the letters laid over lie on the word's own: drawn in one ink, the opening verse is the plain verse to within its edge pixels",
  !g3.size && g3.moved === 0, g3.size ? `the shots differ in size: ${g3.size}` : `${g3.moved} pixels moved · the largest change ${g3.worst} of 255`);

// G5 — the card's head wears the same gold
const hit = await p.evaluate(() => {
  const w = [...document.querySelectorAll("section.seg .he-text .wb:not(.mark) > .w")].find((x) => x.matches(".mg") || x.querySelector(".mg"));
  if (!w) return null;
  w.scrollIntoView({ block: "center" }); w.click();
  return w.textContent;
});
let g5 = null;
if (hit) {
  await p.waitForSelector("#hud .head b", { timeout: 15000 }).catch(() => null);
  await p.waitForTimeout(700);
  g5 = await p.evaluate(([gp, word]) => {
    const gold = new Set(gp.map((h) => String.fromCodePoint(parseInt(h, 16))));
    const b = document.querySelector("#hud .head b");
    if (!b) return { none: true };
    const probe = document.createElement("span"); probe.style.color = "var(--mark-ink)"; document.body.append(probe);
    const inkRgb = getComputedStyle(probe).color; probe.remove();
    const own = getComputedStyle(b).color;
    let leaves = 0, laid = 0, wrongL = 0, wrongInk = 0, loud = 0;
    // the head itself is the leaf when it holds one run, as a word's own element is on the line
    for (const leaf of [b, ...b.querySelectorAll(".mg, .mg-all")].filter((e) => e.matches(".mg, .mg-all"))) {
      leaves += 1;
      const cs = getComputedStyle(leaf);
      if (cs.webkitTextFillColor !== inkRgb) wrongInk += 1;
      if (!leaf.classList.contains("mg")) continue;
      laid += 1;
      if (leaf.dataset.l !== [...leaf.textContent].filter((ch) => !gold.has(ch)).join("")) wrongL += 1;
      const bs = getComputedStyle(leaf, "::before");
      if (bs.webkitTextFillColor !== own) wrongInk += 1;
      if (!/\/\s*""\s*$/u.test(bs.content)) loud += 1;
    }
    return { leaves, laid, wrongL, wrongInk, loud, inkRgb, own, same: b.textContent === word, text: b.textContent };
  }, [R.gold.places, hit]);
  if (g5 && !g5.none) {
    // drawn in one ink, the head is the plain head
    const head = await p.$("#hud .head b");
    await p.evaluate(() => { const r = document.documentElement; r.style.setProperty("--mark-ink", getComputedStyle(document.querySelector("#hud .head b")).color); });
    const one = (await head.screenshot()).toString("base64");
    await p.evaluate(() => { document.documentElement.dataset.markInk = "none"; });
    const bare = (await head.screenshot()).toString("base64");
    await p.evaluate(() => { const r = document.documentElement; r.style.removeProperty("--mark-ink"); r.dataset.markInk = "gold"; });
    g5.px = await p.evaluate(async ([a, c]) => {
      const load = async (b64) => { const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode(); const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const x = cv.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
      const A = await load(a), C = await load(c);
      if (A.width !== C.width || A.height !== C.height) return { size: `${A.width}x${A.height} against ${C.width}x${C.height}` };
      let moved = 0;
      for (let i = 0; i < A.data.length; i += 4) if (Math.max(Math.abs(A.data[i] - C.data[i]), Math.abs(A.data[i + 1] - C.data[i + 1]), Math.abs(A.data[i + 2] - C.data[i + 2])) > 60) moved += 1;
      return { moved };
    }, [one, bare]);
  }
}
check("G5  an opened card's head wears the gold, its letters laid over in the head's own ink, silent, the word byte for byte, lying on their own",
  !!g5 && !g5.none && g5.leaves > 0 && g5.laid > 0 && g5.wrongL === 0 && g5.wrongInk === 0 && g5.loud === 0 && g5.same && !!g5.px && !g5.px.size && g5.px.moved === 0,
  !hit ? "no word of the opening sections holds a mark" : !g5 || g5.none ? "no card opened" : `${g5.leaves} gold runs at the head · ${g5.laid} with letters laid over · ${g5.wrongL} laid-over strings astray · ${g5.wrongInk} in the wrong ink (gold ${g5.inkRgb}, the head's own ${g5.own}) · ${g5.loud} spoken · text ${g5.same ? "the word's" : `"${g5.text}" against "${hit}"`} · ${g5.px ? (g5.px.size ? `shots differ in size: ${g5.px.size}` : `${g5.px.moved} pixels moved in one ink`) : "not drawn"}`);
await p.close();

// G4 — a work the record does not carry
if (other) {
  const q = await open(other);
  const g4 = await q.evaluate(() => ({ on: document.documentElement.dataset.markInk || "", n: document.querySelectorAll(".mg, .mg-all, [data-l]").length }));
  check(`G4  a work the record does not carry (${other}) is one color`, g4.on !== "gold" && g4.n === 0, `${g4.n} gold runs · ink ${g4.on || "unset"}`);
  await q.close();
} else check("G4  a work the record does not carry is one color", false, "the store pins no work outside the record");
await b.close();
console.log(bad ? `${bad} failure(s)` : "all ok");
process.exit(bad ? 1 : 0);
