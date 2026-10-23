// THE NO-NAMES PILL (the owner, 2026-10-23: "did you get the new toggles up?
// no names and no blanks, if i flip them on or off it should just change
// those select cells"): the names-lead switch promoted to the row. Where a
// word's line is its name (proper-name-rule-v1), the reading the name
// displaced is baked beside it (gloss_orders.noname, tools/regloss-zone.mjs);
// the pill lays it over those lines and no other.
//   P1  the pill stands in the row, off on a fresh visit, live on a book
//       that carries the displaced readings, and the bottom Menu mirrors it
//   P2  pressed, the lines that change are exactly the lines of the words
//       whose key the name led and whose displaced reading is baked: each
//       reads that reading, and no other line on the page moves
//   P3  the card of such a word opens pressed on what the line now says,
//       the name is still among its pills, and the card no longer says the
//       name leads
//   P4  pressed again, every line is the line of the first paint, byte for
//       byte
//   P5  the choice is kept on the device: a reload opens with the pill on
//       and the lines moved; reset puts the pill off, the lines back, and
//       says "default"
//   P6  the rail's own switch is the same switch: with the pill on its row
//       stands at "no names", and a press there to "the name leads" puts the
//       pill off
// The page is the first served zone that carries the column, found on disk;
// no book is named here (check-scope-derived S1).
// Usage: node tools/check-names-pill-v1.mjs [url]
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zoneIdOf, zonesOnDisk } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const URL0 = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
// the book: the one the url names if it carries the column, else the first
// on disk that does
const carries = (z) => { try { const b = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8")); return !!(b.gloss_orders && b.gloss_orders.noname && Object.keys(b.gloss_orders.noname).length); } catch { return false; } };
const BOOK = [zoneIdOf(URL0), ...zonesOnDisk()].filter(Boolean).find(carries);
if (!BOOK) { console.log("SKIPPED — no zone on disk carries the readings its names displaced (gloss_orders.noname)"); process.exit(3); }
const urlFor = (book, extra = "") => { const u = new URL(URL0); u.searchParams.set("b", book); return `${u.href}${extra}`; };
const PAGE = urlFor(BOOK), RAIL = urlFor(BOOK, "&rail=all");
console.log(`the book: ${BOOK}`);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch { /* fresh reader */ } });
let SECS = null;   // the sections built at the first read: the lines counted
const open = async (url) => {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  for (let y = 0; y < 6000; y += 1500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(80); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(900);
};
// every built word's line, with its key and whether the name led it and a
// displaced reading is baked for it
const snap = () => p.evaluate((secs) => {
  const z = window.__zone, out = [];
  const inScope = secs ? new Set(secs) : null;
  document.querySelectorAll("section.seg").forEach((sec, si) => {
    if (inScope && !inScope.has(sec.id)) return;
    const words = (z.sections[si] || {}).words || [], wbs = [...sec.querySelectorAll(".he-text .wb")];
    if (wbs.length !== words.length) return;
    wbs.forEach((wb, wi) => {
      const g = wb.querySelector(":scope > .g"); if (!g) return;
      const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
      const k = words[wi].k, nn = (z.gloss_orders || {}).noname || {};
      out.push({ id: `${si}|${wi}`, k, line: c.textContent.trim(), chip: ((g.querySelector(".g-lic") || {}).textContent || "").trim(),
        owed: !!(k && z.gloss_names && Object.prototype.hasOwnProperty.call(z.gloss_names, k) && Object.prototype.hasOwnProperty.call(nn, k)), want: k && Object.prototype.hasOwnProperty.call(nn, k) ? nn[k] : null });
    });
  });
  const pill = document.getElementById("namesPill");
  return { built: [...document.querySelectorAll("section.seg")].filter((x) => x.querySelector(".he-text .wb")).map((x) => x.id), lines: out,
    pill: pill ? { inRow: !!pill.closest("#modeRow"), pressed: pill.getAttribute("aria-pressed"), on: pill.classList.contains("on"), disabled: pill.disabled } : null,
    stored: (() => { try { return localStorage.getItem("fh.nonames"); } catch { return null; } })(),
    resetSays: (document.getElementById("resetState") || {}).textContent,
    rail: (() => { const row = document.querySelector('#railRows [data-toggle="namelead"]'); return row ? [...row.querySelectorAll("button")].map((x) => `${x.textContent.trim()}${x.getAttribute("aria-pressed") === "true" || x.classList.contains("on") ? "*" : ""}`) : null; })() };
}, SECS);
const menuHas = async () => {
  await p.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight - innerHeight, 2400))); await p.waitForTimeout(400);
  await p.waitForSelector("#nav:not([hidden])", { timeout: 5000 }).catch(() => {});
  if (await p.evaluate(() => document.getElementById("menuPick").hidden)) await p.click("#navMenu");
  await p.waitForTimeout(200);
  const m = await p.evaluate(() => { const x = document.querySelector('#menuPick button[data-for="namesPill"]'); return x ? { text: x.firstChild.textContent, pressed: x.getAttribute("aria-pressed") } : null; });
  await p.click("#navMenu"); await p.waitForTimeout(150);
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150);
  return m;
};
// the lines of a snapshot against the first, by word: which moved
const moved = (s0, s1) => s0.lines.map((x) => [x, s1.lines.find((y) => y.id === x.id)]).filter(([a, c]) => !c || a.line !== c.line || a.chip !== c.chip);
await open(PAGE);
const s0 = await snap(); SECS = s0.built;
const m0 = await menuHas();
const owed = s0.lines.filter((x) => x.owed);
check("P1 the pill stands in the row, off on a fresh visit, live on this book, and the Menu mirrors it", !!s0.pill && s0.pill.inRow && s0.pill.pressed === "false" && !s0.pill.disabled && !!m0 && m0.text === "no names" && m0.pressed === "false",
  `${s0.pill ? `in the row ${s0.pill.inRow} · pressed ${s0.pill.pressed} · disabled ${s0.pill.disabled}` : "no pill"} · menu ${m0 ? `"${m0.text}" ${m0.pressed}` : "absent"} · ${s0.lines.length} lines, ${owed.length} owed a displaced reading`);
await p.click("#namesPill"); await p.waitForTimeout(1200);
const s1 = await snap();
const mv = moved(s0, s1);
const wrongMove = mv.filter(([a]) => !a.owed), notMoved = owed.filter((x) => !mv.some(([a]) => a.id === x.id));
const wrongText = mv.filter(([a, c]) => a.owed && c && c.line !== c.want.replace(/\.$/u, "").trim());
check("P2 pressed, exactly the lines the name led move, each to the reading the name displaced, and no other line", owed.length > 0 && s1.pill.pressed === "true" && s1.pill.on && !wrongMove.length && !notMoved.length && !wrongText.length,
  `${mv.length} lines moved of ${owed.length} owed · ${wrongMove.length} moved that were not owed${wrongMove.length ? ` (${wrongMove.slice(0, 2).map(([a, c]) => `${a.k}: "${a.line}" → "${c ? c.line : "?"}"`).join("; ")})` : ""} · ${notMoved.length} owed that did not${notMoved.length ? ` (${notMoved.slice(0, 2).map((x) => `${x.k} "${x.line}"`).join("; ")})` : ""} · ${wrongText.length} to another reading${mv.length ? ` · e.g. ${mv.slice(0, 2).map(([a, c]) => `"${a.line}" → "${c.line}"`).join("; ")}` : ""}`);
// P3: the card of the first moved word
if (mv.length) {
  const [si, wi] = mv[0][0].id.split("|").map(Number), was = mv[0][0].line, now = mv[0][1].line;
  await p.evaluate(([si, wi]) => { const s = document.querySelectorAll("section.seg")[si]; s.scrollIntoView(); s.querySelectorAll(".he-text .wb")[wi].querySelector(".w").click(); }, [si, wi]);
  await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(700);
  const card = await p.evaluate(() => { const pills = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => ({ t: x.textContent.trim(), on: x.getAttribute("aria-pressed") === "true" })); return { pressed: pills.filter((x) => x.on).map((x) => x.t), all: pills.map((x) => x.t), nameSentence: !!document.querySelector("#hud .r-now .n") }; });
  const fold = (t) => String(t).replace(/\.$/u, "").trim().toLowerCase();
  check("P3 the card opens pressed on what the line now says, the name is still among its pills, and the card no longer says the name leads",
    card.pressed.length === 1 && fold(card.pressed[0]) === fold(now) && card.all.some((t) => fold(t) === fold(was)) && !card.nameSentence,
    `line "${now}" · pressed ${JSON.stringify(card.pressed)} · the name "${was}" on the card ${card.all.some((t) => fold(t) === fold(was))} · says the name leads ${card.nameSentence}`);
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
} else check("P3 the card opens pressed on what the line now says", false, "no line moved");
await p.click("#namesPill"); await p.waitForTimeout(1200);
const s2 = await snap();
check("P4 pressed again, every line is the line of the first paint", s2.pill.pressed === "false" && !moved(s0, s2).length, `${moved(s0, s2).length} lines differ from the first paint`);
await p.click("#namesPill"); await p.waitForTimeout(600);
await open(PAGE);
const s3 = await snap();
check("P5 the choice is kept on the device over a reload, and reset puts it off, the lines back, and says default", s3.pill.pressed === "true" && s3.stored === "yield" && moved(s0, s3).length === owed.length && !moved(s0, s3).some(([a]) => !a.owed),
  `after the reload: pressed ${s3.pill.pressed} · stored "${s3.stored}" · ${moved(s0, s3).length} lines moved of ${owed.length} owed`);
await p.click("#resetPill"); await p.waitForTimeout(1200);
const s4 = await snap();
check("    and after reset", s4.pill.pressed === "false" && !moved(s0, s4).length && s4.resetSays === "default", `pressed ${s4.pill.pressed} · ${moved(s0, s4).length} lines differ · reset says "${s4.resetSays}"`);
// P6: the rail's row and the pill are one switch
await open(RAIL);
const r0 = await snap();   // the rail's page is its own first paint
await p.click("#namesPill"); await p.waitForTimeout(800);
const s5 = await snap();
const railOn = s5.rail ? s5.rail.find((x) => x.endsWith("*")) : null;
await p.evaluate(() => { const row = document.querySelector('#railRows [data-toggle="namelead"]'); const off = row && [...row.querySelectorAll("button")].find((x) => x.textContent.trim() === "the name leads"); if (off) off.click(); });
await p.waitForTimeout(800);
const s6 = await snap();
check("P6 the rail's own switch is the same switch: the pill on puts its row at \"no names\", and \"the name leads\" there puts the pill off", !!s5.rail && railOn === "no names*" && moved(r0, s5).length > 0 && s6.pill.pressed === "false" && !moved(r0, s6).length,
  `rail with the pill on: ${s5.rail ? s5.rail.join(" | ") : "no row"}, ${moved(r0, s5).length} lines moved \u00b7 after the row's press: pill ${s6.pill.pressed}, ${moved(r0, s6).length} lines differ from the rail page's first paint`);
await b.close();
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
