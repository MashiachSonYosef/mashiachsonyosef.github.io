// Helper G · read-only: for a sample of words (20 a book, evenly spaced through the book so every chapter is
// reached, or the places listed in a file), the chain page's own cell for the word as a browser renders it, and the
// word's card on the reading page as a first visit opens it, read in the clear and whole; then each thing the chain
// page prints under the word is recomputed from what the card shows, the way the chain page's own recipe tells a
// reader to do it. Serves the frozen tree's root (so /chain/ and /reader/ are both reached) and writes
// hand-sample.jsonl and, for the places asked, screenshots, beside this script.
// Usage: node hand.mjs <book,...> [--places file.json] [--shots n]
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const BASE = join(S, "base"), R = join(BASE, "reader");
const OUT = dirname(fileURLToPath(import.meta.url));
const T = (f) => import(join(R, "tools", f));
const { serveTree } = await T("serve-tree-v1.mjs");
const { loadPlaywright, launchOptions } = await T("playwright-v1.mjs");
const { labelsFor, titleOf, chipLabelOf } = await T("card-readings-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const sha12 = (s) => createHash("sha256").update(String(s), "utf8").digest("hex").slice(0, 12);
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const books = String(process.argv[2] || "").split(",").filter(Boolean);
const placesFile = arg("--places");
const SHOTS = Number(arg("--shots", "0")) || 0;
const outFile = join(OUT, arg("--out", "hand-sample.jsonl"));
const labels = labelsFor(R);
mkdirSync(join(OUT, "shots"), { recursive: true });

const picksOf = (book) => {
  const zone = gz(join(R, "data/zones", `${book}.bin`));
  const all = [];
  zone.sections.forEach((sec, si) => { let n = 0; (sec.words || []).forEach((w, e) => { if (w.mark) return; n += 1; all.push({ book, si, e, n, label: String(sec.label), s: String(w.s ?? ""), k: String(w.k ?? "") }); }); });
  if (placesFile) { const want = JSON.parse(readFileSync(placesFile, "utf8")).filter((p) => p.book === book); return want.map((p) => all.find((x) => x.label === p.label && x.n === p.n)).filter(Boolean); }
  const out = [];
  for (let j = 0; j < 20; j += 1) out.push(all[Math.floor(((j + 0.5) * all.length) / 20)]);
  return out;
};

const pw = await loadPlaywright();
const tree = await serveTree(BASE);
const browser = await pw.chromium.launch(launchOptions());
writeFileSync(outFile, "");
let shots = 0;
try {
  for (const book of books) {
    const picks = picksOf(book);
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    try {
      // ── the chain page, as a browser renders it ──
      const cp = await ctx.newPage();
      await cp.goto(`${tree.base}/chain/${book}/`, { waitUntil: "load" });
      const chainCells = await cp.evaluate((ps) => {
        const secs = [...document.querySelectorAll("section")];
        return ps.map(({ si, e }) => {
          const sec = secs[si]; if (!sec) return null;
          const cell = sec.querySelectorAll(".ws > .w")[e]; if (!cell) return null;
          const k = cell.querySelector("p.k");
          const span = k ? k.querySelector("span") : null;
          return { section: (sec.querySelector("h2") || {}).textContent || "", word: k ? k.childNodes[0].textContent : "", key: span ? span.textContent : "",
            links: [...cell.querySelectorAll("li:not(.more)")].map((li) => [(li.querySelector("b") || {}).textContent || "", (li.querySelector("i") || {}).textContent || ""]),
            more: (cell.querySelector("li.more") || cell.querySelector("p.none") || {}).textContent || "", text: cell.innerText };
        });
      }, picks);
      if (shots < SHOTS) { await cp.screenshot({ path: join(OUT, "shots", `chain-${book}-top.png`) }); }
      await cp.close();
      // ── the reading page ──
      const p = await ctx.newPage();
      const errors = [];
      p.on("pageerror", (err) => errors.push(String(err && err.message)));
      await p.goto(`${tree.base}/reader/zone.html?b=${book}`, { waitUntil: "networkidle" });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await p.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => {});
      await p.evaluate(() => window.__materialise(0));
      await p.waitForFunction(() => !!(window.__latticeStore || window.__latticeRefused), null, { timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(1500);
      // the late files, as the site's reader of cards waits for them: one card opened and shut until they are here
      for (let k = 0; k < 6; k += 1) {
        await p.evaluate((at) => { const ws = [...document.querySelectorAll("section.seg .he-text > .wb:not(.mark):not(.kq)")]; const wb = ws[at]; if (wb) (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, k);
        await p.waitForTimeout(700);
        const ok = await p.evaluate(() => { const d = window.__default; return window.__suggested !== undefined && !!(d && (d.ready || d.failed || !d.book)); });
        await p.keyboard.press("Escape");
        if (ok) break;
      }
      for (const [x, pick] of picks.entries()) {
        const got = await p.evaluate(async ({ si, e }) => {
          const turn = (ms) => new Promise((r) => setTimeout(r, ms));
          const flat = (s) => String(s || "").replace(/\s+/gu, " ").trim();
          const hud = document.getElementById("hud");
          const sec = document.querySelectorAll("section.seg")[si];
          const wb = sec.querySelectorAll(".he-text .wb")[e];
          sec.scrollIntoView({ block: "center" }); await turn(150);
          const wEl = wb.querySelector(".w") || wb;
          const g = wb.querySelector(":scope > .g") || (wb.closest(".wjoin") ? wb.closest(".wjoin").querySelector(":scope > .g") : null);
          const chip = g ? g.querySelector(".g-lic") : null;
          const gc = g ? g.cloneNode(true) : null; if (gc) for (const y of gc.querySelectorAll(".g-lic")) y.remove();
          const res = { word_printed: wEl.textContent, word_inner: wEl.innerText, line: gc ? gc.textContent.trim() : null, line_chip: chip ? flat(chip.textContent) : "", line_chip_title: chip ? chip.title : "", line_chip_id: chip ? chip.dataset.line || "" : "", joined: !!wb.closest(".wjoin") };
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
          const t0 = performance.now();
          const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
          while (!settled() && performance.now() - t0 < 20000) await turn(50);
          await turn(400);
          const read = hud.querySelector(":scope > .rows > .b-read");
          const btns = (q) => [...hud.querySelectorAll(`:scope > .rows > ${q} .s-pills button`)].map((b) => [b.textContent, b.getAttribute("aria-pressed") === "true" ? 1 : 0, b.title || ""]);
          res.head = flat((hud.querySelector(":scope > .head") || {}).innerText);
          res.rows = { forms: btns(".b-q"), chain: btns(".b-chain"), chain_words: btns(".b-chain-cell"), divisions: btns(".b-cut"), blocks: btns(".b-cell") };
          res.band_labels = [...hud.querySelectorAll(":scope > .rows > *")].map((b) => [b.className, flat(b.innerText).slice(0, 140)]);
          res.above = read ? [...read.children].filter((c) => !c.classList.contains("r-pills")).map((c) => [c.className, flat(c.innerText), ((c.querySelector(".g-lic") || {}).title || "")]) : [];
          const pills = read ? [...read.querySelectorAll(":scope > .r-pills > button")] : [];
          res.pills = pills.map((b) => [b.textContent, b.title || "", b.dataset.by || "", b.getAttribute("aria-pressed") === "true" ? 1 : 0]);
          res.pills_visible_text = pills.slice(0, 8).map((b) => b.innerText);
          const dc = hud.querySelector(".d-card");
          res.record = dc ? [flat((dc.querySelector(".d-body") || {}).innerText).slice(0, 500), flat((dc.querySelector(".d-foot") || {}).innerText).slice(0, 500)] : null;
          res.hud_text = flat(hud.innerText).slice(0, 3000);
          res.entry = window.__cardEntry || ""; res.ds = read && read.querySelector(".r-pills") ? { ...read.querySelector(".r-pills").dataset } : null;
          return res;
        }, pick);
        if (shots < SHOTS && (process.argv.includes("--shot-all") || x % 7 === 3)) { await p.screenshot({ path: join(OUT, "shots", `card-${book}-${pick.label.replace(":", "_")}-${pick.n}.png`) }); shots += 1; }
        await p.keyboard.press("Escape");
        // ── the recomputation, as the chain page's recipe tells it ──
        const cc = chainCells[x];
        const check = {};
        if (cc) {
          check.word = sha12(got.word_printed) === cc.word ? "same" : sha12(pick.s) === cc.word ? "DIFFERS-from-the-printed-word, same as the zone's string" : "DIFFERS";
          const keyOnCard = got.rows.blocks.map((b) => b[0]);
          check.key = !cc.key ? "(no key printed)" : keyOnCard.some((k) => sha12(k) === cc.key) ? "same as a block button" : sha12(pick.k) === cc.key ? "NOT-ON-THE-CARD, same as the zone's key" : "DIFFERS";
          check.links = cc.links.map(([r, s], i) => {
            const pl = got.pills[i];
            if (!pl) return "NO-PILL";
            const t = titleOf(pl[1], labels.known);
            return `${sha12(pl[0]) === r ? "r" : "R-DIFFERS"}/${t && sha12(t.label) === s ? "s" : "S-DIFFERS"}`;
          });
          const m = /^(?:and ([\d,]+) more at rest · )?([\d,]+) with the switches lifted, in the file$/u.exec(cc.more) || /^no reading at rest · ([\d,]+) with the switches lifted, in the file$/u.exec(cc.more);
          const left = m && cc.more.startsWith("and") ? Number(m[1].replace(/,/gu, "")) : 0;
          check.count = cc.links.length + left === got.pills.length ? "same" : `the chain page says ${cc.links.length + left} at rest, the card prints ${got.pills.length}`;
        }
        appendFileSync(outFile, JSON.stringify({ ...pick, chain_page: cc, card: got, check, page_errors: errors.length }) + "\n");
      }
      console.log(`${book}: ${picks.length} words read`);
    } catch (err) { console.log(`${book}: FAILED ${String((err && err.message) || err).split("\n")[0]}`); } finally { await ctx.close(); }
  }
} finally { await browser.close().catch(() => {}); await tree.close(); }
