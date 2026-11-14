#!/usr/bin/env node
// RUN: tree
// GUARDS: word-senses-rule-v1-a-word-sense-is-not-a-definition-and-prints-only-under-the-word-senses-switch-which-rests-off
// LEDGER: -
// no frame letter. A check reads the record, the overlay and the page, and judges them; it is not the ledger for one.
//
// A WORD SENSE IS NOT A DEFINITION (the owner, 13 November 2026, of the notes Jastrow sets in square brackets on a
// word's sense, which the dictionary beside the store serves as readings of their own: "toggle it so it could be
// like 'toggle on word senses' and the actual R pill showing something like 'word sense, not definition: pointed
// out'"; whether the switch rests on or off, "leave that to elijah": it rests off). The corpus lane lists the rows
// (relay v185.1), tools/bake-word-senses-v1.mjs carries them to the page, and the page holds them back while the
// switch is off and prints them as word senses while it is on.
//
//   W1  the record the page reads (data/word-senses/jastrow-v1.json) is the bake of the corpus lane's pinned list
//       against the served overlay as it stands: the bytes the tool writes now, every row one the overlay holds
//   W2  on a first visit the switch rests off, and nothing on the device says otherwise; and the page reads the
//       record as baked against the overlay it serves (a record of another version marks nothing)
//   W3  on cards found from the record and the zones, never named, the smallest works first: with the switch off
//       no pill prints a word sense; a card whose word senses the other gates leave says how many it holds back,
//       with a press; the press shows exactly that many, each a pill of its own that begins «word sense, not
//       definition: »,
//       stands on Jastrow's records alone, says on itself that it is a word sense and wears the page's purple
//       (the owner, 14 November 2026: «maybe instead of in blue it should be in purple»), while no other pill
//       says so or wears it, and every other pill stays where it stood; pressed again, the card is as it was
//       Each word sense shown, pressed, lights its record on the record card, says nothing was cut out of it, and
//       prints Jastrow's bracketed entry where one prints its words (the review's critic, 14 November 2026).
//       Nor does a blue pill on Jastrow's records alone print a word sense's words while it is held back (its
//       bare twin: the review of 14 November 2026, Obadiah 1:8 «retentive»).
//   W4  the reset pill puts the switch back where it rests
//   W5  a word sense the reader pressed prints on the line under the word, and is held back from it with the rest
//       when the switch goes off: the line reads what it read before the press; a reading the reader pressed on
//       another word of the verse, no word sense, stays where it was (found by the page lane's own probe, 14
//       November 2026, at Obadiah 1:3: the card held the word sense back and the line went on printing it)
//   W7  every served Jastrow row that prints a listed word sense's words under its key and source id is in the
//       record, listed or as its twin, so none stands at rest as a definition
//   W6  the owner's legend, «brackets mean sense, not definition», stands in the page's purple under a record on the
//       record card exactly where the record of word senses says it holds (its legend: one bracket, its words a
//       word sense on the corpus lane's list), and under no other record pressed: on cards found from the legend's
//       rows that can print first (most of Jastrow's bracketed entries stand behind a bare row of the same reading,
//       which prints instead), smallest works first, every pill a Jastrow record stands behind pressed, and one other, with
//       the switch at rest and the pointing lifted, so Jastrow's records reach the cards; the record asked is the
//       one whose wording prints (the owner, 14 November
//       2026: «should it say that in purple somewhere if we are stripping the brackets»)
//
// Run: node tools/check-word-senses-v1.mjs
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { bakeWordSenses, WORD_SENSES_RECORD, WORD_SENSE_PRINTS } from "./bake-word-senses-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const first = (list, n = 3) => list.slice(0, n).join(" · ");

// ---- W1: the record is the bake ---------------------------------------------------------------------------------
let record = null, why = "";
let fresh = null;
try { fresh = `${JSON.stringify(bakeWordSenses())}\n`; } catch (e) { why = `the bake refuses: ${e.message}`; }
if (!existsSync(WORD_SENSES_RECORD)) why = why || "no record at data/word-senses/jastrow-v1.json";
else {
  const disk = readFileSync(WORD_SENSES_RECORD, "utf8");
  try { record = JSON.parse(disk); } catch (e) { why = why || `the record is not JSON (${e.message})`; }
  if (fresh && disk !== fresh) why = why || "the record on disk is not what the bake writes from the pinned list and the overlay as they stand: run tools/bake-word-senses-v1.mjs";
}
check("W1  the record the page reads is the bake of the corpus lane's pinned list against the served overlay", !why && !!record,
  why || `${record.counts.rows} rows under ${record.counts.keys} keys, each found in the overlay by its key, rank and source id`);
if (!record) { console.log(`\n${bad} FAILED`); process.exit(1); }

// the dictionary's own source ids, read off the overlay's index
const jix = JSON.parse(readFileSync(join(K3, "data", "overlays", "jastrow", "index.json"), "utf8"));
const OWN = new Set(Object.keys(jix.m_sources || {}));

// ---- the places to open: words whose key the record names, in works addressed chapter:verse:word ----------------
const VERSE = /^\d+:\d+$/u;
const works = zonesOnDisk().map((id) => ({ id, size: statSync(join(K3, "data", "zones", `${id}.bin`)).size }))
  .sort((a, b) => a.size - b.size || (a.id < b.id ? -1 : 1));
const placesIn = (id, most) => {
  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${id}.bin`))).toString("utf8"));
  const out = [];
  for (const sec of z.sections || []) {
    if (!VERSE.test(String(sec.label || ""))) continue;
    const words = (sec.words || []).filter((w) => !w.mark);
    words.forEach((w, i) => { if (out.length < most && w.k && record.rows[w.k]) out.push({ label: String(sec.label), n: i + 1 }); });
    if (out.length >= most) break;
  }
  return out;
};

/** IN THE PAGE. The card standing open: its pills (each with the sources under it) and the word senses' press. */
const cardNow = () => {
  const hud = document.getElementById("hud");
  const pills = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => ({ t: x.textContent.trim(), by: x.dataset.by || "", sense: x.dataset.sense === "1", ink: getComputedStyle(x).color }));
  const b = document.querySelector("#hud .withheld-line .senses-switch");
  // the page's purple, as the card computes it
  let purple = "";
  if (hud) { const probe = document.createElement("i"); probe.style.color = "var(--argaman)"; hud.append(probe); purple = getComputedStyle(probe).color; probe.remove(); }
  return { open: !!hud && !hud.hidden, pills, purple, btn: b ? { t: b.textContent.trim(), pressed: b.getAttribute("aria-pressed") } : null, senses: window.__senses };
};
const settled = async (p, test = (s) => s.open && (s.pills.length > 0 || s.btn)) => {
  let last = "", now = null;
  for (let i = 0; i < 40; i += 1) {
    await p.waitForTimeout(250);
    now = await p.evaluate(cardNow);
    const k = JSON.stringify(now);
    if (test(now) && k === last) return now;
    last = k;
  }
  return now;
};
const texts = (s) => (s ? s.pills.map((x) => x.t) : []);
// the press, through the page: a card laid tight on a short window keeps its notes out of sight (as it keeps the
// pointing's and the entry's counts), and a mouse cannot press what is not drawn; the switch is the same either way
const press = (p) => p.evaluate(() => { const b = document.querySelector("#hud .withheld-line .senses-switch"); if (b) b.click(); return !!b; });
// the Jastrow overlay's served rows under a key, as the shard holds them
const jShards = new Map();
const jastrowRowsOf = (k) => {
  const sh = createHash("sha256").update(Buffer.from(k, "utf8")).digest("hex").slice(0, 2);
  if (!jShards.has(sh)) { const f = join(K3, "data", "overlays", "jastrow", "shards", `${sh}.bin`); jShards.set(sh, existsSync(f) ? JSON.parse(gunzipSync(readFileSync(f)).toString("utf8")) : {}); }
  return jShards.get(sh)[k] || [];
};
// IN THE PAGE. Each word sense the card shows, pressed in turn: what its record card prints
const pressSenses = (p) => p.evaluate(async () => {
  const out = [];
  for (const x of [...document.querySelectorAll("#hud > .rows .b-read .r-pills button.sense")]) {
    x.click(); await new Promise((r) => setTimeout(r, 200));
    const d = document.querySelector("#hud .d-card");
    out.push({ pill: x.textContent.trim(), key: d ? d.dataset.key || "" : "", text: d ? ((d.querySelector(".d-text") || {}).textContent || "").trim() : "", lit: !!(d && d.querySelector(".d-text .d-sense.on")), cut: !!(d && d.querySelector(".d-cut")) });
  }
  return out;
});
// IN THE PAGE. The line under a word, by its verse and its place among the verse's words (marks not counted), as a
// reader sees it, its license chip left off
const lineAt = (p, q) => p.evaluate(([label, n]) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "").trim() === label);
  const wb = sec ? sec.querySelectorAll(".he-text .wb:not(.mark)")[n - 1] : null;
  const g = wb ? wb.querySelector(":scope > .g") || wb.querySelector(".g") : null;
  if (!g) return null;
  const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  return c.textContent.trim();
}, [q.label, q.n]);
const openAt = async (p, q, test) => { await p.keyboard.press("Escape"); await p.waitForTimeout(150); await p.evaluate((h) => { location.hash = h; }, `${q.label}:${q.n}`); return settled(p, test); };

const tree = await serveTree(K3);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const w2 = { said: null, kept: null };
const w3 = { works: [], opened: 0, atRest: 0, printedAtRest: [], hits: [], faults: [] };
const w4 = { judged: false, ok: false, said: "" };
const w5 = { judged: false, ok: false, said: "" };
const w6 = { cards: 0, pressed: 0, shown: [], quiet: 0, faults: [] };
try {
  for (const { id } of works) {
    if (w3.hits.length >= 2 || w3.opened >= 160) break;
    const places = placesIn(id, 40);
    if (!places.length) continue;
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const p = await ctx.newPage();
      await p.addInitScript(() => { try { if (!sessionStorage.getItem("ws-check")) { localStorage.clear(); sessionStorage.setItem("ws-check", "1"); } } catch { /* a page with no memory is a first visit */ } });
      await p.goto(`${tree.base}/zone.html?b=${id}`, { waitUntil: "networkidle", timeout: 120000 });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      if (w2.said === null) { w2.said = await p.evaluate(() => window.__senses); w2.fit = await p.evaluate(() => window.__sensesFit); w2.kept = await p.evaluate(() => { try { return localStorage.getItem("fh.senses"); } catch { return null; } }); }
      w3.works.push(id);
      for (const at of places) {
        if (w3.hits.length >= 2 || w3.opened >= 160) break;
        await p.keyboard.press("Escape"); await p.waitForTimeout(150);
        await p.evaluate((h) => { location.hash = h; }, `${at.label}:${at.n}`);
        const rest = await settled(p);
        if (!rest || !rest.open) continue;
        w3.opened += 1; w3.atRest += 1;
        const printed = rest.pills.filter((x) => x.t.startsWith(WORD_SENSE_PRINTS) || x.sense || x.ink === rest.purple);
        if (printed.length) w3.printedAtRest.push(`${id} ${at.label}:${at.n}: «${printed[0].t}»${printed[0].sense ? " (marked a word sense)" : ""}${printed[0].ink === rest.purple ? " (purple)" : ""}`);
        if (!rest.btn) continue;
        // a card that holds word senses back
        const where = `${id} ${at.label}:${at.n}`;
        const m = /^(\d+) word senses?, not definitions?, held back/u.exec(rest.btn.t);
        if (!m || rest.btn.pressed !== "false") { w3.faults.push(`${where}: the press reads «${rest.btn.t}» (${rest.btn.pressed})`); continue; }
        const n = Number(m[1]);
        await press(p);
        const on = await settled(p, (s) => s.open && !!s.btn && s.btn.pressed === "true");
        const shown = on.pills.filter((x) => x.t.startsWith(WORD_SENSE_PRINTS));
        const others = on.pills.filter((x) => !x.t.startsWith(WORD_SENSE_PRINTS)).map((x) => x.t);
        const notOwn = shown.filter((x) => !x.by || x.by.split(" ").some((mid) => !OWN.has(mid)));
        if (on.senses !== "on") w3.faults.push(`${where}: the press left the switch ${on.senses}`);
        if (!on.btn || !new RegExp(`^${n} word senses? shown`, "u").test(on.btn.t)) w3.faults.push(`${where}: shown, the press reads «${on.btn ? on.btn.t : "nothing"}»`);
        // a word sense's words on a blue pill of Jastrow's records alone, while held back (its twin)
        // each word sense shown, pressed: its record card; then the reading the card had pressed, pressed again, so
        // no word sense stays chosen when the switch goes off (which would lay the sections again and shut the card)
        const wasPressed = await p.evaluate(() => { const x = document.querySelector("#hud > .rows .b-read .r-pills button[aria-pressed=true]"); return x ? x.textContent.trim() : null; });
        const pressedSenses = await pressSenses(p);
        await p.evaluate((t) => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((y) => y.textContent.trim() === t); if (x) x.click(); }, wasPressed);
        await p.waitForTimeout(300);
        for (const r of pressedSenses) {
          const words = r.pill.slice(WORD_SENSE_PRINTS.length);
          const bracketedServed = jastrowRowsOf(r.key).some((x) => OWN.has(x[3]) && x[1] === words && /\[/u.test(String(x[2] || "")));
          if (!r.lit) w3.faults.push(`${where}: pressed «${r.pill}», its record «${r.text.slice(0, 50)}» is not lit`);
          if (r.cut) w3.faults.push(`${where}: pressed «${r.pill}», the card says the reading was cut out of «${r.text.slice(0, 50)}»`);
          if (bracketedServed && !r.text.includes("[")) w3.faults.push(`${where}: pressed «${r.pill}», the card prints «${r.text.slice(0, 50)}» bare though Jastrow serves the bracketed entry`);
        }
        const twinAtRest = rest.pills.filter((x) => !x.t.startsWith(WORD_SENSE_PRINTS) && x.by && x.by.split(" ").every((mid) => OWN.has(mid)) && shown.some((y) => y.t.slice(WORD_SENSE_PRINTS.length) === x.t));
        if (twinAtRest.length) w3.faults.push(`${where}: at rest «${twinAtRest[0].t}» prints as a definition on ${twinAtRest[0].by}, while its word sense is held back`);
        if (shown.length !== n) w3.faults.push(`${where}: the press said ${n} held back and showed ${shown.length} word sense${shown.length === 1 ? "" : "s"}`);
        if (notOwn.length) w3.faults.push(`${where}: «${notOwn[0].t}» stands on ${notOwn[0].by || "no record"}, not on Jastrow's alone`);
        const notPurple = shown.filter((x) => !x.sense || x.ink !== on.purple);
        if (!on.purple || notPurple.length) w3.faults.push(`${where}: «${notPurple.length ? notPurple[0].t : ""}» ${notPurple.length && !notPurple[0].sense ? "does not say it is a word sense" : `wears ${notPurple.length ? notPurple[0].ink : "?"}, not the page's purple ${on.purple || "(none computed)"}`}`);
        const posing = on.pills.filter((x) => !x.t.startsWith(WORD_SENSE_PRINTS) && (x.sense || x.ink === on.purple));
        if (posing.length) w3.faults.push(`${where}: «${posing[0].t}» is no word sense and ${posing[0].sense ? "says it is one" : "wears the purple"}`);
        if (JSON.stringify(others) !== JSON.stringify(texts(rest))) w3.faults.push(`${where}: shown, the other pills moved (${rest.pills.length} before, ${others.length} after)`);
        await press(p);
        const back = await settled(p, (s) => s.open && !!s.btn && s.btn.pressed === "false");
        if (JSON.stringify(texts(back)) !== JSON.stringify(texts(rest))) w3.faults.push(`${where}: held back again, the card is not as it was`);
        w3.hits.push(`${where}: ${n} held back, ${shown.length} pill${shown.length === 1 ? "" : "s"} shown («${shown.length ? shown[0].t : ""}»)`);
        // W4, once: shown again, then the reset pill
        if (!w4.judged) {
          await press(p);
          await settled(p, (s) => s.open && !!s.btn && s.btn.pressed === "true");
          await p.keyboard.press("Escape"); await p.waitForTimeout(200);
          const before = await p.evaluate(() => window.__senses);
          const enabled = await p.evaluate(() => { const r = document.getElementById("resetPill"); return !!r && !r.disabled; });
          if (enabled) await p.click("#resetPill");
          await p.waitForTimeout(600);
          const after = await p.evaluate(() => ({ said: window.__senses, kept: (() => { try { return localStorage.getItem("fh.senses"); } catch { return null; } })() }));
          w4.judged = true;
          w4.ok = before === "on" && enabled && after.said === "off" && after.kept === "off";
          w4.said = `before the reset ${before}, the reset pill ${enabled ? "pressed" : "not pressable"}, after it ${after.said} (kept: ${after.kept})`;
        }
        // W5, once, after the reset: a word sense pressed, a reading pressed on a word beside it, the switch off
        if (w4.judged && !w5.judged) {
          w5.judged = true;
          const atRest = await lineAt(p, at);
          await openAt(p, at, (s) => s.open && !!s.btn);
          await press(p);
          await settled(p, (s) => s.open && !!s.btn && s.btn.pressed === "true");
          const took = await p.evaluate(() => { const x = document.querySelector("#hud > .rows .b-read .r-pills button.sense"); if (!x) return null; x.click(); return x.textContent.trim(); });
          await p.waitForTimeout(800);
          const ruled = await lineAt(p, at);
          let nb = null, nbRest = null, other = null, nbRuled = null, nbSense = null, nbSensed = null;
          for (const n of [at.n - 1, at.n + 1]) {
            if (n < 1) continue;
            const q = { label: at.label, n };
            const rest0 = await lineAt(p, q);
            if (rest0 === null) continue;
            const s = await openAt(p, q);
            if (!s || !s.open) continue;
            other = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((b) => b.getAttribute("aria-pressed") !== "true" && !b.dataset.sense); if (!x) return null; x.click(); return x.textContent.trim(); });
            if (!other) continue;
            await p.waitForTimeout(800);
            nb = q; nbRest = rest0; nbRuled = await lineAt(p, q);
            // and a word sense pressed over it, where the block offers one: the switch off gives the reading back
            nbSense = await p.evaluate(() => { const x = document.querySelector("#hud > .rows .b-read .r-pills button.sense"); if (!x) return null; x.click(); return x.textContent.trim(); });
            if (nbSense) { await p.waitForTimeout(800); nbSensed = await lineAt(p, q); }
            break;
          }
          await openAt(p, at, (s) => s.open && !!s.btn && s.btn.pressed === "true");
          await press(p);
          await p.waitForTimeout(1500);
          const after = await lineAt(p, at), nbAfter = nb ? await lineAt(p, nb) : null;
          const said = await p.evaluate(() => window.__senses);
          const faults = [];
          if (!took) faults.push("no word sense's pill to press");
          else if (!ruled || !ruled.startsWith(WORD_SENSE_PRINTS)) faults.push(`pressed «${took}», the line read «${ruled}»`);
          if (said !== "off") faults.push(`the switch stood ${said} after its press`);
          if (after !== atRest) faults.push(`switched off, the line reads «${after}», not «${atRest}» as before the press`);
          if (!nb) faults.push("no word beside it offered another reading to press");
          else if (nbRuled === nbRest) faults.push(`pressed «${other}» at ${nb.label}:${nb.n}, its line stayed «${nbRest}»`);
          // a word sense pressed on a block prints among the word's other pieces («in + word sense, not definition: … + his»)
          else if (nbSense && !String(nbSensed || "").includes(WORD_SENSE_PRINTS)) faults.push(`pressed «${nbSense}» over «${other}» at ${nb.label}:${nb.n}, its line read «${nbSensed}»`);
          else if (nbAfter !== nbRuled) faults.push(`the switch off moved ${nb.label}:${nb.n}'s line from the reading pressed, «${nbRuled}», to «${nbAfter}»`);
          w5.ok = !faults.length;
          w5.said = faults.length ? faults.join(" · ") : `${where}: pressed «${took}», the line read it; switched off, the line reads «${after}» again · ${nb.label}:${nb.n} pressed «${other}»${nbSense ? `, then «${nbSense}» over it` : ""}, and «${nbAfter}» stands`;
        }
      }
    } finally { await ctx.close(); }
  }
} finally { await browser.close(); await tree.close(); }

// ---- W7: every served row that prints a listed word sense's words is in the record ----------------------------
const w7 = { senses: 0, rows: 0, outside: [] };
{
  const pin = JSON.parse(readFileSync(join(K3, "data", "word-senses", "jastrow-word-senses-v1", "PIN.json"), "utf8"));
  const listed = readFileSync(join(K3, "data", "word-senses", "jastrow-word-senses-v1", pin.word_senses.file), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.branch === "WORD_SENSE");
  const shards = new Map();
  const rowsOf = (k) => {
    const sh = createHash("sha256").update(Buffer.from(k, "utf8")).digest("hex").slice(0, 2);
    if (!shards.has(sh)) { const f = join(K3, "data", "overlays", "jastrow", "shards", `${sh}.bin`); shards.set(sh, existsSync(f) ? JSON.parse(gunzipSync(readFileSync(f)).toString("utf8")) : {}); }
    return shards.get(sh)[k] || [];
  };
  for (const r of listed) {
    w7.senses += 1;
    for (const x of rowsOf(r.k)) {
      if (x[3] !== r.m || x[1] !== r.route) continue;
      w7.rows += 1;
      if (!(record.rows[r.k] || []).some(([rk, m]) => rk === x[0] && m === x[3])) w7.outside.push(`${r.k} rank ${x[0]} ${x[3]} «${x[1]}»`);
    }
  }
}

// ---- W6: the legend, on its own cards ----------------------------------------------------------------------------
const LEG = record.legend && record.legend.rows ? record.legend.rows : {};
// the keys whose legend rows can print first on a card: Jastrow's overlay serves most bracketed entries behind a
// bare row of the same reading and source, which prints instead (EARLIEST_FIRST, then rank); a legend row with no
// such row ahead of it is one a card can show
const LEG_FIRST = new Set(Object.entries(LEG).filter(([k, list]) => {
  const shard = join(K3, "data", "overlays", "jastrow", "shards", `${createHash("sha256").update(Buffer.from(k, "utf8")).digest("hex").slice(0, 2)}.bin`);
  if (!existsSync(shard)) return false;
  const rows = JSON.parse(gunzipSync(readFileSync(shard)).toString("utf8"))[k] || [];
  return list.some(([rk, m]) => { const r = rows.find((x) => x[0] === rk && x[3] === m); return r && !rows.some((x) => x[0] < rk && x[3] === m && x[1] === r[1]); });
}).map(([k]) => k));
const legendPlaces = (id, most) => {
  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${id}.bin`))).toString("utf8"));
  const out = [];
  for (const sec of z.sections || []) {
    if (!VERSE.test(String(sec.label || ""))) continue;
    const words = (sec.words || []).filter((w) => !w.mark);
    words.forEach((w, i) => { if (out.length < most && w.k && LEG_FIRST.has(w.k)) out.push({ label: String(sec.label), n: i + 1 }); });
    if (out.length >= most) break;
  }
  return out;
};
{
  const tree6 = await serveTree(K3);
  const b6 = await (await loadPlaywright()).chromium.launch(launchOptions());
  try {
    for (const { id } of works) {
      if (w6.shown.length >= 3 || w6.cards >= 80) break;
      const places = legendPlaces(id, 30);
      if (!places.length) continue;
      const ctx = await b6.newContext({ viewport: { width: 412, height: 915 } });
      try {
        const p = await ctx.newPage();
        // the pointing lifted ("keep"), so Jastrow's records reach the cards where the verse points the word
        // otherwise than Jastrow's headword; the legend is asked of the record printed, whatever withheld others
        await p.addInitScript(() => { try { if (!sessionStorage.getItem("ws-check6")) { localStorage.clear(); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); sessionStorage.setItem("ws-check6", "1"); } } catch { /* a first visit */ } });
        await p.goto(`${tree6.base}/zone.html?b=${id}`, { waitUntil: "networkidle", timeout: 120000 });
        await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        for (const at of places) {
          if (w6.shown.length >= 3 || w6.cards >= 80) break;
          const rest = await openAt(p, at);
          if (!rest || !rest.open || !rest.pills.length) continue;
          w6.cards += 1;
          const theirs = rest.pills.map((x, i) => (x.by.split(" ").some((mid) => OWN.has(mid)) ? i : -1)).filter((i) => i >= 0);
          // and one other, so the cards also show where the legend must not stand
          const other = rest.pills.findIndex((x) => !x.by.split(" ").some((mid) => OWN.has(mid)));
          for (const i of [...theirs.slice(0, 30), ...(other >= 0 ? [other] : [])]) {
            const seen = await p.evaluate(async (i) => {
              const xs = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")];
              if (!xs[i]) return null;
              xs[i].click();
              await new Promise((r) => setTimeout(r, 120));
              const d = document.querySelector("#hud .d-card");
              const lg = d && d.querySelector(".sense-legend");
              let purple = "";
              const probe = document.createElement("i"); probe.style.color = "var(--argaman)"; document.getElementById("hud").append(probe); purple = getComputedStyle(probe).color; probe.remove();
              return { pill: xs[i].textContent.trim(), key: d ? d.dataset.key || "" : "", row: d ? d.dataset.row || "" : "", legend: lg ? lg.textContent.trim() : null, ink: lg ? getComputedStyle(lg).color : "", purple, text: ((d && d.querySelector(".d-text")) || {}).textContent || "" };
            }, i);
            if (!seen) continue;
            w6.pressed += 1;
            const want = (LEG[seen.key] || []).some(([rk, m]) => seen.row === `${rk}|${m}`);
            const where = `${id} ${at.label}:${at.n} «${seen.pill}»`;
            if (want && seen.legend === null) w6.faults.push(`${where}: its record is one the legend holds on, and the card shows no legend`);
            else if (!want && seen.legend !== null) w6.faults.push(`${where}: the card shows the legend under a record it does not hold on (${seen.key} ${seen.row})`);
            else if (want && (seen.legend !== record.legend.text || seen.ink !== seen.purple)) w6.faults.push(`${where}: the legend reads «${seen.legend}» in ${seen.ink}, not «${record.legend.text}» in the page's purple ${seen.purple}`);
            else if (want) { if (w6.shown.length < 3) w6.shown.push(`${where}: «${seen.text.slice(0, 60)}» · ${seen.legend}`); }
            else w6.quiet += 1;
          }
        }
      } finally { await ctx.close(); }
    }
  } finally { await b6.close(); await tree6.close(); }
}

check("W2  on a first visit the switch rests off, and the record is the served overlay's", w2.said === "off" && w2.kept === null && w2.fit === true,
  w2.said === null ? "no page was opened" : `the page says ${w2.said}; the device keeps ${w2.kept === null ? "nothing" : w2.kept}; the record ${w2.fit === true ? "is" : "is NOT"} of the served overlay's version`);
check("W3  off, no pill prints a word sense; the card says how many it holds back, and its press shows them as word senses on Jastrow's records alone, each in the page's purple, every other pill in its place and its own ink, and holds them back again",
  w3.hits.length >= 1 && !w3.printedAtRest.length && !w3.faults.length,
  w3.printedAtRest.length ? `${w3.printedAtRest.length} card(s) print a word sense with the switch off: ${first(w3.printedAtRest)}`
    : w3.faults.length ? `${w3.faults.length} · ${first(w3.faults)}`
    : !w3.hits.length ? `${w3.opened} cards opened in ${w3.works.length} work(s) (${first(w3.works)}) and none held a word sense back for the switch to show`
    : `${w3.opened} cards opened in ${first(w3.works)}, none printing a word sense at rest · ${w3.hits.join(" · ")}`);
check("W4  the reset pill puts the switch back where it rests", w4.judged && w4.ok, w4.said || "no card held a word sense back, so the switch was never turned on to be reset");
check("W5  a word sense pressed is held back from the line when the switch goes off, and a reading pressed beside it stays", w5.judged && w5.ok, w5.said || "no card held a word sense back, so none was pressed");
check("W7  every served Jastrow row that prints a listed word sense's words under its key and source id is in the record", w7.senses > 0 && !w7.outside.length,
  w7.outside.length ? `${w7.outside.length} row(s) outside it, standing at rest as definitions · ${first(w7.outside)}` : `${w7.rows} served row(s) print the words of the ${w7.senses} listed word senses, every one in the record (${record.counts.twins} as a twin)`);
check("W6  the owner's legend stands in purple under a record exactly where the record of word senses says it holds, and under no other record pressed",
  w6.shown.length >= 1 && w6.quiet >= 1 && !w6.faults.length,
  w6.faults.length ? `${w6.faults.length} · ${first(w6.faults)}`
    : !w6.shown.length ? `${w6.pressed} pills pressed on ${w6.cards} cards and no record the legend holds on was printed`
    : `${w6.pressed} pills pressed on ${w6.cards} cards: the legend under ${w6.shown.length} record(s) it holds on, none under the other ${w6.quiet} · ${w6.shown.join(" · ")}`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
