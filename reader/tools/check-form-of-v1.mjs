// RUN: page
// A READING THAT POINTS AT ANOTHER WORD'S READING (the corpus lane's map of
// pointer readings, since 13 November 2026 its relay v175, kept in
// data/pointer-entries/: a source's reading written as "singular construct
// state form of <Hebrew>" or "passive of <Hebrew>" points at an entry, which
// the lane names from the pointer's own bytes, and resolves to that entry's
// first English where the store serves a row with it; baked under the
// owner's rulings of that day by tools/bake-form-of-pills-v1.mjs into
// data/form-of-pills-v1.json). The
// owner's law (data/rule-demonstrations-v1.json): the C0 never moves;
// selection governs what is defined, never what is displayed. So:
//   F1  the record stands: a map keyed by route key, each entry naming the
//       pointer's source, its text, its relation and target, and, where the
//       lane resolved it, the resolved reading's key and text; its counts are
//       its own entries (the pills it carries; JUDGMENT, USAGE_NOTE and NOT
//       pointers are read and counted but wait on the owner's branch)
//   F2  the page loads the map after its first paint and says so
//       (window.__formOf: keys, pills, resolved as the record counts them)
//   F3  on the card of a word whose key holds a resolved pointer, with every
//       switch lifted: the pointer's pill prints the resolved reading with
//       the pointer's relation and target in parentheses and carries the
//       pointer's own text as data-pointer (the pill is the source's row;
//       what it prints is the resolution); the pointer's bare text stands on
//       no pill
//   F4  that pill pressed, a ruling: the line under the word prints the
//       same, and the Hebrew is the Hebrew
//   F5  another pill pressed moves the line to that reading; the pointer
//       pill pressed again puts the resolved text back on the line, and the
//       Hebrew never moved
//   F6  the record is the corpus lane's pinned file under the owner's pinned
//       rulings, derived again here: every pure pointer of the file and no
//       other reading; each resolved as the file resolves it, or by the
//       source's first entry where the pointer cannot tell its entries apart
//       and the ruling rests that branch so; none resolved to a text that is
//       itself a pure pointer; no reading with English of its own
//   F7  on the page, with every switch lifted: a reading the lane classes as
//       having English of its own beside its pointer stands on a pill as its
//       own words, and that pill carries no pointer
//   F8  a pointer whose text holds a "/" (the source's own, which prints
//       " + "): F3 to F5 hold for it too. The page once found a pointer's
//       entry by its text as written on the pill and as printed on the
//       line, so such a pointer resolved on its pill and stood bare on the
//       line once pressed. A word carrying one is found on purpose and
//       pressed, where any is served
// The words are found from the data on disk, never named here
// (check-scope-derived S1). NO LINE RESTS ON A PURE POINTER under the map of
// 13 November 2026: the forty plain words whose lead was a pointer under the
// map before it were readings with English of their own, which print as
// themselves now. So the pointer is met on its pill, and on the line once
// the pill is pressed.
// Usage: node tools/check-form-of-v1.mjs [url-base]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zoneUrls, zoneIdOf } from "./zones-on-disk-v1.mjs";
import { readPinnedLines } from "./pinned-v1.mjs";
import { rulingsPinned } from "./rulings-v1.mjs";
import { openRouteStore, routePrinted, printedForm } from "./gloss-store-v1.mjs";
import { STATES } from "./card-readings-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const RECORD = "data/form-of-pills-v1.json";
const noDot = (t) => String(t).replace(/\.$/u, "");
const target = (e) => { if (!e.at) return e.target; const b = Buffer.from(e.t, "utf8"); return b.subarray(e.at[0], e.at[1]).toString("utf8") || e.target; };
const says = (e) => `${e.resolved.text} (${e.relation} ${target(e)})`;

// F1 the record
const rec = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, "utf8")) : null;
const entries = rec ? Object.values(rec.keys).flat() : [];
const resolved = entries.filter((e) => e.resolved);
const wellFormed = entries.every((e) => e.m && e.t && e.class === "FORM_OF" && e.relation && e.target && (!e.resolved || (e.resolved.key && e.resolved.text)));
check("F1  the record: a map by route key of pointers with source, text, relation and target, and the resolution the lane found; its counts are its own entries",
  !!rec && rec.keys && wellFormed && rec.counts.carried === entries.length && rec.counts.pills >= entries.length && rec.counts.resolved === resolved.length && resolved.length > 0,
  rec ? `${Object.keys(rec.keys).length} keys · ${entries.length} pointers carried (record says ${rec.counts.carried} of ${rec.counts.pills} read) · ${resolved.length} resolved (record says ${rec.counts.resolved}) · well formed ${wellFormed}` : "no record");
if (!rec) { console.log("\nFAIL"); process.exit(1); }

// F6 the record against the lane's own file and the owner's rulings, derived again
const PIN_DIR = "data/pointer-entries";
let lane = [];
{
  const faults = [];
  let several = null;
  try {
    const pin = JSON.parse(readFileSync(`${PIN_DIR}/PIN.json`, "utf8"));
    lane = readPinnedLines(`${PIN_DIR}/${pin.folder}/${pin.map.file}`, pin.map, `${pin.folder}/${pin.map.file}`);
    if ((rec.taken_from || {}).sha256 !== pin.map.sha256) faults.push("the record was not baked from the pinned map");
    const on = rulingsPinned().filter((r) => [r.file, ...(r.files || [])].some((f) => f && f.sha256 === pin.map.sha256));
    if (!on.some((r) => r.class === "MIXED" && typeof r.print === "string")) faults.push("no pinned ruling says what a reading with English of its own prints");
    several = (on.find((r) => r.branch === "several_branch") || {}).resting ?? null;
  } catch (e) { faults.push(e.message); }
  const id = (...parts) => parts.join("\u0001");
  const pure = new Set(lane.filter((l) => l.class === "FORM_OF").map((l) => id(l.key, noDot(l.text))));
  const want = new Map();   // key, source, text -> the resolution the file gives it under the rulings, or null
  for (const l of lane) {
    if (l.class !== "FORM_OF") continue;
    const fo = l.form_of || {};
    let r = fo.resolved && fo.resolved.text ? fo.resolved : null;
    if (!r && several === "FIRST_IN_THE_SOURCES_ORDER") { const f = (fo.several_branch || {}).first_in_the_sources_order; r = f && f.resolved && f.resolved.text ? f.resolved : null; }
    if (r && pure.has(id(r.key, noDot(r.text)))) r = null;
    want.set(id(l.key, l.m_id, l.text), r ? id(r.key, r.text) : null);
  }
  const have = new Map();
  for (const [k, list] of Object.entries(rec.keys)) for (const e of list) have.set(id(k, e.m, e.t), e.resolved ? id(e.resolved.key, e.resolved.text) : null);
  const say = (x) => x.split("\u0001").join(" · ").slice(0, 90);
  for (const [x, r] of want) { if (!have.has(x)) faults.push(`a pure pointer of the lane's file is not in the record: ${say(x)}`); else if (have.get(x) !== r) faults.push(`the record resolves a pointer otherwise than the lane's file under the rulings: ${say(x)}`); }
  for (const x of have.keys()) if (!want.has(x)) faults.push(`the record carries a reading that is no pure pointer of the lane's file: ${say(x)}`);
  const mixed = lane.filter((l) => l.class === "MIXED").length;
  check("F6  the record is the corpus lane's pinned file under the owner's pinned rulings, derived again: every pure pointer and no other reading, each resolved as the file and the rulings say",
    lane.length > 0 && faults.length === 0,
    faults.length ? `${faults.length} · ${faults.slice(0, 3).join(" · ")}` : `${lane.length} lines of the lane's file · ${want.size} pure pointers, ${[...want.values()].filter(Boolean).length} resolved · the branch of several entries rests at ${several} · ${mixed} readings with English of their own are not in the record`);
}

// the words: served plain words whose key holds a row of the pointer's own source that carries a resolved pointer
const urls = zoneUrls();
const base = /^https?:/u.test(process.argv[2] || "") ? process.argv[2].replace(/\/zone\.html.*$/u, "") : null;
const store = openRouteStore("data/route-store");
// two lists, so both kinds are pressed on purpose: the words whose pointer's text holds no "/", and those whose
// pointer's text holds one (law F8)
const plainOnes = [], slashed = [];
const MAX = 12, MAX_SLASHED = 6;
{
  const seen = new Set();
  const full = () => plainOnes.length >= MAX && slashed.length >= MAX_SLASHED;
  for (const u of urls) {
    if (full()) break;
    const id = zoneIdOf(u); const path = `data/zones/${id}.bin`;
    if (!existsSync(path)) continue;
    const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [ei, w] of (sec.words || []).entries()) {
      if (full()) break;
      // one region its place does not divide, so the card opens on its whole form; in no span, joined to no word
      const l = w.k && !w.w && !seen.has(w.k) ? rec.keys[w.k] : null;
      if (!l || (z.spans && z.spans[w.k]) || /\u05BE/u.test(w.s || "") || (ei > 0 && /\u05BE$/u.test(sec.words[ei - 1].s || "")) || (Array.isArray(w.pg) && w.pg.length > 1)) continue;
      seen.add(w.k);
      const rows = (store.routesFor(w.k) || []).filter((r) => store.index.m_sources[r[3]]);
      const carried = (x) => x.resolved && store.carriersOf(rows, x.t).some((r) => String(r[3]) === x.m);
      const here = { url: base ? `${base}/zone.html?b=${id}` : u, id, label: sec.label, section: si, entry: ei, key: w.k, surface: w.s };
      const plain = plainOnes.length < MAX ? l.find((x) => !x.t.includes("/") && carried(x)) : null;
      const slash = slashed.length < MAX_SLASHED ? l.find((x) => x.t.includes("/") && carried(x)) : null;
      if (plain) plainOnes.push({ ...here, e: plain });
      if (slash) slashed.push({ ...here, e: slash });
    }
  }
}
// F3 to F5 are witnessed on a pointer with no "/" where one is served
const candidates = plainOnes.length ? plainOnes : slashed;
check("F0  served zones hold plain words whose key carries a resolved pointer on a row of its own source (found from the zones on disk and the store)", candidates.length > 0,
  candidates.length ? `${candidates.length} word(s) in ${new Set(candidates.map((c) => c.id)).size} zone(s), and ${slashed.length} whose pointer's text holds a "/"; first ${candidates[0].id} ${candidates[0].label}, entry ${candidates[0].entry} · pointer "${candidates[0].e.t}" (${candidates[0].e.m}) · resolves to "${candidates[0].e.resolved.text}" under ${candidates[0].e.resolved.key}` : `none among ${urls.length} zones`);
if (!candidates.length) { console.log(bad ? "\nFAIL" : "\nall checks passed"); process.exit(bad ? 1 : 0); }

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
// in the page: the word's card opened as a reader opens it; then what stands on the card and under the word
const openCard = async ({ section, entry }) => {
  const hud = document.getElementById("hud");
  const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
  const sec = document.querySelectorAll("section.seg")[section];
  const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
  if (!wb) return "the word is not on the page";
  wb.scrollIntoView({ block: "center" });
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  const t0 = Date.now();
  while (!settled() && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50));
  return settled() ? null : "the card's readings did not arrive";
};
const cardNow = ({ section, entry }) => {
  const sec = document.querySelectorAll("section.seg")[section];
  const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
  const g = wb ? wb.querySelector(":scope > .g") : null;
  let line = "";
  if (g) { const c = g.cloneNode(true); for (const x of c.querySelectorAll(".g-lic, .lic-chip, .lic")) x.remove(); line = c.textContent.trim(); }
  return {
    line, he: wb ? ((wb.querySelector(":scope > .w") || {}).textContent || "").trim() : "",
    pills: [...document.querySelectorAll("#hud > .rows > .b-read > .r-pills > button")].map((x) => ({ t: x.textContent.trim(), pointer: x.dataset.pointer || null, by: x.dataset.by || "", pressed: x.getAttribute("aria-pressed") === "true" })),
  };
};
const pressPill = (i) => { document.querySelectorAll("#hud > .rows > .b-read > .r-pills > button")[i].click(); };
// the pill carries the pointer's own text as it prints (printedForm: a "/" of the source's prints " + ")
const pointerPill = (card, e) => card.pills.findIndex((x) => x.pointer && printedForm(x.pointer) === printedForm(e.t) && x.by.split(/[\s,]+/u).includes(e.m));
// the letters alone: accents, meteg, rafe, masora circle, paseq, sof pasuq and the marks U+05C4 to U+05C7 set aside
// (points are kept: a resolution moves no point either)
const MARKS = new RegExp("[\\u0591-\\u05AF\\u05BD\\u05BF\\u05C0\\u05C3-\\u05C7\\s]", "gu");
const sameHe = (x, y) => String(x || "").normalize("NFC").replace(MARKS, "") === String(y || "").normalize("NFC").replace(MARKS, "");
// One word's pointer, pressed as a reader presses it. The first word of the list whose card carries the pointer on
// a pill is taken, and everything the laws ask is read from it: the pill as the card opens (F3), the line once the
// pill is pressed (F4), and the line after another pill is pressed and the pointer's pressed again (F5).
let map = null;
const pressed = async (list) => {
  const tried = [];
  for (const c of list) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
    const q = await ctx.newPage();
    q.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
    await q.goto(c.url, { waitUntil: "networkidle" });
    // every switch that withholds a reading lifted, so no row is kept off the card
    await q.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, STATES.lifted.keep);
    await q.reload({ waitUntil: "networkidle" });
    await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    // the map arrives after the first paint
    await q.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => null);
    map = await q.evaluate(() => (window.__formOf === undefined ? "never" : window.__formOf));
    await linesOnPage(q, { from: c.section, to: c.section + 1 });
    const fault = await q.evaluate(openCard, c);
    await q.waitForTimeout(600);
    const first = fault ? null : await q.evaluate(cardNow, c);
    const at = first ? pointerPill(first, c.e) : -1;
    tried.push(`${c.id} ${c.label}, entry ${c.entry} (${c.key}): ${fault || (at < 0 ? "no pill carries the pointer" : "its pill stands")}`);
    if (at < 0) { await ctx.close(); continue; }
    const want = says(c.e);
    const pill = first.pills[at];
    const bare = first.pills.filter((x) => printedForm(x.t) === printedForm(c.e.t)).length;
    // the pill pressed: a ruling
    await q.evaluate(pressPill, at); await q.waitForTimeout(700);
    const ruled = await q.evaluate(cardNow, c);
    const stands = ruled.pills[pointerPill(ruled, c.e)] || null;
    // another ruling, and back
    const other = ruled.pills.findIndex((x) => !x.pressed && !x.pointer);
    let f5 = null;
    if (other >= 0) {
      await q.evaluate(pressPill, other); await q.waitForTimeout(700);
      const moved = await q.evaluate(cardNow, c);
      const back = pointerPill(moved, c.e);
      if (back >= 0) { await q.evaluate(pressPill, back); await q.waitForTimeout(700); }
      const restored = await q.evaluate(cardNow, c);
      f5 = { other: ruled.pills[other].t, moved: moved.line, back: back >= 0, restored: restored.line, he0: ruled.he, he1: restored.he };
    }
    await ctx.close();
    return { found: c, tried, want, first, pill, bare, ruled, stands, f5 };
  }
  return { found: null, tried };
};
// what the three laws ask of a pressed word
const f3Holds = (x) => x.pill.t === x.want && x.bare === 0;
const f4Holds = (x) => x.ruled.line === x.want && !!x.stands && x.stands.pressed && sameHe(x.ruled.he, x.found.surface);
const f5Holds = (x) => !!x.f5 && x.f5.moved !== x.want && x.f5.moved.includes(noDot(x.f5.other).split(" + ")[0].slice(0, 12)) && x.f5.back && x.f5.restored === x.want && x.f5.he0 === x.f5.he1;
const one = await pressed(candidates);
check("F2  the page loads the map after its first paint and says so", !!map && map !== "never" && map.keys === Object.keys(rec.keys).length && map.pills === rec.counts.pills && map.resolved === rec.counts.resolved,
  JSON.stringify(map));
if (!one.found) check("F3  the pointer's pill prints the resolved reading and carries the pointer's own text", false, `no card of ${candidates.length} pressed carried its pointer on a pill: ${one.tried.join(" | ")}`);
else {
  const { found, want, first, pill, bare, ruled, stands, f5, tried } = one;
  check("F3  with every switch lifted the pointer's pill prints the resolved reading with the relation and target in parentheses and carries the pointer's own text; the pointer's bare text stands on no pill",
    f3Holds(one),
    `${found.id} ${found.label}, entry ${found.entry} (${found.key}): pill "${pill.t}" · wanted "${want}" · data-pointer "${pill.pointer}" · the bare pointer on ${bare} pill(s) · ${first.pills.filter((x) => x.pointer).length} pointer pill(s) of ${first.pills.length}${tried.length > 1 ? ` · tried ${tried.join(" | ")}` : ""}`);
  check("F4  that pill pressed, the line under the word prints the same, and the Hebrew is the Hebrew",
    f4Holds(one),
    `line "${ruled.line}" · wanted "${want}" · the pill ${stands && stands.pressed ? "pressed" : "not pressed"} · Hebrew ${sameHe(ruled.he, found.surface) ? "unmoved" : `"${ruled.he}" vs "${found.surface}"`}`);
  check("F5  another pill pressed moves the line to it; the pointer pill pressed again puts the resolution back; the Hebrew never moved",
    f5Holds(one),
    f5 ? `"${f5.other}" -> line "${f5.moved}" · back -> "${f5.restored}" · Hebrew ${f5.he0 === f5.he1 ? "unmoved" : "MOVED"}` : "the card offers no other plain pill to press");
}
// F8 the same on a pointer whose text holds a "/"
{
  const slashedInRecord = resolved.filter((e) => e.t.includes("/")).length;
  const held = candidates === slashed ? one : slashed.length ? await pressed(slashed) : null;
  const where = held && held.found ? `${held.found.id} ${held.found.label}, entry ${held.found.entry} (${held.found.key})` : "";
  check("F8  a pointer whose text holds a \"/\": its pill prints the resolution, the line prints the same once it is pressed, and pressed again after another it is put back",
    slashed.length === 0 || (!!held && !!held.found && f3Holds(held) && f4Holds(held) && f5Holds(held)),
    slashed.length === 0 ? `no served plain word carries one on a row of its own source (${slashedInRecord} of the record's ${resolved.length} resolved pointers hold a "/"), so there is nothing to press`
      : !held.found ? `no card of ${slashed.length} pressed carried its pointer on a pill: ${held.tried.join(" | ")}`
        : `${where}${held === one ? ", the word of F3 to F5" : ""}: pointer "${held.found.e.t}" · pill "${held.pill.t}" · pressed, line "${held.ruled.line}" · wanted "${held.want}"${held.f5 ? ` · after "${held.f5.other}" and back: "${held.f5.restored}"` : " · the card offers no other plain pill to press"} · ${slashed.length} such word(s) found, ${slashedInRecord} of the record's ${resolved.length} resolved pointers hold a "/"`);
}
// F7 a reading with English of its own prints its own words. The words are found in the data: a served plain word
// whose key holds such a reading on a row its ledger leaves whole; its card is opened with every switch lifted
{
  const mixedOf = new Map();   // key -> its readings with English of their own, as the lane's file names them
  for (const l of lane) if (l.class === "MIXED") (mixedOf.get(l.key) || mixedOf.set(l.key, []).get(l.key)).push(l);
  const picks = [], seen = new Set();
  for (const u of urls) {
    if (picks.length >= 8) break;
    const zid = zoneIdOf(u), path = `data/zones/${zid}.bin`;
    if (!existsSync(path)) continue;
    const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [ei, w] of (sec.words || []).entries()) {
      if (picks.length >= 8 || !w.k || w.w || seen.has(w.k) || !mixedOf.has(w.k) || (z.spans && z.spans[w.k]) || /\u05BE/u.test(w.s || "")) continue;
      const row = (store.routesFor(w.k) || []).find((r) => !Array.isArray(r[7]) && !Array.isArray(r[8]) && mixedOf.get(w.k).some((l) => l.m_id === String(r[3]) && l.text === String(r[1])));
      if (!row) continue;
      seen.add(w.k);
      picks.push({ url: base ? `${base}/zone.html?b=${zid}` : u, zone: zid, label: sec.label, section: si, entry: ei, key: w.k, m: String(row[3]), own: printedForm(routePrinted(row).trim()) });
    }
  }
  const faults = [], judged = [];
  for (const pick of picks) {
    const c2 = await b.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const q = await c2.newPage();
      await q.goto(pick.url, { waitUntil: "networkidle" });
      await q.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, STATES.lifted.keep);
      await q.reload({ waitUntil: "networkidle" });
      await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await q.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => null);
      await linesOnPage(q, { from: pick.section, to: pick.section + 1 });
      const got = await q.evaluate(async ({ section, entry, m, own }) => {
        const hud = document.getElementById("hud");
        const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        const sec = document.querySelectorAll("section.seg")[section];
        const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
        if (!wb) return { fault: "the word is not on the page" };
        wb.scrollIntoView({ block: "center" });
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = Date.now();
        while (!settled() && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50));
        if (!settled()) return { fault: "the card's readings did not arrive" };
        await new Promise((r) => setTimeout(r, 600));
        const mine = [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")].filter((x) => (x.dataset.by || "").split(/[\s,]+/u).includes(m));
        const asItself = mine.find((x) => x.textContent === own);
        const over = mine.find((x) => (x.dataset.pointer || "") === own);
        return { pills: mine.length, asItself: !!asItself, pointerOnIt: asItself ? asItself.dataset.pointer || null : null, printedOver: over ? over.textContent : null };
      }, pick);
      const where = `${pick.zone} ${pick.label}, entry ${pick.entry} (${pick.key}, ${pick.m})`;
      if (got.fault) { faults.push(`${where}: ${got.fault}`); continue; }
      if (got.printedOver !== null) faults.push(`${where}: «${pick.own.slice(0, 50)}» is printed over as «${String(got.printedOver).slice(0, 50)}»`);
      if (!got.asItself) continue;   // the card opened on a division of the word, or the reading is grouped under another's wording
      if (got.pointerOnIt) faults.push(`${where}: the pill of «${pick.own.slice(0, 50)}» carries a pointer`);
      judged.push(where);
    } finally { await c2.close(); }
  }
  check("F7  a reading with English of its own beside its pointer stands on a pill as its own words, and carries no pointer", faults.length === 0 && judged.length > 0,
    faults.length ? `${faults.length} · ${faults.slice(0, 3).join(" · ")}` : judged.length ? `${judged.length} of ${picks.length} cards pressed showed the reading: ${judged[0]}` : `none of ${picks.length} cards pressed showed such a reading on a pill of its own`);
}
await b.close();
console.log(bad ? `\nFAIL ${bad}` : "\nall checks passed");
process.exit(bad ? 1 : 0);
