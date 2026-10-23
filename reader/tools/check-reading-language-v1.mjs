// THE LANGUAGE OF A PLACE ON THE CONCORDANCE ROW (dictionary store v1.2,
// Moses's relay FOR-ELIJAH-v79.1, 22 October 2026: every place of a reading
// carries the language its source's own line gives, HEBREW or ARAMAIC; the
// page's "Hebrew · 4 locations").
//   L1  a reading whose places are all one language: the row says that
//       language under its count, and no place in the list repeats it
//   L2  a reading whose places divide by language: the row says each
//       language with its count, the counts summing to the locations, and
//       every place in the list says its own
//   L3  the count's hover, on the row and in the dropdown, says the language
//       and the count in one breath: "Hebrew · 4 locations"
// The readings are found in the served shards: the first one-language
// reading at a place of the first served zone, and the divided reading with
// the most places anywhere; no book is named here (check-scope-derived S1).
// Usage: node tools/check-reading-language-v1.mjs [url]
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zoneIdOf } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const URL0 = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
const BOOK = zoneIdOf(URL0);
const urlAt = (book, ref, w) => { const u = new URL(URL0); u.searchParams.set("b", book); u.searchParams.set("dict", "on"); u.hash = `${ref}:${w}`; return u.href; };
// ---- the store: a reading's places by language, as the page files them ---
const DIR = "data/dictionary-store/shards";
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");
const LANG_NAME = { HEBREW: "Hebrew", ARAMAIC: "Aramaic" };
const langName = (v) => String(v || "").split("|").map((x) => LANG_NAME[x] || x).join("/");
const nbsp = (s) => String(s || "").replace(/ /gu, " ");
let one = null, divided = null;
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".bin")).sort()) {
  const shard = JSON.parse(gunzipSync(readFileSync(`${DIR}/${f}`)).toString("utf8"));
  for (const [key, e] of Object.entries(shard)) {
    // the places of each exact reading text, over every source, one per place
    const byText = new Map();
    for (const g of e.readings || []) {
      if (typeof g.reading !== "string") continue;
      const t = spanJoin(g.reading);
      if (!byText.has(t)) byText.set(t, new Map());
      for (const q of g.places || []) { if (q.side) continue; const pk = `${q.book}|${q.ref}|${q.w_page}`; if (!byText.get(t).has(pk)) byText.get(t).set(pk, q); }
    }
    for (const [t, places] of byText) {
      const langs = new Map();
      for (const q of places.values()) if (q.lang) langs.set(q.lang, (langs.get(q.lang) || 0) + 1);
      const at = [...places.values()].sort((a, b) => a.book.localeCompare(b.book) || a.ref.localeCompare(b.ref, undefined, { numeric: true }) || a.w_page - b.w_page);
      if (!langs.size || !at.length) continue;
      const cand = { key, t, langs: [...langs].sort((a, b) => b[1] - a[1]), places: at, n: places.size };
      if (langs.size === 1 && !one && at.some((q) => q.book === BOOK) && places.size >= 2) one = { ...cand, at: at.find((q) => q.book === BOOK) };
      if (langs.size > 1 && (!divided || places.size > divided.n)) divided = { ...cand, at: at[0] };
    }
  }
}
const label = (c) => c.langs.length === 1 ? langName(c.langs[0][0]) : c.langs.map(([l, k]) => `${langName(l)} ${k}`).join(" · ");
console.log(`one language: ${one ? `"${one.t}" under ${one.key}, ${one.n} places, ${label(one)}` : "none found"}; divided: ${divided ? `"${divided.t}" under ${divided.key}, ${divided.n} places, ${label(divided)}` : "none found"}`);
// ---- the page --------------------------------------------------------------
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
const row = () => p.evaluate(() => {
  const tr = document.querySelector("#hud .dict-tab tbody tr.pick"); if (!tr) return null;
  const n = tr.children[2];
  const items = [...document.querySelectorAll("#hud .dict-tab .item")];
  return {
    pill: ((tr.querySelector(".r-pills button") || {}).textContent || "").trim(),
    count: ((n.querySelector("button.dd, span.who") || {}).textContent || "").trim(),
    lg: ((n.querySelector(".lg") || {}).textContent || "").trim(),
    hover: n.title || "",
    items: items.length,
    itemLangs: items.map((x) => ((x.querySelector(":scope > .lg") || {}).textContent || "").replace(/^\s*·\s*/u, "").trim()),
  };
});
// open the card at a place with the table on, and put the reading on the row
const openOn = async (c) => {
  await p.goto(urlAt(c.at.book, c.at.ref, c.at.w_page), { waitUntil: "networkidle" });
  await p.waitForSelector("#hud .dict-tab tbody tr.pick", { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(800);
  let r = await row();
  if (r && r.pill !== c.t) {
    await p.evaluate(() => { const rb = document.querySelector("#hud .dict-tab tbody tr.pick .r-pills button"); if (rb) rb.click(); });
    await p.waitForTimeout(400);
    const picked = await p.evaluate((t) => { const o = [...document.querySelectorAll("#hud .dict-tab .opt .r-pills button")].find((x) => x.textContent.trim() === t); if (o) o.click(); return !!o; }, c.t);
    await p.waitForTimeout(800);
    r = await row();
    if (!picked) r = { ...(r || {}), notOffered: true };
  }
  return r;
};
if (one) {
  const r = await openOn(one);
  check(`L1 a one-language reading says its language under the count, and no place repeats it (${one.at.book} ${one.at.ref}:${one.at.w_page}, "${one.t}")`,
    !!r && !r.notOffered && r.pill === one.t && r.count === `${one.n} location${one.n === 1 ? "" : "s"}` && nbsp(r.lg) === label(one) && r.items > 0 && r.itemLangs.every((x) => !x),
    r ? `row "${r.pill}" · "${r.count}" · language "${nbsp(r.lg)}" (store: ${label(one)}) · ${r.items} places listed, ${r.itemLangs.filter(Boolean).length} saying a language${r.notOffered ? " · the reading was not in the dropdown" : ""}` : "no row");
} else check("L1 a one-language reading says its language under the count", false, "no such reading found in the served shards");
if (divided) {
  const r = await openOn(divided);
  const want = label(divided);
  const sum = divided.langs.reduce((a, [, k]) => a + k, 0);
  const shownLangs = r ? r.itemLangs.slice(0, Math.min(r.items, 50)) : [];
  const storeLangs = new Set(divided.langs.map(([l]) => langName(l)));
  check(`L2 a divided reading says each language with its count, summing to the locations, and every listed place says its own (${divided.at.book} ${divided.at.ref}:${divided.at.w_page}, "${divided.t}")`,
    !!r && !r.notOffered && r.pill === divided.t && r.count === `${sum} locations` && nbsp(r.lg) === want && r.items > 0 && shownLangs.every((x) => x && storeLangs.has(x)),
    r ? `row "${r.pill}" · "${r.count}" · language "${nbsp(r.lg)}" (store: ${want}) · ${r.items} places listed, ${shownLangs.filter((x) => x && storeLangs.has(x)).length} saying a language the store gives${r.notOffered ? " · the reading was not in the dropdown" : ""}` : "no row");
  // L3: the hovers
  const hoverRow = r ? nbsp(r.hover) : "";
  await p.evaluate(() => { const rb = document.querySelector("#hud .dict-tab tbody tr.pick .r-pills button"); if (rb) rb.click(); });
  await p.waitForTimeout(400);
  const hoverOpt = nbsp(await p.evaluate((t) => { const o = [...document.querySelectorAll("#hud .dict-tab .opt")].find((x) => ((x.querySelector(".r-pills button") || {}).textContent || "").trim() === t); return o && o.querySelector(".n") ? o.querySelector(".n").title : ""; }, divided.t));
  const phrase = `${want} · ${sum} locations`;
  check("L3 the count's hover says the language and the count in one breath, on the row and in the dropdown", hoverRow.startsWith(phrase) && hoverOpt === phrase, `row "${hoverRow}" · dropdown "${hoverOpt}" · want "${phrase}"`);
} else { check("L2 a divided reading says each language with its count", false, "no reading with places in two languages found in the served shards"); check("L3 the count's hover says the language and the count", false, "no divided reading"); }
await b.close();
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
