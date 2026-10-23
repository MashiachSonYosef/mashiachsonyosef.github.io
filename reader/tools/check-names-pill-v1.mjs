// NO NAMES, PARKED (the owner, the evening of 2026-10-23: "id remove no names
// toggle and just have it on /toggles/ for now"). The names-lead switch stood
// in the row as a pill for a day (the owner, that morning: "no names and no
// blanks, if i flip them on or off it should just change those select
// cells"); it is off the row now and stays on the rail (?rail=all) and on
// /toggles/. Where a word's line is its name (proper-name-rule-v1), the
// reading the name displaced is baked beside it (gloss_orders.noname,
// tools/regloss-zone.mjs); the switch lays it over those lines and no other.
//   P1  nothing on the book page offers it: no pill in the row, no entry in
//       the bottom Menu; the rail's row stands under ?rail=all at "the name
//       leads" on a fresh visit
//   P2  pressed to "no names" on the rail, the lines that change are exactly
//       the lines of the words whose key the name led and whose displaced
//       reading is baked: each reads that reading, and no other line moves
//   P3  the card of such a word opens pressed on what the line now says,
//       the name is still among its pills, and the card no longer says the
//       name leads
//   P4  pressed back to "the name leads", every line is the line of the
//       first paint, byte for byte
//   P5  the choice is kept on the device: a reload opens with the lines
//       moved; reset puts them back and says "default"
//   P6  /toggles/ lists the switch among the rail's, drawn only with the
//       switches, never on every book page
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
const RAIL = urlFor(BOOK, "&rail=all");
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
// a press on the rail's own row, by the position's words
const railPress = async (lab) => {
  const did = await p.evaluate((lab) => { const row = document.querySelector('#railRows [data-toggle="namelead"]'); const btn = row && [...row.querySelectorAll("button")].find((x) => x.textContent.trim() === lab); if (btn) { btn.click(); return true; } return false; }, lab);
  if (!did) { console.log(`PAGE: the rail has no "${lab}" on the names row`); bad += 1; }
  await p.waitForTimeout(1200);
};
// the lines of a snapshot against the first, by word: which moved
const moved = (s0, s1) => s0.lines.map((x) => [x, s1.lines.find((y) => y.id === x.id)]).filter(([a, c]) => !c || a.line !== c.line || a.chip !== c.chip);
await open(RAIL);
const s0 = await snap(); SECS = s0.built;
const m0 = await menuHas();
const owed = s0.lines.filter((x) => x.owed);
const railAt = (snapshot) => (snapshot.rail ? snapshot.rail.find((x) => x.endsWith("*")) : null);
check("P1 nothing on the book page offers it: no pill in the row, no entry in the Menu; the rail's row stands at \"the name leads\"", !s0.pill && !m0 && !!s0.rail && railAt(s0) === "the name leads*",
  `pill ${s0.pill ? "present" : "absent"} · menu ${m0 ? `"${m0.text}"` : "absent"} · rail ${s0.rail ? s0.rail.join(" | ") : "no row"} · ${s0.lines.length} lines, ${owed.length} owed a displaced reading`);
await railPress("no names");
const s1 = await snap();
const mv = moved(s0, s1);
const wrongMove = mv.filter(([a]) => !a.owed), notMoved = owed.filter((x) => !mv.some(([a]) => a.id === x.id));
const wrongText = mv.filter(([a, c]) => a.owed && c && c.line !== c.want.replace(/\.$/u, "").trim());
check("P2 pressed to \"no names\" on the rail, exactly the lines the name led move, each to the reading the name displaced, and no other line", owed.length > 0 && railAt(s1) === "no names*" && !wrongMove.length && !notMoved.length && !wrongText.length,
  `${mv.length} lines moved of ${owed.length} owed · ${wrongMove.length} moved that were not owed${wrongMove.length ? ` (${wrongMove.slice(0, 2).map(([a, c]) => `${a.k}: "${a.line}" → "${c ? c.line : "?"}"`).join("; ")})` : ""} · ${notMoved.length} owed that did not${notMoved.length ? ` (${notMoved.slice(0, 2).map((x) => `${x.k}: "${x.line}" wants "${x.want}"`).join("; ")})` : ""} · ${wrongText.length} read something else`);
// P3: the card of the first moved word
if (mv.length) {
  const [si, wi] = mv[0][0].id.split("|").map(Number), was = mv[0][0].line, now = mv[0][1].line;
  await p.evaluate(([si, wi]) => { const s = document.querySelectorAll("section.seg")[si]; s.scrollIntoView(); s.querySelectorAll(".he-text .wb")[wi].querySelector(".w").click(); }, [si, wi]);
  await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(700);
  const card = await p.evaluate(() => { const pills = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => ({ t: x.textContent.trim(), on: x.getAttribute("aria-pressed") === "true" })); return { pressed: pills.filter((x) => x.on).map((x) => x.t), all: pills.map((x) => x.t), nameSentence: !!document.querySelector("#hud .r-piece, #hud .kq-role") && [...document.querySelectorAll("#hud .r-piece, #hud .kq-role")].some((x) => /name/u.test(x.textContent) && /lead/u.test(x.textContent)) }; });
  const fold = (t) => String(t).replace(/\.$/u, "").trim().toLowerCase();
  check("P3 the card opens pressed on what the line now says, the name is still among its pills, and the card no longer says the name leads",
    card.pressed.length === 1 && fold(card.pressed[0]) === fold(now) && card.all.some((t) => fold(t) === fold(was)) && !card.nameSentence,
    `line "${now}" · pressed ${JSON.stringify(card.pressed)} · the name "${was}" on the card ${card.all.some((t) => fold(t) === fold(was))} · says the name leads ${card.nameSentence}`);
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
} else check("P3 the card opens pressed on what the line now says", false, "no line moved");
await railPress("the name leads");
const s2 = await snap();
check("P4 pressed back to \"the name leads\", every line is the line of the first paint", railAt(s2) === "the name leads*" && !moved(s0, s2).length, `${moved(s0, s2).length} lines differ from the first paint`);
await railPress("no names");
await open(RAIL);
const s3 = await snap();
check("P5 the choice is kept on the device over a reload, and reset puts it back and says default", railAt(s3) === "no names*" && s3.stored === "yield" && moved(s0, s3).length === owed.length && !moved(s0, s3).some(([a]) => !a.owed),
  `after the reload: rail ${railAt(s3)} · stored "${s3.stored}" · ${moved(s0, s3).length} lines moved of ${owed.length} owed`);
await p.click("#resetPill"); await p.waitForTimeout(1200);
const s4 = await snap();
check("    and after reset", railAt(s4) === "the name leads*" && !moved(s0, s4).length && s4.resetSays === "default", `rail ${railAt(s4)} · ${moved(s0, s4).length} lines differ · reset says "${s4.resetSays}"`);
// P6: /toggles/ lists it, as the rail's switch, not the book page's
const togglesPage = (() => { try { return readFileSync(new URL("../../toggles/index.html", import.meta.url), "utf8"); } catch { return null; } })();
const listed = !!togglesPage && /id="namelead"|data-toggle="namelead"|row-namelead\.png/u.test(togglesPage) && /no names/u.test(togglesPage);
const section = togglesPage ? (togglesPage.split(/id="namelead"|data-toggle="namelead"/u)[1] || "").slice(0, 3000) : "";
const notServed = !!section && /drawn only with the switches/u.test(section) && !/on every book page/u.test(section.split("</section>")[0] || section);
check("P6 /toggles/ lists the switch among the rail's, drawn only with the switches, never on every book page", listed && notServed,
  `${togglesPage ? "page read" : "no toggles page beside the reader"} · listed ${listed} · says drawn only with the switches ${notServed}`);
await b.close();
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
