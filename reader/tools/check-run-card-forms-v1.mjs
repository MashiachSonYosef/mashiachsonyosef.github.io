#!/usr/bin/env node
// GUARDS: megacompspan-rule-v1-one-maqaf-run-one-card, weld-forms-rule-v1-a-joined-run-is-offered-in-every-form-a-source-published-and-in-no-form-it-did-not
//
// A MAQAF RUN'S CARD HOLDS ITS LATTICE: AS WRITTEN, JOINED, AND WORD BY WORD.
//
// The owner (2026-09-24): "here the 1 word is the maqaf, even if masoretics
// count it as 2, because we need to have a lattice that holds A-maqaf-B,
// AB (weld) and A+B, not just A+B." And (2026-09-25), on a card that showed
// only the words: "missing AMB and AB in megacompspan". So the three rungs
// are always on the card, whatever the shelf answers; a fold (a joined
// spelling with a seam letter written final) only where it is published.
//
//   R1  every run's card offers the run as written and the run joined, the
//       folds a dictionary published and no fold it did not
//   R2  the words one by one are always offered
//   R3  the card never opens on a joined or folded spelling (a weld can be a
//       different word: al-pi "according to" welds to a verb "to faint"),
//       and the line under the run never reads one
//   R4  where the run as written, joiner kept, is published, the line reads
//       it and the card opens on it
//   R5  a reading chosen for one word of a run is the run's line and is
//       lit again when that word is pressed again; the line is never a dash
//       (read as one form, a run ruled cell by cell printed "—" whole)
//   R6  a shard that did not arrive is not an absence: the card says the
//       catalog could not be reached, offers to ask again, and the readings
//       come when it can; a rung nothing publishes says so in the run's
//       terms; under either the record slot stands empty, never holding
//       the last block's record; and the line under the run is never a dash
//   R7  the run's ink is printed as one word: no line is drawn between its
//       words and no padding stands at the seam — the maqaf the text writes
//       is the only thing between them (the owner, 2026-09-25)
//   R8  a card the reader left behind is dead: its retry, resumed after the
//       reader opened another word, neither draws nor takes the live card's
//       redraw — the live card still answers the order switch
//   R9  a block whose every record the reader's own switches withheld says
//       so, keeps its rung pressed and remembered, and reads again when the
//       switches come back
//   R10 the export marks a word whose shard did not arrive [not reached],
//       never [withheld], and says so in its note
//
// Expected forms are computed here from the run's own keys with the corpus
// lane's enumeration (weld-forms-v1.formsOfRun) and asked of the store on
// disk — never read off the page it judges.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
import { formsOfRun, MAQAF } from "./weld-forms-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONE = arg("zone", "amos");
const zone = JSON.parse(gunzipSync(readFileSync(`data/zones/${ZONE}.bin`)).toString("utf8"));
const store = openRouteStore("data/route-store");

// the runs, from the zone's own join records
const runs = [];
for (const sec of zone.sections || []) {
  let run = [];
  for (const w of sec.words || []) {
    const pj = w.presentation_join;
    run.push(w);
    if (pj && pj.join_next_without_separator && String(pj.why || "").startsWith("maqaf-rule-v2")) continue;
    if (run.length > 1 && run.every((x) => x.k && !x.kq)) {
      const keys = run.map((x) => x.k);
      const forms = formsOfRun(keys).filter((f) => f.form !== "pieces");
      const published = forms.filter((f) => (store.routesFor(f.key) || []).length).map((f) => ({ ...f }));
      const weld = forms.find((f) => f.form === "weld");
      runs.push({ keys, key: keys.join(MAQAF), weld: weld ? weld.key : keys.join(""), forms, published,
        folds: published.filter((f) => f.form !== "maqaf" && f.form !== "weld").map((f) => f.key) });
    }
    run = [];
  }
}
const withWhole = runs.filter((r) => r.published.length);
const bare = runs.filter((r) => !r.published.length);
console.log(`— ${ZONE} · ${runs.length} runs · ${withWhole.length} with a whole form a dictionary published —`);
if (!runs.length) { console.log("SKIPPED — no maqaf run in this book"); process.exit(3); }

const pw = await loadPlaywright();
const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(async () => { let g = 0; while (g < 4000) { const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 5)); g += 1; } });

const r1 = [], r3 = [], r4 = [];
let r2 = 0, looked = 0;
const seen = new Set();
const sample = [...withWhole.slice(0, 12), ...bare.slice(0, 4)];
for (const run of sample) {
  if (seen.has(run.key)) continue; seen.add(run.key);
  looked += 1;
  const c = await p.evaluate(async (key) => {
    const r = [...document.querySelectorAll(".wjoin")].find((x) => x.__key === key);
    if (!r) return null;
    const line = r.querySelector(":scope > .g");
    const form = line ? line.dataset.form || "" : "";
    r.scrollIntoView({ block: "center" });
    r.querySelector(".wb .w").click();
    const t0 = Date.now(); while (Date.now() - t0 < 4000 && !document.querySelector("#hud .r-pills button, #hud .b-read p:not(.r-label)")) await new Promise((x) => setTimeout(x, 50));
    await new Promise((x) => setTimeout(x, 300));
    const h = document.getElementById("hud");
    const cuts = [...h.querySelectorAll(".b-cut .s-pills button")].map((x) => ({ t: x.textContent, on: x.getAttribute("aria-pressed") === "true" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((x) => setTimeout(x, 150));
    return { form, cuts };
  }, run.key);
  if (!c) { r1.push(`${run.key}: run not drawn`); continue; }
  const offeredWhole = c.cuts.filter((x) => !x.t.includes("+")).map((x) => x.t);
  const want = [run.key, run.weld, ...run.folds];
  const missing = want.filter((k) => !offeredWhole.includes(k));
  const extra = offeredWhole.filter((k) => !want.includes(k));
  if (missing.length || extra.length) r1.push(`${run.key}: missing ${missing.join(",") || "-"} extra ${extra.join(",") || "-"}`);
  if (c.cuts.some((x) => x.t.includes("+"))) r2 += 1;
  const onWhole = c.cuts.find((x) => x.on && !x.t.includes("+"));
  if (onWhole && onWhole.t !== run.key) r3.push(`${run.key}: card opened on ${onWhole.t}`);
  if (c.form && c.form !== run.key) r3.push(`${run.key}: line reads ${c.form}`);
  const asWritten = run.published.find((f) => f.form === "maqaf");
  if (asWritten && (c.form !== run.key || !onWhole)) r4.push(`${run.key}: published as written but line "${c.form || "words"}", card on ${onWhole ? onWhole.t : "the words"}`);
  if (!asWritten && onWhole) r4.push(`${run.key}: not published as written, yet the card opened on ${onWhole.t}`);
}
check("R1  every run's card offers the run as written and joined, the published folds and no other", r1.length === 0, r1.length ? r1.slice(0, 3).join(" | ") : `${looked} runs (${Math.min(4, bare.length)} with nothing published whole)`);
check("R2  the words one by one are always offered", r2 === looked, `${r2} of ${looked}`);
check("R3  neither the card nor the line chooses a joined or folded spelling for the reader", r3.length === 0, r3.slice(0, 3).join(" | "));
check("R4  a run published as written reads so on its line and its card opens there; one that is not opens on the words", r4.length === 0, r4.slice(0, 3).join(" | "));

// R5, on the first drawn run that opens word by word
const plain = runs.find((r) => !r.published.some((f) => f.form === "maqaf"));
if (plain) {
  const r5 = await p.evaluate(async (key) => {
    const run = [...document.querySelectorAll(".wjoin")].find((x) => x.__key === key);
    if (!run) return { err: "run not drawn" };
    const wait = async (q) => { const t0 = Date.now(); while (Date.now() - t0 < 5000 && !document.querySelector(q)) await new Promise((x) => setTimeout(x, 50)); await new Promise((x) => setTimeout(x, 400)); };
    const esc = async () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await new Promise((x) => setTimeout(x, 200)); };
    run.scrollIntoView({ block: "center" });
    run.querySelectorAll(".wb .w")[0].click(); await wait("#hud .r-pills button");
    const cells = [...document.querySelectorAll("#hud .b-cell .s-pills button")];
    if (cells.length < 2) { await esc(); return { err: "no cells" }; }
    cells[1].click(); await new Promise((x) => setTimeout(x, 500));
    const pool = [...document.querySelectorAll("#hud .b-read .r-pills button")];
    const pick = pool[Math.min(1, pool.length - 1)];
    const picked = pick.textContent.trim(); pick.click(); await new Promise((x) => setTimeout(x, 400));
    await esc();
    const line = (run.querySelector(":scope > .g") || {}).textContent || "";
    run.querySelectorAll(".wb .w")[1].click(); await wait("#hud .r-pills button");
    const lit = [...document.querySelectorAll("#hud .b-read .r-pills button")].find((x) => x.getAttribute("aria-pressed") === "true");
    await esc();
    return { picked, line, lit: lit ? lit.textContent.trim() : "" };
  }, plain.key);
  const ok5 = !r5.err && !/—/u.test(r5.line) && r5.line.includes(r5.picked) && r5.lit === r5.picked;
  check("R5  a reading chosen for one word of a run is the run's line, and is lit again on that word", ok5,
    r5.err ? `${plain.key}: ${r5.err}` : `${plain.key}: chose "${r5.picked}" · line "${r5.line}" · lit "${r5.lit}"`);
}

// R6, on a run whose first word the store answers: its shard fails twice,
// then arrives; and on a rung nothing publishes
const target = runs.find((r) => (store.routesFor(r.keys[0]) || []).length && !r.published.some((f) => f.form === "weld"));
if (target) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(target.keys[0]));
  const shard = new Uint8Array(digest)[0].toString(16).padStart(2, "0");
  let fails = 0, failFor = 2;
  await p.route(new RegExp(`shards/${shard}\\.bin`), (route) => { if (fails < failFor) { fails += 1; route.abort("failed"); } else route.continue(); });
  // a fresh page, so the shard is not already in hand
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const r6 = await p.evaluate(async ([key, weld]) => {
    const run = [...document.querySelectorAll(".wjoin")].find((x) => x.__key === key);
    if (!run) return { err: "run not drawn" };
    const h = document.getElementById("hud");
    const state = () => ({ read: h.querySelectorAll(".b-read .r-pills button").length, msg: [...h.querySelectorAll(".b-read p:not(.r-label)")].map((x) => x.textContent).join(" "), rec: h.querySelector(".d-slot").children.length, again: !!h.querySelector(".b-read button") });
    const wait = async (ms) => new Promise((x) => setTimeout(x, ms));
    run.scrollIntoView({ block: "center" });
    // words cover, first word: the line reads it, but its shard will not come
    run.querySelectorAll(".wb .w")[0].click();
    await wait(3500);
    const unreachable = state();
    const again = h.querySelector(".b-read button"); if (again) again.click();
    await wait(1500);
    const back = state();
    // now the joined rung, which nothing publishes
    const joined = [...h.querySelectorAll(".b-cut .s-pills button")].find((x) => x.textContent === weld);
    if (joined) joined.click();
    await wait(800);
    const rung = state();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wait(300);
    // and the line under the run is its words again, never a dash
    const c = (run.querySelector(":scope > .g") || document.createElement("i")).cloneNode(true);
    c.querySelectorAll(".g-lic").forEach((x) => x.remove());
    return { unreachable, back, rung, joinedOffered: !!joined, lineAfter: c.textContent.trim() };
  }, [target.key, target.weld]);
  const ok6 = !r6.err
    && r6.unreachable.read === 0 && /could not be reached/u.test(r6.unreachable.msg) && r6.unreachable.again && r6.unreachable.rec === 0
    && r6.back.read > 0 && r6.back.rec > 0
    && r6.joinedOffered && r6.rung.read === 0 && /No dictionary on this shelf gives the run joined/u.test(r6.rung.msg) && r6.rung.rec === 0
    && r6.lineAfter && !/\u2014/u.test(r6.lineAfter);
  check("R6  a shard that did not arrive is said and asked again, a rung nothing publishes says so, and the record slot stands empty under both", ok6,
    r6.err ? `${target.key}: ${r6.err}` : `${target.key}: unreachable → ${r6.unreachable.read} readings, "${r6.unreachable.msg.slice(0, 40)}…", record ${r6.unreachable.rec}, again ${r6.unreachable.again} · asked again → ${r6.back.read} readings, record ${r6.back.rec} · joined rung → ${r6.rung.read} readings, record ${r6.rung.rec}, "${r6.rung.msg.slice(0, 40)}…" · line after "${r6.lineAfter}" · shard failed ${fails}×`);
}
// R7, on every drawn run of the sample
const r7 = await p.evaluate((keys) => {
  const out = [];
  for (const key of keys) {
    const r = [...document.querySelectorAll(".wjoin")].find((x) => x.__key === key);
    if (!r) continue;
    const wbs = [...r.querySelectorAll(":scope > .wj-ink > .wb")];
    for (let i = 1; i < wbs.length; i += 1) {
      const cs = getComputedStyle(wbs[i]);
      const line = parseFloat(cs.borderInlineStartWidth) || 0;
      const rng = (w) => { const t = document.createRange(); t.selectNodeContents(w.querySelector(".w")); return t.getBoundingClientRect(); };
      const a = rng(wbs[i - 1]), c = rng(wbs[i]);
      const gap = Math.round(a.left - c.right);   // rtl: the earlier word stands to the right
      if (line > 0 || gap > 1) out.push(`${key}: line ${line}px, seam ${gap}px`);
    }
  }
  return out;
}, [...seen]);
check("R7  the run's ink is one word: no line drawn between its words, no padding at the seam", r7.length === 0, r7.length ? r7.slice(0, 3).join(" | ") : `${seen.size} runs`);
// R8 · a dead card's retry. W1's shard fails once; the reader closes W1 within
// the retry window and opens W2 (another shard). After the retry, the live
// card is W2's: its pool is what the page offers, and the order switch
// redraws its pills.
{
  await p.unrouteAll();
  // two plain words in different shards, found on the page by their own ink
  const shardOf = async (k) => { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(k)); return new Uint8Array(d)[0].toString(16).padStart(2, "0"); };
  const words = [];
  for (const sec of zone.sections || []) for (const w of sec.words || []) if (w.k && !w.kq && !(w.presentation_join && w.presentation_join.join_next_without_separator)) words.push(w);
  let w1 = null, w2 = null;
  for (const w of words) { if (!(store.routesFor(w.k) || []).length) continue; if (!w1) { w1 = w; continue; } if ((await shardOf(w.k)) !== (await shardOf(w1.k))) { w2 = w; break; } }
  if (w1 && w2) {
    const s1 = await shardOf(w1.k);
    let fails = 0;
    await p.route(new RegExp(`shards/${s1}\\.bin`), (route) => { if (fails < 1) { fails += 1; route.abort("failed"); } else route.continue(); });
    await p.reload({ waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb");
    const r8 = await p.evaluate(async ([s1, s2]) => {
      const wbs = [...document.querySelectorAll("section.seg .he-text .wb")];
      const find = (s) => wbs.find((wb) => !wb.closest(".wjoin") && wb.querySelector(".w") && wb.querySelector(".w").textContent === s);
      const a = find(s1), c = find(s2);
      if (!a || !c) return { err: "words not drawn" };
      const wait = (ms) => new Promise((x) => setTimeout(x, ms));
      a.scrollIntoView({ block: "center" }); a.querySelector(".w").click();
      await wait(300);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await wait(150);
      c.scrollIntoView({ block: "center" }); c.querySelector(".w").click();
      const t0 = Date.now(); while (Date.now() - t0 < 5000 && !document.querySelector("#hud .r-pills button")) await wait(50);
      await wait(2600);
      const h = document.getElementById("hud");
      const pills = () => [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim());
      const before = pills();
      const poolAfterRetry = (window.__pool || []).slice(0, 5);
      const r = document.getElementById("rail"); if (r && !r.open) r.open = true;
      const btn = [...document.querySelectorAll("#defRow button")].find((x) => x.textContent === "characters"); if (btn) btn.click();
      await wait(600);
      const after = pills();
      const poolAfterSwitch = (window.__pool || []).slice(0, 5);
      const back = [...document.querySelectorAll("#defRow button")].find((x) => x.textContent === "oldest first"); if (back) back.click();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return { before: before.slice(0, 5), poolAfterRetry, after: after.slice(0, 5), poolAfterSwitch };
    }, [w1.s, w2.s]);
    const ok8 = !r8.err && JSON.stringify(r8.poolAfterRetry) === JSON.stringify(r8.before) && JSON.stringify(r8.poolAfterSwitch) === JSON.stringify(r8.after);
    check("R8  a card left behind is dead: after its retry the live card's pool is the page's, and the order switch redraws the live card", ok8,
      r8.err ? r8.err : `W1 ${w1.k} (shard ${s1} failed ${fails}×) then W2 ${w2.k}: pills ${JSON.stringify(r8.before)} · __pool ${JSON.stringify(r8.poolAfterRetry)} · after "characters": pills ${JSON.stringify(r8.after)} · __pool ${JSON.stringify(r8.poolAfterSwitch)}`);
    await p.unrouteAll();
  } else console.log("  --  R8  no two plain words in different shards; skipped");
}

// R9 · a rung the reader's switches emptied
{
  const weldRun = runs.find((r) => r.published.some((f) => f.form === "weld"));
  if (weldRun) {
    await p.reload({ waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb");
    const r9 = await p.evaluate(async ([key, weld]) => {
      const run = [...document.querySelectorAll(".wjoin")].find((x) => x.__key === key);
      if (!run) return { err: "run not drawn" };
      const h = document.getElementById("hud");
      const wait = (ms) => new Promise((x) => setTimeout(x, ms));
      const waitFor = async (q) => { const t0 = Date.now(); while (Date.now() - t0 < 5000 && !document.querySelector(q)) await wait(50); await wait(400); };
      run.scrollIntoView({ block: "center" }); run.querySelector(".wb .w").click(); await waitFor("#hud .r-pills button");
      const rung = [...h.querySelectorAll(".b-cut .s-pills button")].find((x) => x.textContent === weld); if (!rung) return { err: "weld rung not offered" };
      rung.click(); await waitFor("#hud .r-pills button");
      const ids = new Set([...h.querySelectorAll(".r-pills button")].flatMap((x) => (x.dataset.by || "").split(" ").filter(Boolean)));
      const n = h.querySelectorAll(".r-pills button").length;
      const r = document.getElementById("rail"); if (r && !r.open) r.open = true;
      // the rail redraws its chips on every switch, so they are found again
      // by key each time rather than held
      const chipsNow = () => [...document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp')].filter((c) => (c.dataset.ids || "").split(" ").some((id) => ids.has(id)));
      const keys = chipsNow().map((c) => c.dataset.key);
      const chipOf = (k) => document.querySelector(`.rail .row[data-toggle="sources"] .dfp[data-key="${CSS.escape(k)}"]`);
      for (const k of keys) { const c = chipOf(k); if (c && c.getAttribute("aria-pressed") === "true") { c.click(); await wait(700); } }
      await wait(1200);
      const state = () => ({ read: h.querySelectorAll(".r-pills button").length, msg: [...h.querySelectorAll(".b-read p:not(.r-label)")].map((x) => x.textContent).join(" "), cutOn: ([...h.querySelectorAll(".b-cut .s-pills button")].find((x) => x.getAttribute("aria-pressed") === "true") || {}).textContent, chosen: run.classList.contains("chosen"), rec: h.querySelector(".d-slot").children.length });
      const off = state();
      for (const k of keys) { const c = chipOf(k); if (c && c.getAttribute("aria-pressed") === "false") { c.click(); await wait(700); } }
      await wait(1200);
      const on = state();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return { n, ids: [...ids], chips: keys.length, off, on };
    }, [weldRun.key, weldRun.weld]);
    const ok9 = !r9.err && r9.chips > 0 && r9.off.read === 0 && /withheld/u.test(r9.off.msg) && !/No dictionary/u.test(r9.off.msg) && r9.off.cutOn === weldRun.weld && r9.off.chosen && r9.off.rec === 0
      && r9.on.read === r9.n && r9.on.cutOn === weldRun.weld;
    check("R9  a block the reader's switches emptied says so, keeps its rung, and reads again when they come back", ok9,
      r9.err ? `${weldRun.key}: ${r9.err}` : `${weldRun.key} joined ${weldRun.weld}: ${r9.n} readings by ${r9.ids.join(",")} · ${r9.chips} chips off → ${r9.off.read} readings, "${r9.off.msg.slice(0, 60)}…", rung ${r9.off.cutOn}, chosen ${r9.off.chosen}, record ${r9.off.rec} · on → ${r9.on.read} readings on ${r9.on.cutOn}`);
  } else console.log("  --  R9  no run with a published joined form in this book; skipped");
}

// R10 · the export under a shard that did not arrive
{
  const w = (() => { for (const sec of zone.sections || []) for (const x of sec.words || []) if (x.k && !x.kq && (store.routesFor(x.k) || []).length) return { sec, w: x }; return null; })();
  if (w) {
    const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(w.w.k));
    const s = new Uint8Array(d)[0].toString(16).padStart(2, "0");
    await p.route(new RegExp(`shards/${s}\\.bin`), (route) => route.abort("failed"));
    await p.reload({ waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb");
    const r10 = await p.evaluate(async () => {
      const wait = (ms) => new Promise((x) => setTimeout(x, ms));
      const sec = document.querySelector("section.seg");
      const btn = [...sec.querySelectorAll("button")].find((x) => /^english$/iu.test(x.textContent.trim()));
      if (!btn) return { err: "no english export button on the first section" };
      btn.click();
      const t0 = Date.now(); while (Date.now() - t0 < 15000 && !/save/iu.test(btn.textContent)) await wait(100);
      const note = (sec.querySelector(".xp-note") || sec).textContent;
      return { note };
    });
    // the note may also count readings withheld on license, honestly; the
    // word whose shard did not arrive must be among the "not checked"
    const ok10 = !r10.err && /not checked: the catalog could not be reached/u.test(r10.note);
    check("R10 the export says a word whose shard did not arrive was not checked, never that it is withheld", ok10, r10.err || (r10.note.match(/\d+ readings? (withheld on license|not checked[^.]*)/gu) || []).join(" · "));
    await p.unrouteAll();
  }
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall green");
process.exit(bad ? 1 : 0);
