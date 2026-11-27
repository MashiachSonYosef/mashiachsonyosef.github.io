// Helper G · read-only walk: every word of a chained book pressed as a reader presses it, and its card read in the
// clear (the chain file holds only fingerprints). The page is opened and waited for exactly as the site's own reader
// of cards opens it (tools/card-readings-v1.mjs readCards: the same visits, the same late files waited for), and the
// in-page reader below is that tool's cardsInPage with more read off each card: the line under the word, the lines
// the card prints above its pills of every kind, each pill's own data, what the card says it withheld, the entry the
// card takes its place for, and the record under the pressed pill.
// Writes one gzip JSONL per book under walk-<state>/ in this folder. Writes nothing in the tree it reads.
// Usage: node walk.mjs <rest|lifted> <book[,book...]> [--full-hud]
import { writeFileSync, mkdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const R = join(S, "base/reader");
const OUT = dirname(fileURLToPath(import.meta.url));
const T = (f) => import(join(R, "tools", f));
const { serveTree } = await T("serve-tree-v1.mjs");
const { loadPlaywright, launchOptions } = await T("playwright-v1.mjs");
const { linesOnPage, linesInPage } = await T("resting-lines-v1.mjs");
const { STATES } = await T("card-readings-v1.mjs");

const [stateName, bookArg] = process.argv.slice(2);
const books = String(bookArg || "").split(",").filter(Boolean);
const state = STATES[stateName];
if (!state || !books.length) { console.error("usage: node walk.mjs <rest|lifted> <book,...>"); process.exit(2); }

/** IN THE PAGE: the cards of sections [from, to). */
const cardsInPageG = async ([from, to, perCardMs = 15000]) => {
  const hud = document.getElementById("hud");
  const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });
  const readBand = () => hud.querySelector(":scope > .rows > .b-read");
  const settled = () => { const read = readBand(); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
  const shut = () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return hud.hidden && !hud.children.length; };
  const row = (q) => {
    const bs = [...hud.querySelectorAll(`:scope > .rows > ${q} .s-pills button`)];
    return bs.length ? { of: bs.map((x) => x.textContent), on: bs.map((x, i) => (x.getAttribute("aria-pressed") === "true" ? i : -1)).filter((i) => i >= 0) } : null;
  };
  const flat = (s) => String(s || "").replace(/\s+/gu, " ").trim();
  const readCard = () => {
    const read = readBand();
    const pills = read.querySelector(":scope > .r-pills");
    const dc = hud.querySelector(".d-card");
    return {
      forms: row(".b-q"), chain: row(".b-chain"), chain_words: row(".b-chain-cell"), divisions: row(".b-cut"), blocks: row(".b-cell"),
      here: [...read.querySelectorAll(":scope > .r-piece")].map((x) => {
        const b = x.querySelector(":scope > b"), chip = x.querySelector(".g-lic");
        const c = b ? b.cloneNode(true) : null;
        if (c) for (const n of c.querySelectorAll(".n")) n.remove();
        const lab = x.querySelector(":scope > i");
        return [x.classList.contains("r-sug") ? "suggested" : "here", c ? c.textContent : "", chip ? (chip.dataset.line || "") : "", chip ? (chip.title || "") : "", b ? (b.title || "") : "", lab ? lab.textContent : "", flat(x.textContent)];
      }),
      // the lines of the sources at this place, which the site's reader of cards does not read
      dflt: [...read.querySelectorAll(":scope > .r-dflt")].map((x) => {
        const b = x.querySelector(":scope > b"), chip = x.querySelector(".g-lic"), lab = x.querySelector(":scope > i");
        return [x.dataset.src || "", b ? b.textContent : "", chip ? (chip.dataset.line || "") : "", chip ? (chip.title || "") : "", lab ? lab.textContent : "", flat(x.textContent)];
      }),
      pills: pills ? [...pills.querySelectorAll(":scope > button")].map((x) => [x.textContent, x.title || "", x.dataset.by || "", x.getAttribute("aria-pressed") === "true" ? 1 : 0, x.dataset.grade || "", x.dataset.pointer || "", x.dataset.pointerBy || "", x.dataset.read || "", (x.dataset.sense ? "s" : "") + (x.dataset.rests ? "r" : "")]) : [],
      ds: pills ? { ...pills.dataset } : null,
      // every other child of the readings band, by its class and its words
      other: [...read.children].filter((x) => !x.classList.contains("r-piece") && !x.classList.contains("r-dflt") && !x.classList.contains("r-pills")).map((x) => [x.className, flat(x.textContent).slice(0, 300)]),
      entry: window.__cardEntry || "", name: window.__cardName || "", held: window.__cardHeld || "", gradedBy: window.__cardGradedBy || "", place: window.__cardPlace || "",
      lead: Array.isArray(window.__poolLead) ? window.__poolLead.map(String) : null,
      poolPlace: Array.isArray(window.__poolPlace) ? window.__poolPlace.map((x) => (x ? 1 : 0)).join("") : null,
      poolOv: Array.isArray(window.__poolOv) ? window.__poolOv : null,
      dcard: dc ? [flat((dc.querySelector(".d-body") || {}).textContent).slice(0, 400), flat((dc.querySelector(".d-foot") || {}).textContent).slice(0, 400)] : null,
      bands: [...hud.querySelectorAll(":scope > .rows > *")].map((x) => x.className),
      unreached: !!read.querySelector(":scope > .r-unreachable"),
    };
  };
  const secs = [...document.querySelectorAll("section.seg")];
  const out = [];
  let halted = false;
  for (let i = from; i < Math.min(to, secs.length) && !halted; i += 1) {
    const he = secs[i].querySelector(".he-text");
    const wbs = he ? [...he.querySelectorAll(".wb")] : [];
    const rec = { i, label: (secs[i].querySelector(".vnum") || {}).textContent || "", built: !!he && !secs[i].classList.contains("seg-wait"), entries: wbs.length, cards: [] };
    const own = secs[i].__sec ? String(secs[i].__sec.label ?? "") : "";
    let n = 0;
    for (let e = 0; e < wbs.length && !halted; e += 1) {
      const wb = wbs[e];
      if (wb.classList.contains("mark")) continue;
      n += 1;
      if (!shut()) { rec.cards.push({ e, fault: "the card before it did not shut" }); halted = true; continue; }
      window.__pool = null; window.__poolLead = null; window.__poolPlace = null; window.__poolOv = null;
      (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
      const t0 = performance.now();
      while (!settled() && performance.now() - t0 < perCardMs) await turn();
      if (!settled()) { rec.cards.push({ e, fault: `its readings did not arrive in ${perCardMs / 1000} s` }); halted = true; continue; }
      const card = readCard();
      if (card.unreached) { rec.cards.push({ e, fault: "the card says the catalog could not be reached" }); halted = true; continue; }
      delete card.unreached;
      const wn = hud.querySelector(":scope > .head .wn");
      const m = wn ? /^(?:(.*):)?(\d+)(?:–(\d+))? .$/u.exec(wn.textContent) : null;
      card.head = flat((hud.querySelector(":scope > .head") || {}).textContent).slice(0, 200);
      card.wn = wn ? wn.textContent : "";
      if (!m || (m[1] ?? "") !== own || !(Number(m[2]) <= n && n <= Number(m[3] || m[2]))) { rec.cards.push({ e, fault: `the card that opened says it stands on ${wn ? wn.textContent : "no word"}, and the word pressed is ${own}:${n}` }); halted = true; continue; }
      card.over = [Number(m[2]), Number(m[3] || m[2])];
      card.e = e; card.n = n;
      card.joined = !!wb.closest(".wjoin");
      card.kq = wb.classList.contains("kq") ? 1 : 0;
      rec.cards.push(card);
    }
    out.push(rec);
  }
  shut();
  return {
    sections: out, of: secs.length,
    ruled: document.querySelectorAll(".wb.chosen, .wjoin.chosen").length,
    state: { reader: document.body.classList.contains("en") ? "the English reader" : "the Hebrew reader", pointing: window.__masorah || null, signs: window.__signs || null, names: window.__nonames || null, senses: window.__senses || null, sources_off: [...(window.__sourcesOff || [])].sort(), defaults: (window.__default || {}).on || null, second: (window.__default || {}).second || null, book: (window.__default || {}).book || null, kinds: window.__kindsHere ? window.__kinds || null : null },
  };
};

const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
mkdirSync(join(OUT, `walk-${stateName}`), { recursive: true });
try {
  for (const work of books) {
    const t0 = Date.now();
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const notes = [];
    try {
      const p = await ctx.newPage();
      const errors = [];
      p.on("pageerror", (e) => errors.push(String(e && e.message)));
      await p.goto(`${tree.base}/zone.html?b=${work}`, { waitUntil: "networkidle" });
      if (state.keep) {
        await p.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, state.keep);
        await p.reload({ waitUntil: "networkidle" });
      }
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      const late = await p.evaluate(async (book) => {
        const ix = await fetch("data/source-suggested/index.json").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        const map = await fetch("data/form-of-pills-v1.json", { method: "HEAD" }).then((r) => r.ok).catch(() => false);
        return { suggested: !!(ix && ix.books && ix.books[book]), map };
      }, work);
      if (late.map) await p.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 });
      const before = await linesOnPage(p, {});
      const total = before.of;
      if (late.suggested) {
        await p.evaluate((i) => { const sec = document.querySelectorAll("section.seg")[i]; const wb = sec && sec.querySelector(".he-text .wb:not(.mark)"); if (wb) (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, 0);
        await p.waitForFunction(() => window.__suggested !== undefined, null, { timeout: 30000 });
        await p.waitForTimeout(100);
        await p.keyboard.press("Escape");
      }
      if (await p.evaluate(() => { const d = window.__default; return !!(d && d.book && !d.ready && !d.failed); })) {
        let landed = false;
        for (let k = 0; k < 12 && !landed; k += 1) {
          const opened = await p.evaluate(([i, at]) => {
            const secs = document.querySelectorAll("section.seg"), ws = [];
            for (let x = i; x < secs.length && ws.length <= at; x += 1) ws.push(...secs[x].querySelectorAll(".he-text > .wb:not(.mark):not(.kq)"));
            const wb = ws[at];
            if (!wb) return false;
            (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
            return true;
          }, [0, k]);
          if (!opened) break;
          landed = await p.waitForFunction(() => { const d = window.__default; return !!(d && (d.ready || d.failed)); }, null, { timeout: 5000 }).then(() => true, () => false);
          await p.waitForTimeout(100);
          await p.keyboard.press("Escape");
        }
        if (!landed) notes.push("the default sources' file for the book did not arrive with the first cards");
      }
      const sections = [];
      let pageState = before.state, ruled = 0;
      for (let a = 0; a < total; a += 12) {
        const got = await p.evaluate(cardsInPageG, [a, Math.min(a + 12, total)]);
        sections.push(...got.sections);
        pageState = got.state; ruled = got.ruled;
        if (got.sections.some((s) => s.cards.some((c) => c.fault))) { notes.push("halted at a card that could not be read"); break; }
      }
      const after = await p.evaluate(linesInPage, [0, total, false]);
      const moved = before.sections.filter((s, x) => JSON.stringify(s.units) !== JSON.stringify(after.sections[x].units)).map((s) => s.label);
      const lines = [];
      lines.push(JSON.stringify({ meta: 1, work, state_name: stateName, state: pageState, of: total, ruled, moved, errors, notes,
        lines: before.sections.map((s) => ({ i: s.i, label: s.label, entries: s.entries, units: s.units, bare: s.bare, odd: s.odd })), credits: before.credits, unnamed: before.unnamed }));
      let words = 0, pills = 0;
      for (const s of sections) for (const c of s.cards) { lines.push(JSON.stringify({ si: s.i, label: s.label, ...c })); words += 1; pills += (c.pills || []).length; }
      writeFileSync(join(OUT, `walk-${stateName}`, `${work}.jsonl.gz`), gzipSync(Buffer.from(lines.join("\n") + "\n", "utf8")));
      console.log(`${work} · ${stateName} · ${sections.length} of ${total} sections · ${words} words · ${pills} pills · ${Math.round((Date.now() - t0) / 1000)} s · ruled ${ruled} · lines moved ${moved.length} · page errors ${errors.length}${notes.length ? ` · ${notes.join("; ")}` : ""}`);
    } catch (e) {
      console.log(`${work} · ${stateName} · FAILED: ${String((e && e.message) || e).split("\n")[0]}`);
    } finally { await ctx.close(); }
  }
} finally { await browser.close().catch(() => {}); await tree.close(); }
