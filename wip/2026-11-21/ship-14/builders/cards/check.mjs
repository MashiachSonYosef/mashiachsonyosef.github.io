// RUN: page
// THE CARDS' MENDS OF 21 NOVEMBER 2026 (the second reader's report, findings 2, 4, 9, 10, 11, 12 and 13).
// One law per finding, each a short scenario pressed as a reader presses it, at a phone's 412 by 915 unless said.
//   C2   a reading chosen through its witness line is the pill its card opens on again (Ruth 1:2 word 3)
//   C4   a dictionary shard that fails is asked once, and once more for each press of its block
//        (the concordance, ?dict=on; Ruth 1:1 word 1)
//   C9   a switch pressed over a block that has no reading draws no other block's notes
//        (?rail=all; Ruth 1:1 word 4)
//   C10  a reading pressed on a block of several words of a run is what the run's line reads
//        (Genesis 35:7 words 6 to 8)
//   C11  every word in the head of a run's own card is lit (?maqaf=maqaf; Genesis 12:8 words 9 to 10)
//   C12  a run line that is no longer a row of parts keeps no smaller size
//        (?maqaf=maqaf, 240 wide; Genesis 3:3 words 4 to 5)
//   C13  a run line gone bare has no title (?maqaf=maqaf; Genesis 1:2 and the verses drawn with it)
// usage: node check.mjs --base http://127.0.0.1:<port> [--only C2,C4]
// It prints one line per law and exits 1 if any law fails. Words are addressed by verse and word number.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt; };
const BASE = String(arg("--base", "http://127.0.0.1:8899")).replace(/\/+$/u, "");
const ONLY = arg("--only", "") ? new Set(arg("--only", "").split(",")) : null;
const WAIT = 120000;   // other browsers may be at work on this machine

// Hebrew letters in what is printed are said as <he>, so no line of this check's output depends on a terminal
const HEBREW = new RegExp(`[${String.fromCharCode(0x590)}-${String.fromCharCode(0x5ff)}]+`, "gu");
const MAQAF = String.fromCharCode(0x5be);
const mask = (t) => String(t == null ? "" : t).replace(HEBREW, "<he>");
// (a line may hold a zero-width space where a sign is not drawn: it is no part of what the line says)
const tight = (t) => String(t == null ? "" : t).split(String.fromCharCode(0x200b)).join("").replace(/\s+/gu, "");

const browser = await chromium.launch();
const results = [];
const say = (ok, id, law, saw) => { results.push(ok); console.log(`${ok ? "  ok" : "FAIL"}  ${id}  ${law}  ·  ${mask(saw)}`); };

// a page of the reader at a book (and a verse), its storage clean, ready as the builders' note defines ready
const openPage = async (query, { width = 412, route = null, label = null } = {}) => {
  const ctx = await browser.newContext({ viewport: { width, height: 915 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(WAIT);
  await p.addInitScript(() => { try { if (!sessionStorage.getItem("check")) { localStorage.clear(); sessionStorage.setItem("check", "1"); } } catch { /* a fresh context is clean already */ } });
  if (route) await route(p);
  await p.goto(`${BASE}/zone.html?${query}${label ? `#${label}` : ""}`, { waitUntil: "domcontentloaded", timeout: WAIT });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: WAIT, state: "attached" });
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: WAIT }).catch(() => {});
  if (label) await p.waitForFunction((l) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === l && s.querySelector(".he-text .wb")), label, { timeout: WAIT });
  await p.waitForTimeout(1500);
  return { ctx, p };
};
// the source of an expression that finds word <n> (from 1) of verse <label>
const wordSrc = (label, n) => `[...[...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ${JSON.stringify(label)}).querySelectorAll(".he-text .wb:not(.mark)")][${n - 1}]`;
const pressWord = async (p, src) => {
  await p.evaluate((src) => { const wb = eval(src); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, src);
  // (in the page, seen or not: the concordance keeps the card's rows under its table)
  await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece, #hud > .rows .b-read p:not(.r-label):not(.r-wait)", { timeout: WAIT, state: "attached" }).catch(() => {});
  await p.waitForTimeout(1000);
};
const pillsArrive = async (p) => { await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 30000, state: "attached" }).catch(() => {}); await p.waitForTimeout(900); };
const pressedPill = (p) => p.evaluate(() => { const x = [...document.querySelectorAll("#hud .b-read .r-pills button")].find((y) => y.getAttribute("aria-pressed") === "true"); return x ? x.textContent : null; });
// the line under a word, its chips left out: its own, or its run's
const lineUnder = (p, src) => p.evaluate((src) => {
  const wb = eval(src); const run = wb.closest(".wjoin"); const g = (run && run.querySelector(":scope > .g")) || wb.querySelector(":scope > .g");
  if (!g) return null;
  const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); };
  const parts = [...g.querySelectorAll(":scope > .g-part")];
  return parts.length ? parts.map(txt).join(" + ") : txt(g);
}, src);
const openRail = async (p) => {
  await p.evaluate(() => { window.scrollTo(0, 0); const d = document.querySelector("#rail"); if (d && !d.open) d.querySelector("summary").click(); });
  await p.waitForTimeout(600);
  await p.evaluate(() => { const m = document.querySelector("#rail .more-switches"); if (m && !m.hidden && !m.open) m.querySelector("summary").click(); });
  await p.waitForTimeout(400);
};
// a shelf of the sources switched off by its name on the panel ("no year given", "57th century AM")
const pressShelf = async (p, name) => {
  const found = await p.evaluate((name) => { const x = [...document.querySelectorAll('.row[data-toggle="sources"] button.shelf-sw')].find((y) => String(y.getAttribute("aria-label") || y.title || "").endsWith(`: ${name}`)); if (!x) return false; x.scrollIntoView({ block: "center" }); x.click(); return true; }, name);
  await p.waitForTimeout(2500);
  return found;
};
const took = [];
const law = async (id, text, run) => {
  if (ONLY && !ONLY.has(id)) return;
  let ctx = null; const t0 = Date.now();
  try { await run((c) => { ctx = c; }); }
  catch (e) { say(false, id, text, `the scenario did not run to its end: ${String(e && e.message).split("\n")[0]}`); }
  finally { if (ctx) await ctx.close().catch(() => {}); took.push(`${id} ${Math.round((Date.now() - t0) / 1000)}s`); }
};

// C2 (finding 2). Ruth 1:2 word 3: the pill «Elimelech», then the first witness of its record, close, open again.
await law("C2", "a reading chosen through its witness line is the pill its card opens on again", async (keep) => {
  const { ctx, p } = await openPage("b=ruth"); keep(ctx);
  const src = wordSrc("1:2", 3);
  await pressWord(p, src); await pillsArrive(p);
  // a pill the card does not open on, whose record carries a witness line: the first such
  const n = await p.evaluate(() => document.querySelectorAll("#hud .b-read .r-pills button").length);
  let chosen = null;
  for (let i = 0; i < Math.min(n, 12) && chosen === null; i += 1) {
    const t = await p.evaluate((i) => { const x = document.querySelectorAll("#hud .b-read .r-pills button")[i]; if (!x || x.getAttribute("aria-pressed") === "true") return null; x.click(); return x.textContent; }, i);
    if (t === null) continue;
    await p.waitForTimeout(500);
    if (await p.evaluate(() => !!document.querySelector("#hud .d-also .d-also-m"))) chosen = t;
  }
  if (chosen === null) { say(false, "C2", "a reading chosen through its witness line is the pill its card opens on again", `no pill of Ruth 1:2 word 3 carries a witness line among the first 12 of ${n}`); return; }
  const witness = await p.evaluate(() => { const x = document.querySelector("#hud .d-also .d-also-m"); x.click(); return (document.querySelector("#hud .d-also .d-also-lab") || {}).textContent || ""; });
  await p.waitForTimeout(700);
  const stood = await pressedPill(p);
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  const line = await lineUnder(p, src);
  await pressWord(p, src); await pillsArrive(p);
  const again = await pressedPill(p);
  say(again === chosen && stood === chosen, "C2", "a reading chosen through its witness line is the pill its card opens on again",
    `Ruth 1:2 word 3: «${chosen}» pressed, then its witness («${witness.trim()}»); the line reads «${line}»; the card opened again on «${again}»`);
});

// C4 (finding 4). Ruth 1:1 word 1 with the concordance on: a block pressed in the table's dropdown while every
// shard of the dictionary store fails; then the block pressed again; then the store let through and pressed again.
await law("C4", "a dictionary shard that fails is asked once, and once more for each press of its block", async (keep) => {
  let failing = false; const asked = [];
  const { ctx, p } = await openPage("b=ruth&dict=on", { route: (pg) => pg.route("**/data/dictionary-store/shards/*", (r) => { asked.push(failing); return failing ? r.abort("failed") : r.continue(); }) }); keep(ctx);
  await pressWord(p, wordSrc("1:1", 1));
  await p.waitForSelector("#hud .dict-tab table", { timeout: WAIT, state: "attached" });
  await p.waitForTimeout(2000);
  // the dropdown, opened by the row's own pill; the blocks' row in it stands where the card's block band stands
  // among the card's bands
  const menuOpen = async () => { if (!(await p.evaluate(() => !!document.querySelector("#hud .dict-tab .menu")))) { await p.evaluate(() => { const x = document.querySelector("#hud .dict-tab tbody tr.pick .r-pills button"); if (x) x.click(); }); await p.waitForTimeout(600); } };
  // presses a block in the dropdown: the pressed one (again = true), or the first not pressed
  const pressBlock = async (again) => {
    await menuOpen();
    return p.evaluate((again) => {
      const bands = [...document.querySelectorAll("#hud > .rows > .band:not(.b-read)")].filter((b) => b.querySelector(".s-pills button"));
      const at = bands.findIndex((b) => b.classList.contains("b-cell"));
      const row = document.querySelectorAll("#hud .dict-tab .menu > .s-pills")[at];
      const xs = row ? [...row.querySelectorAll("button")] : [];
      const x = xs.find((y) => (y.getAttribute("aria-pressed") === "true") === again);
      if (x) { x.click(); return "the dropdown's block"; }
      // no dropdown to press in: the card's own button, which the dropdown's presses
      const own = [...document.querySelectorAll("#hud > .rows .b-cell .s-pills button")].find((y) => (y.getAttribute("aria-pressed") === "true") === again);
      if (own) { own.click(); return "the card's own block button (no dropdown stood)"; }
      return null;
    }, again);
  };
  const says = () => p.evaluate(() => { const t = document.querySelector("#hud .dict-tab"); const hit = t && [...t.querySelectorAll("*")].find((x) => x.children.length === 0 && /did not answer/u.test(x.textContent)); return hit ? hit.textContent : ""; });
  failing = true;
  const before = asked.length;
  const how = await pressBlock(false);
  if (!how) { say(false, "C4", "a dictionary shard that fails is asked once, and once more for each press of its block", "no block of Ruth 1:1 word 1 could be pressed"); return; }
  await p.waitForTimeout(3000);
  const first = asked.length - before, said = await says();
  await pressBlock(true);
  await p.waitForTimeout(2500);
  const second = asked.length - before - first;
  failing = false;
  await pressBlock(true);
  await p.waitForTimeout(3000);
  const third = asked.length - before - first - second, saidAfter = await says();
  say(first === 1 && second === 1 && third === 1 && /press the block again/u.test(said) && !saidAfter, "C4", "a dictionary shard that fails is asked once, and once more for each press of its block",
    `Ruth 1:1 word 1, ${how} pressed with the store failing: ${first} request${first === 1 ? "" : "s"} in 3 seconds, the table saying «${said}»; pressed again: ${second} more; the store let through and pressed again: ${third} more, the table ${saidAfter ? `still saying «${saidAfter}»` : "saying no failure"}`);
});

// C9 (finding 9). Ruth 1:1 word 4, the whole panel drawn: the whole-form division (no dictionary gives the form
// whole), then the switch «names: as sound».
await law("C9", "a switch pressed over a block that has no reading draws no other block's notes", async (keep) => {
  const { ctx, p } = await openPage("b=ruth&rail=all"); keep(ctx);
  await openRail(p);
  await pressWord(p, wordSrc("1:1", 4)); await pillsArrive(p);
  const band = () => p.evaluate(() => { const r = document.querySelector("#hud > .rows .b-read"); return r ? { pills: r.querySelectorAll(".r-pills button").length, notes: [...r.querySelectorAll(":scope > p.kq-role")].map((x) => x.textContent.slice(0, 70)), says: [...r.querySelectorAll(":scope > p:not(.r-label):not(.kq-role):not(.r-dflt):not(.r-piece):not(.r-wait)")].map((x) => x.textContent.slice(0, 60)).join(" / ") } : null; });
  const opened = await band();
  const cut = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud .b-cut .s-pills button")].find((y) => !y.textContent.includes("+")); if (x) x.click(); return !!x; });
  await p.waitForTimeout(1500);
  const bare = await band();
  if (!cut || !bare || bare.pills || bare.notes.length) { say(false, "C9", "a switch pressed over a block that has no reading draws no other block's notes", `the scenario's ground did not stand: the whole form of Ruth 1:1 word 4 ${cut ? `drew ${bare ? bare.pills : "?"} pills and ${bare ? bare.notes.length : "?"} notes` : "has no division to press"}`); return; }
  const pressed = await p.evaluate(() => {
    const lab = [...document.querySelectorAll(".row .lab")].find((x) => x.textContent.startsWith("names") && !x.textContent.startsWith("names lead"));
    const x = lab && lab.nextElementSibling ? [...lab.nextElementSibling.querySelectorAll("button")].find((y) => y.textContent === "as sound") : null;
    if (x) x.click();
    return !!x;
  });
  await p.waitForTimeout(1800);
  const after = await band();
  if (!pressed) { say(false, "C9", "a switch pressed over a block that has no reading draws no other block's notes", "the panel drew no «names: as sound» to press"); return; }
  say(!!after && after.pills === 0 && after.notes.length === 0, "C9", "a switch pressed over a block that has no reading draws no other block's notes",
    `Ruth 1:1 word 4: the card opened with ${opened.pills} pills and ${opened.notes.length} notes; the whole form pressed says «${bare.says}»; after «names: as sound» the band holds ${after ? after.notes.length : "?"} note${after && after.notes.length === 1 ? "" : "s"} of the block before${after && after.notes.length ? `: «${after.notes.join("», «")}»` : ""}`);
});

// C10 (finding 10, first half). Genesis 35:7 words 6 to 8, a run that names a run inside it: the division of two
// blocks, its block of two words, a reading on it that the card did not open on.
await law("C10", "a reading pressed on a block of several words of a run is what the run's line reads", async (keep) => {
  const { ctx, p } = await openPage("b=genesis", { label: "35:7" }); keep(ctx);
  const src = wordSrc("35:7", 6);
  const rest = await lineUnder(p, src);
  await pressWord(p, src);
  const cut = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud .b-cut .s-pills button")].find((y) => y.textContent.split("+").length === 2); if (x) x.click(); return !!x; });
  await p.waitForTimeout(1200);
  const block = await p.evaluate((mq) => { const x = [...document.querySelectorAll("#hud .b-cell .s-pills button")].find((y) => y.textContent.trim().includes(mq) || /\s/u.test(y.textContent.trim())); if (x) x.click(); return !!x; }, MAQAF);
  await pillsArrive(p);
  const pill = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud .b-read .r-pills button")].find((y) => y.getAttribute("aria-pressed") !== "true"); if (x) x.click(); return x ? x.textContent : null; });
  await p.waitForTimeout(1000);
  if (!cut || !block || pill === null) { say(false, "C10", "a reading pressed on a block of several words of a run is what the run's line reads", `the scenario's ground did not stand at Genesis 35:7 word 6: ${!cut ? "no division of two blocks" : !block ? "no block of several words" : "no second reading on the block"}`); return; }
  const card = await p.evaluate(() => (document.querySelector("#hud .r-now .v") || {}).textContent || "");
  await p.keyboard.press("Escape"); await p.waitForTimeout(900);
  const line = await lineUnder(p, src);
  say(tight(line) === tight(card) && tight(card).includes(tight(pill)), "C10", "a reading pressed on a block of several words of a run is what the run's line reads",
    `Genesis 35:7 words 6 to 8, at rest «${rest}»: «${pill}» pressed on the block of two words; the card says «${card}»; the line reads «${line}»`);
});

// C11 (finding 11). Genesis 12:8 words 9 to 10 with joined words as written: the word's card, then the chain's
// whole rung in the band at its top, which opens the run's own card.
await law("C11", "every word in the head of a run's own card is lit", async (keep) => {
  const { ctx, p } = await openPage("b=genesis&maqaf=maqaf", { label: "12:8" }); keep(ctx);
  await pressWord(p, wordSrc("12:8", 9));
  const rung = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud .b-chain .s-pills button")].find((y) => !y.textContent.includes("+")); if (x) x.click(); return !!x; });
  await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud > .rows .b-read p:not(.r-label):not(.r-wait)", { timeout: 30000, state: "attached" }).catch(() => {});
  await p.waitForTimeout(1500);
  const head = await p.evaluate(() => ({ number: (document.querySelector("#hud .head .wn") || {}).textContent || "", chainBand: !!document.querySelector("#hud .b-chain .s-pills button"), weights: [...document.querySelectorAll("#hud .head b > span:not(.mq)")].map((x) => Number(getComputedStyle(x).fontWeight)) }));
  if (!rung || head.chainBand || head.weights.length < 2) { say(false, "C11", "every word in the head of a run's own card is lit", `the scenario's ground did not stand at Genesis 12:8 word 9: ${!rung ? "the word's card holds no whole rung of its chain to press" : head.chainBand ? "the run's own card did not open" : `the head holds ${head.weights.length} word`}`); return; }
  say(head.weights.every((w) => w >= 600), "C11", "every word in the head of a run's own card is lit",
    `Genesis 12:8 words 9 to 10, the run's own card (${head.number.trim()}): the head's words stand at weights ${head.weights.join(" and ")}`);
});

// C12 (finding 12). Genesis 3:3 words 4 to 5 with joined words as written, on a screen 240 wide, where the run's
// row of two parts is let down to fit: the shelf «no year given» switched off leaves the row one reading.
await law("C12", "a run line that is no longer a row of parts keeps no smaller size", async (keep) => {
  const { ctx, p } = await openPage("b=genesis&maqaf=maqaf", { label: "3:3", width: 240 }); keep(ctx);
  const src = wordSrc("3:3", 4);
  const state = () => p.evaluate((src) => { const wb = eval(src); const run = wb && wb.closest(".wjoin"); const g = run && run.querySelector(":scope > .g"); if (!g) return null; const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); const same = !!g.__checkSeen; g.__checkSeen = true; const sec = run.closest("section.seg"); const plain = [...sec.querySelectorAll(".he-text > .wb > .g")].find((x) => x.offsetParent); return { row: g.classList.contains("parts") && g.children.length >= 2, inline: g.style.fontSize || "", computed: getComputedStyle(g).fontSize, text: c.textContent.trim(), same, plain: plain ? getComputedStyle(plain).fontSize : "" }; }, src);
  const before = await state();
  if (!before || !before.row || !before.inline) { say(false, "C12", "a run line that is no longer a row of parts keeps no smaller size", `the scenario's ground did not stand: the run at Genesis 3:3 word 4 is not a row let down to fit at 240 wide (${before ? `inline size «${before.inline}», ${before.row ? "a row" : "no row"}` : "no run line"})`); return; }
  await openRail(p);
  const found = await pressShelf(p, "no year given");
  const after = await state();
  if (!found || !after || !after.same || after.row) { say(false, "C12", "a run line that is no longer a row of parts keeps no smaller size", `the scenario's ground did not stand: ${!found ? "the panel drew no shelf «no year given»" : !after ? "the run line is gone" : !after.same ? "the press laid the verse again, on a new line" : `the line is still a row («${after.text}»)`}`); return; }
  say(after.inline === "", "C12", "a run line that is no longer a row of parts keeps no smaller size",
    `Genesis 3:3 words 4 to 5 at 240 wide: the row «${before.text}» let down to ${before.inline}; the shelf «no year given» switched off, the line reads «${after.text}» at ${after.computed}${after.inline ? ` (the row's size, kept on the line)` : ""}, a plain word's line beside it at ${after.plain}`);
});

// C13 (finding 13). Genesis 1:2 and the verses drawn with it, joined words as written: the sources' shelves
// switched off in the order that leaves the run lines standing where they stood as they go bare.
await law("C13", "a run line gone bare has no title", async (keep) => {
  const { ctx, p } = await openPage("b=genesis&maqaf=maqaf", { label: "1:2" }); keep(ctx);
  await openRail(p);
  const lines = () => p.evaluate(() => { const out = { n: 0, bare: 0, stood: 0, titled: [] }; for (const r of document.querySelectorAll(".wjoin")) { if (!r.__key) continue; const g = r.querySelector(":scope > .g"); if (!g) continue; out.n += 1; if (g.classList.contains("bare")) { out.bare += 1; if (g.__checkSeen) out.stood += 1; if (g.title) out.titled.push(`${(r.closest("section.seg").querySelector(".vnum") || {}).textContent} «${g.title}»`); } g.__checkSeen = true; } return out; });
  await lines();
  const pressed = [];
  for (const name of ["no year given", "57th century AM", "58th century AM"]) { if (await pressShelf(p, name)) pressed.push(name); if (name !== "58th century AM") await lines(); }
  const after = await lines();
  if (pressed.length !== 3 || !after.bare || !after.stood) { say(false, "C13", "a run line gone bare has no title", `the scenario's ground did not stand: ${pressed.length} of 3 shelves pressed, ${after.bare} of ${after.n} run lines bare, ${after.stood} of them the lines that stood before the last press`); return; }
  say(after.titled.length === 0, "C13", "a run line gone bare has no title",
    `Genesis 1:2 and the verses drawn with it, every shelf of sources switched off: ${after.bare} of ${after.n} run lines bare, ${after.stood} where they stood; ${after.titled.length} of them with a title${after.titled.length ? `, as ${after.titled.slice(0, 2).join(" and ")}` : ""}`);
});

await browser.close();
const failed = results.filter((x) => !x).length;
console.log(`${failed ? `${failed} of ${results.length} laws failed` : `all ${results.length} laws hold`} (${took.join(", ")})`);
process.exit(failed ? 1 : 0);
