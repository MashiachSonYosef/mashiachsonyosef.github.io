// THE CARD SPEAKS IN THE CHANNELS (the owner, 2026-10-18, on a card whose
// head, divisions and record had all gone purple: "we seem to have lost our
// color scheme inside the hud, the hebrew should still be red even the
// compspans and megacompspans, and the english definitionals should still be
// blue even the M's D card"). The corpus's letters are the red, a
// dictionary's words are the blue, and the page's own voice is the purple
// (check-color-channels-v1 holds the values; this holds where they go on a
// card). Words are found by tapping the served pages' own words, never named
// here (check-scope-derived S1).
//   C1  every piece of the corpus's letters on a card is the red, the regular:
//       the head, the head's other words of a chain or a pair, every division
//       pill (compspan and megacompspan alike) at rest and pressed, and the
//       letters a label of ours quotes; a gold-mark leaf draws its letters in
//       the red
//   C2  a dictionary's words are the blue, the regular: the D record, its lit
//       sense, the reading pills and the reading the line shows; Hebrew a
//       dictionary quotes is its words and stays in its blue, and a line
//       saying a reading is absent is the page speaking
//   C3  the lit sense of the record is the blue worn bold
//   C4  a pressed division pill is the red worn bold
//   C5  the word of a chain or a pair the card is not open on is the red at
//       the regular weight, beside the open word's bold
//   C6  with the concordance hud on, its table and its dropdown hold to C1
//       and C2
// Every facet has to have been met at least once, or it fails as unexercised.
// Usage: node tools/check-card-channels-v1.mjs [url] (one page; with none,
// the first three served pages)
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zoneUrls } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  \u00B7  " + d : ""}`); };
const ARG = /^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "";
const URLS = ARG ? [ARG] : zoneUrls().slice(0, 3);
const PER = 24;
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });

// one read of the open card: every text it shows, sorted into the channels
const read = (p) => p.evaluate(() => {
  const hud = document.getElementById("hud");
  if (!hud || hud.hidden || !hud.getClientRects().length) return null;
  const ink = (v) => { const e = document.createElement("i"); e.style.color = `var(${v})`; document.body.append(e); const c = getComputedStyle(e).color; e.remove(); return c; };
  const RED = ink("--shani"), BLUE = ink("--tekhelet");
  const HE = /[\u05D0-\u05EA]/u, LAT = /[A-Za-z]/u;
  const DICT = ".d-text, .r-pills button, .r-now .v";
  const r = { he: 0, heBad: [], dict: 0, dictBad: [], lit: [], pressedDiv: [], other: [], label: 0, menu: 0, table: !!hud.querySelector(".dict-tab") };
  const where = (el) => { const a = []; for (let e = el; e && e !== hud && a.length < 3; e = e.parentElement) a.unshift(e.tagName.toLowerCase() + (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/u).join(".") : "")); return a.join(">"); };
  const w = document.createTreeWalker(hud, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const t = n.textContent;
    if (!t.trim()) continue;
    const el = n.parentElement, cs = getComputedStyle(el);
    if (!el.getClientRects().length || cs.visibility === "hidden") continue;
    const dict = el.closest(DICT);
    if (HE.test(t) && !dict) {
      r.he += 1;
      const leaf = el.classList.contains("mg") ? getComputedStyle(el, "::before").webkitTextFillColor : RED;
      if (cs.color !== RED || leaf !== RED) r.heBad.push(`${where(el)} ${cs.color}${leaf !== RED ? " leaf " + leaf : ""}`);
      if (el.classList.contains("he-q")) { r.label += 1; if (el.closest(".menu")) r.menu += 1; }
    } else if (dict && LAT.test(t) && !el.closest(".none")) {
      r.dict += 1;
      if (cs.color !== BLUE) r.dictBad.push(`${where(el)} ${cs.color}`);
    }
  }
  hud.querySelectorAll(".d-text .d-sense.on").forEach((x) => { if (x.getClientRects().length) r.lit.push({ c: getComputedStyle(x).color === BLUE, w: Number(getComputedStyle(x).fontWeight) }); });
  hud.querySelectorAll(".s-pills button[aria-pressed=\"true\"]").forEach((x) => { if (x.getClientRects().length) r.pressedDiv.push({ c: getComputedStyle(x).color === RED, w: Number(getComputedStyle(x).fontWeight) }); });
  const head = hud.querySelector(".head b");
  if (head) {
    const segs = [...head.children].filter((x) => !x.classList.contains("mq"));
    const open = segs.filter((x) => !x.hasAttribute("role")), other = segs.filter((x) => x.hasAttribute("role"));
    if (open.length && other.length) r.other.push({ c: other.every((x) => getComputedStyle(x).color === RED), w: other.map((x) => Number(getComputedStyle(x).fontWeight)), open: open.map((x) => Number(getComputedStyle(x).fontWeight)) });
  }
  return r;
});

const seen = { he: 0, dict: 0, lit: 0, pressedDiv: 0, other: 0, label: 0, tableHe: 0, tableDict: 0, menuLabel: 0 };
const heBad = new Map(), dictBad = new Map(), litBad = [], divBad = [], otherBad = [];
const take = (r, tag) => {
  if (!r) return;
  seen.he += r.he; seen.dict += r.dict; seen.label += r.label; seen.menuLabel += r.menu;
  if (r.table) { seen.tableHe += r.he; seen.tableDict += r.dict; }
  r.heBad.forEach((x) => heBad.set(x, heBad.get(x) || tag));
  r.dictBad.forEach((x) => dictBad.set(x, dictBad.get(x) || tag));
  r.lit.forEach((x) => { seen.lit += 1; if (!x.c || x.w < 600) litBad.push(`${tag} ${JSON.stringify(x)}`); });
  r.pressedDiv.forEach((x) => { seen.pressedDiv += 1; if (!x.c || x.w < 600) divBad.push(`${tag} ${JSON.stringify(x)}`); });
  r.other.forEach((x) => { seen.other += 1; if (!x.c || !x.w.every((v) => v < 600) || !x.open.every((v) => v >= 600)) otherBad.push(`${tag} ${JSON.stringify(x)}`); });
};

let cards = 0;
for (const [k, url] of URLS.entries()) for (const dict of k === 0 ? ["off", "on"] : ["off"]) {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${url}${url.includes("?") ? "&" : "?"}dict=${dict}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const total = await p.evaluate(() => document.querySelectorAll(".he-text .wb:not(.mark)").length);
  for (let i = 0; i < Math.min(dict === "on" ? 8 : PER, total); i += 1) {
    const tag = `${url.split("b=")[1] || url} word ${i + 1}${dict === "on" ? " concordance" : ""}`;
    const ok = await p.evaluate((i) => { const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i]; if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; }, i);
    if (!ok) continue;
    await p.waitForTimeout(450);
    cards += 1;
    take(await read(p), tag);
    // every division pill pressed in turn (the chain's and the blocks' alike)
    const nS = await p.evaluate(() => document.querySelectorAll("#hud .s-pills button").length);
    for (let j = 0; j < Math.min(nS, 6); j += 1) {
      await p.evaluate((j) => { const x = document.querySelectorAll("#hud .s-pills button")[j]; if (x) x.click(); }, j);
      await p.waitForTimeout(220);
      take(await read(p), `${tag} division ${j + 1}`);
    }
    // a second reading pressed lights another sense of its record
    await p.evaluate(() => { const x = document.querySelectorAll("#hud > .rows .r-pills button")[1]; if (x) x.click(); });
    await p.waitForTimeout(220);
    take(await read(p), `${tag} reading 2`);
    if (dict === "on") {
      await p.evaluate(() => { const m = document.querySelector("#hud .dict-tab tbody tr.pick .r-pills button[aria-expanded=\"false\"]"); if (m) m.click(); });
      await p.waitForTimeout(350);
      take(await read(p), `${tag} dropdown`);
    }
    await p.keyboard.press("Escape");
    await p.waitForTimeout(120);
  }
  await p.close();
}
await b.close();

const list = (m) => [...m.entries()].slice(0, 6).map(([x, t]) => `${x} (${t})`).join(" | ");
console.log(`${cards} cards on ${URLS.length} page(s)`);
check("C1 the corpus's letters on a card are the red", seen.he > 0 && heBad.size === 0, heBad.size ? `${heBad.size} kinds not red: ${list(heBad)}` : `${seen.he} texts read`);
check("C1 and the letters a label of ours quotes", seen.label > 0, `${seen.label} quoted`);
check("C2 a dictionary's words are the blue", seen.dict > 0 && dictBad.size === 0, dictBad.size ? `${dictBad.size} kinds not blue: ${list(dictBad)}` : `${seen.dict} texts read`);
check("C3 the lit sense of the record is the blue worn bold", seen.lit > 0 && !litBad.length, litBad.length ? litBad.slice(0, 4).join(" | ") : `${seen.lit} lit senses`);
check("C4 a pressed division pill is the red worn bold", seen.pressedDiv > 0 && !divBad.length, divBad.length ? divBad.slice(0, 4).join(" | ") : `${seen.pressedDiv} pressed`);
check("C5 the head's other word is the red at the regular weight", seen.other > 0 && !otherBad.length, otherBad.length ? otherBad.slice(0, 4).join(" | ") : `${seen.other} heads with another word`);
check("C6 the concordance hud holds to C1 and C2", seen.tableHe > 0 && seen.tableDict > 0 && seen.menuLabel > 0, `${seen.tableHe} letters, ${seen.tableDict} dictionary texts, ${seen.menuLabel} quoted in its dropdown`);
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
