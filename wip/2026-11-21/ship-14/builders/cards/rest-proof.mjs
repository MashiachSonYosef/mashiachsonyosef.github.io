// AT REST NOTHING MOVES. Every section of the books named is built with nothing pressed, on the page before the
// mends and on the page after them, and compared: every line under a word and under a run (the element whole:
// its classes, title, style, marks and chips), every run cell's classes and the count of its ties; then a sample
// of cards as they open (the card whole, its placing left out): every run cell's card up to --runs, and every
// n-th word's so that about --cards cards open.
// A card's first fit follows what has arrived when it is fitted, so the two pages are best served by one server
// (--before-page names the untouched page there): the base page served beside the mended one opened a card of
// Ruth «tight» where the live server's same bytes did not, while the suite was pressing the mended server.
// node rest-proof.mjs --before http://127.0.0.1:8899 --after http://127.0.0.1:8935 [--before-page zone.html] [--after-page zone.html] [--books ruth,genesis] [--query "&maqaf=maqaf"] [--cards 30] [--runs 20] [--width 412]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const BEFORE = arg("before", "http://127.0.0.1:8899"), AFTER = arg("after", null), BOOKS = arg("books", "ruth").split(","), QUERY = arg("query", ""), BPAGE = arg("before-page", "zone.html"), APAGE = arg("after-page", "zone.html"), CARDS = Number(arg("cards", "30")), RUNS = Number(arg("runs", "20")), WIDTH = Number(arg("width", "412"));
if (!AFTER) { console.error("usage: node rest-proof.mjs --before <base> --after <base> [--books a,b] [--query &x=y] [--cards n] [--runs n]"); process.exit(2); }
const T = 240000;
const read = async (base, page, book) => {
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: WIDTH, height: 915 } });
    const p = await ctx.newPage(); p.setDefaultTimeout(T);
    const errors = []; p.on("pageerror", (e) => errors.push(String(e && e.message)));
    await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
    await p.goto(`${base}/${page}?b=${book}${QUERY}`, { waitUntil: "networkidle", timeout: T });
    await p.waitForSelector("section.seg .he-text .wb", { state: "attached", timeout: T });
    await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: T }).catch(() => {});
    await p.waitForTimeout(1200);
    await p.evaluate(() => window.__materialise());
    await p.waitForTimeout(3000);
    await p.waitForFunction(() => !window.__livePending, null, { timeout: T }).catch(() => {});
    // the ties, the pieces under split words and the cards' numbers are drawn in slices after the sections are
    // built: the page counts what is still owed (__tiePending, __seatPending), and two looks a second apart agree
    await p.waitForFunction(() => !window.__tiePending && !window.__seatPending && !window.__livePending, null, { timeout: T, polling: 500 }).catch(() => {});
    let last = -1;
    // (a book of twenty thousand words is tied for some minutes: the first look at Genesis gave up after two)
    for (let i = 0; i < 1500; i += 1) { const n = await p.evaluate(() => document.querySelectorAll("svg.wj-tie > path").length + document.querySelectorAll(".he-text .g").length + document.querySelectorAll(".he-text .g-pcs").length + (window.__tiePending || 0)); if (n === last) break; last = n; await p.waitForTimeout(1000); }
    await p.waitForTimeout(2500);
    // one card opened and closed before any is read: what a first card waits for (the faces, the files a card
    // asks once) is here for all that follow
    await p.evaluate(() => { const wb = document.querySelector("section.seg .he-text .wb:not(.mark)"); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); });
    await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud > .rows .b-read > p:not(.r-label):not(.r-wait)", { state: "attached", timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(3000);
    await p.keyboard.press("Escape"); await p.waitForTimeout(800);
    const [lines, untied] = await p.evaluate(() => {
      const out = [], untied = [];
      for (const sec of document.querySelectorAll("section.seg")) {
        const label = (sec.querySelector(".vnum") || {}).textContent || "?";
        let i = 0;
        for (const x of sec.querySelectorAll(".he-text .wb, .he-text .wjoin")) {
          i += 1;
          const g = x.querySelector(":scope > .g");
          const run = x.classList.contains("wjoin");
          out.push(`${label}#${i} ${run ? "run" : "word"}[${x.className}]${run ? ` ties=${x.querySelectorAll(":scope > svg.wj-tie > path").length} key=${x.__key ? "yes" : "no"}` : ""} ${g ? g.outerHTML : "(no line)"}`);
          // the same line before the tie pass reaches it: the word not yet marked tied, its split reading still one text
          let flat = "(no line)";
          if (g) { const c = g.cloneNode(true); c.querySelectorAll(".g-pcs").forEach((r) => r.replaceWith(document.createTextNode(r.textContent))); c.normalize(); flat = c.outerHTML; }
          untied.push(`${label}#${i} ${run ? "run" : "word"}[${[...x.classList].filter((k) => k !== "tied").join(" ")}] ${run ? `key=${x.__key ? "yes" : "no"} ` : ""}${flat}`);
        }
      }
      return [out, untied];
    });
    // the cards: every run cell with a key up to RUNS, then every n-th word
    const targets = await p.evaluate(({ cards, runs }) => {
      const wbs = [...document.querySelectorAll("section.seg .he-text .wb:not(.mark)")];
      const pick = new Set();
      let r = 0;
      for (const run of document.querySelectorAll("section.seg .he-text .wjoin")) { if (!run.__key || r >= runs) continue; const wb = run.querySelector(".wb:not(.mark)"); if (wb) { pick.add(wbs.indexOf(wb)); r += 1; } }
      const step = Math.max(1, Math.floor(wbs.length / Math.max(1, cards)));
      for (let i = 0, n = 0; i < wbs.length && n < cards; i += step, n += 1) pick.add(i);
      return [...pick].filter((i) => i >= 0).sort((a, b) => a - b);
    }, { cards: CARDS, runs: RUNS });
    const cards = [], fits = [];
    for (const i of targets) {
      const at = await p.evaluate((i) => { const wb = [...document.querySelectorAll("section.seg .he-text .wb:not(.mark)")][i]; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return `${(wb.closest("section.seg").querySelector(".vnum") || {}).textContent}:${[...wb.closest("section.seg").querySelectorAll(".he-text .wb:not(.mark)")].indexOf(wb) + 1}`; }, i);
      await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud > .rows .b-read > p:not(.r-label):not(.r-wait)", { state: "attached", timeout: 30000 }).catch(() => {});
      await p.waitForFunction(() => !document.querySelector("#hud > .rows .b-read > p.r-wait"), null, { timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(900);
      // the card whole, without what its fit to the window decides (its placing and sizes, «tight», «floor», a
      // label's «more», the lines the fit folds away, the record's «the record, whole» press): the fit follows
      // what had arrived when it measured, and differs between two looks at one page (the untouched page read
      // twice: one card of Obadiah with that press and without); it is counted apart
      const [html, fit] = await p.evaluate(() => { const h = document.querySelector("#hud"); if (!h || h.hidden) return ["(no card)", ""]; const c = h.cloneNode(true); const FIT = ["tight", "floor", "more"]; let more = 0, hid = 0; const grow = c.querySelectorAll("button.d-grow").length; c.querySelectorAll("button.d-grow").forEach((x) => x.remove()); for (const x of [c, ...c.querySelectorAll("*")]) { x.removeAttribute("style"); if (x.classList.contains("more")) more += 1; x.classList.remove(...FIT); if (x.getAttribute("class") === "") x.removeAttribute("class"); if (x.hidden && (x.classList.contains("prov") || x.classList.contains("vol-slot"))) { hid += 1; x.removeAttribute("hidden"); } } return [`[${[...h.classList].filter((k) => !["pop", "moved", ...FIT].includes(k)).sort().join(" ")}] ${c.innerHTML}`, `${[...h.classList].filter((k) => FIT.includes(k)).sort().join(" ")}|more ${more}|folded ${hid}|grow ${grow}`]; });
      // and the line under the pressed word with the card open (an open paints its own line)
      const under = await p.evaluate((i) => { const wb = [...document.querySelectorAll("section.seg .he-text .wb:not(.mark)")][i]; const run = wb.closest(".wjoin"); const g = (run && run.querySelector(":scope > .g")) || wb.querySelector(":scope > .g"); return g ? g.outerHTML : ""; }, i);
      cards.push(`${at} ${html} || line: ${under}`); fits.push(fit);
      await p.keyboard.press("Escape"); await p.waitForTimeout(400);
    }
    return { lines, untied, cards, fits, errors };
  } finally { await b.close(); }
};
let bad = 0;
for (const book of BOOKS) {
  const [a, z] = [await read(BEFORE, BPAGE, book), await read(AFTER, APAGE, book)];
  const diff = (x, y) => { const out = []; for (let i = 0; i < Math.max(x.length, y.length); i += 1) if (x[i] !== y[i]) out.push(i); return out; };
  const dl = diff(a.lines, z.lines), du = diff(a.untied, z.untied), dc = diff(a.cards, z.cards), df = diff(a.fits, z.fits);
  const runs = a.lines.filter((l) => / run\[/u.test(l)).length;
  console.log(`${dl.length || dc.length ? "FAIL" : "  ok"}  ${book}${QUERY || " (at rest)"} at ${WIDTH}: ${a.lines.length} lines before and ${z.lines.length} after (${runs} of them run lines), ${dl.length} differ (${du.length} of them in more than how far the ties had been drawn); ${a.cards.length} cards before and ${z.cards.length} after, ${dc.length} differ (and the fit of ${df.length} to the window, counted apart)${a.errors.length || z.errors.length ? `; page errors before ${a.errors.length}, after ${z.errors.length}` : ""}`);
  for (const i of dl.slice(0, 3)) console.log(`     line ${i}\n       before: ${String(a.lines[i]).slice(0, 400)}\n       after:  ${String(z.lines[i]).slice(0, 400)}`);
  for (const i of dc.slice(0, 3)) { const x = String(a.cards[i]), y = String(z.cards[i]); let k = 0; while (k < Math.min(x.length, y.length) && x[k] === y[k]) k += 1; console.log(`     card ${i} (${x.slice(0, 12)}) first differs at ${k}\n       before: ${x.slice(Math.max(0, k - 80), k + 200)}\n       after:  ${y.slice(Math.max(0, k - 80), k + 200)}`); }
  if (dl.length || dc.length) bad += 1;
}
process.exit(bad ? 1 : 0);
