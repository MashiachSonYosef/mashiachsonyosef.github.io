// Scratch (builder H2): the browser walk of the live reader with the place card. For each chapter named it opens
// reader/zone.html at a phone's size (412 x 915, deviceScaleFactor 2, touch), builds the chapter's sections, presses
// every word of the book, and holds what the sheet prints under «At this word» to what the chapter's file holds (read
// here from disk, drawn here by the same few rules of print, code the page does not share). It times each card, opens
// and shuts every whole entry on a sample of cards and measures that the sheet did not move, taps a few words as a
// finger does, and collects every page error. Read only: the site root is served on a port the machine gives.
// node h2-walk.mjs <site root> <out.json> <book:chapter[-chapter]> …
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [SITE, OUT, ...wants] = process.argv.slice(2);
const R = join(SITE, "reader");
const DIR = join(R, "data", "place-answers-v1", "page");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const chapters = []; for (const w of wants) { const [book, r] = w.split(":"); const [a, b] = r.split("-").map(Number); for (let c = a; c <= (b || a); c += 1) chapters.push([book, c]); }
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", emsp: " ", nbsp: " " };
const printable = (s) => String(s).replace(/\\?&(#x[0-9A-Fa-f]+|#[0-9]+|amp|lt|gt|quot|apos|emsp|nbsp);/g, (all, r) => (r[0] === "#" ? String.fromCodePoint(r[1] === "x" ? parseInt(r.slice(2), 16) : parseInt(r.slice(1), 10)) : NAMED[r]));
const tidy = (s) => printable(s).replace(/\s+/g, " ").trim();
const q = (list, none) => (list.length ? list.map((g) => `«${tidy(g)}»`).join(", ") : none);
// a citation's words by the kinds the chapter file gives them ([words, kind] each, the eighth cut): «» for the entry's
// meaning or a unit's opening, the rest plain, each once (the audit's rule of 27 November 2026)
const cited = (b) => {
  const runs = b[6];
  const meant = runs.filter(([, kd]) => kd === "main_gloss" || kd === "opening").map(([t]) => tidy(t)).filter(Boolean);
  const plain = [...new Set(runs.filter(([, kd]) => kd !== "main_gloss" && kd !== "opening").map(([t]) => tidy(t)).filter(Boolean))];
  return [...(meant.length ? [meant.map((x) => `«${x}»`).join(", ")] : []), ...plain];
};
/** What the card must print under «At this word» for a word, from the chapter's file: [source name, the strings]. */
function expected(e) {
  const rows = [];
  for (const f of e.f) {
    const t = f.t;
    if (t && t.p) rows.push(["STEP Bible", t.p.flatMap((p) => (p[0] === null ? [p[3]] : [p[3], p[0].trim()]))]);
    else if (t && t.other) rows.push(["STEP Bible", t.other.flatMap((p) => (p[1] === null ? [p[0]] : [p[0], p[1].trim()]))]);
    const m = f.m || f.mo; if (m) rows.push(["MACULA Hebrew", m.flatMap((x) => [x[2], x[1]])]);
    const h = f.h || {};
    if (h.u) {
      const very = h.u.filter((u) => u[1] < 2), verse = h.u.filter((u) => u[1] >= 2);
      if (very.length) rows.push(["UBS Dictionary of Biblical Hebrew", very.flatMap((u) => (u[1] === 1 ? [u[3], q(u[2], "(a sense with no gloss)")] : [q(u[2], "(a sense with no gloss)")]))]);
      if (verse.length) rows.push(["UBS Dictionary of Biblical Hebrew", verse.map((u) => q(u[2], "(a sense with no gloss)"))]);
    }
    if (h.o) rows.push(["Brown-Driver-Briggs, the Open Scriptures file", h.o.map((o) => q(o[3], "(no meaning is marked in this sense)"))]);
    if (h.b) {
      // each line: the headword, where it stands in the record, its words, its marks; then the row's sentences
      const strings = h.b.flatMap((b) => [b[7], whereIn(b), ...cited(b), ...(b[14] ? ["†"] : []), ...(b[15] ? ["‡"] : [])]);
      const subs = []; const many = Math.max(...h.b.map((b) => b[8]));
      if (many > 1) subs.push(`STEP's number for this word stands on ${many} records of this file. Only a record whose own headword is this word's is shown here.`);
      if (h.b.some((b) => b[13])) subs.push("Where a point's label names another stem, the file has written a cross-reference into the label; the line names the stem the record's own headings put the verse under.");
      const most = Math.max(0, ...h.b.map((b) => b[14] || 0)); if (most) subs.push(`† BDB cites this verse; this number stands ${most} times in it, and BDB does not say which word it means.`);
      for (const x of new Set(h.b.filter((b) => b[15]).map((b) => `‡ BDB files this verse under another word of the same letters (${b[15].another}.${b[15].gloss.length ? ` ${b[15].gloss.map((g) => `«${tidy(g)}»`).join(", ")}` : ""}); STEP's number ${b[9]} is BDB's ${b[15].entry}.`))) subs.push(x);
      rows.push(["Brown-Driver-Briggs, unabridged", strings, subs]);
    }
  }
  return rows;
}
/** Where an unabridged line stands in its record, as the chapter file gives it (the stem, its head, the point's labels). */
const whereIn = (b) => {
  const label = [b[4], b[5]].filter((x) => x).join(" ");
  if (b[12]) return `${b[10]}, before its numbered senses`;
  if (!b[10]) return label || "the opening";
  if (b[13]) return `${b[10]}, at a point the file labels «${label}»`;
  return label.startsWith(b[10]) ? label : `${b[10]} ${label || "(its opening)"}`;
};
/** At a word written one way and read another, the sentence on the lines under both forms, or none. */
const pairWant = (e) => {
  if (e.k !== 1 || e.f.length !== 2) return [];
  const key = (b) => JSON.stringify(b.slice(0, 13)); const one = new Set(((e.f[0].h || {}).b || []).map(key));
  const n = ((e.f[1].h || {}).b || []).filter((b) => one.has(key(b))).length;
  return n ? [`${n === 1 ? "One line" : `${n} lines`} of the unabridged Brown-Driver-Briggs stand${n === 1 ? "s" : ""} under both forms: STEP's grammar does not give the two forms different stems there, so nothing in the files tells which form the record means.`] : [];
};
// in the page: press the word at a verse's label and entry, wait for its card and its dictionaries, hand back what it shows
const PRESS = `async ([label, ei, n, openShut]) => {
  const tick = () => new Promise((r) => setTimeout(r, 4));
  const hud = document.getElementById("hud");
  const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label);
  if (!sec) return { fault: "no section" };
  const word = sec.__sec.words[ei];
  const wb = [...sec.querySelectorAll(".wb")].find((x) => x.__word === word);
  if (!wb) return { fault: "no word element" };
  if (!hud.hidden) document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  const t0 = performance.now();
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  const card = () => hud.querySelector(":scope > .place-card");
  let spins = 0; while (!(window.__placeCard.open && window.__placeCard.open.drawn) && spins < 3000) { await tick(); spins += 1; }
  // the frame's readings band: its pills drawn, or its sentence where the cell has none
  const band = () => hud.querySelector(".b-read");
  spins = 0; while (!(band() && !band().querySelector(".r-wait") && (band().querySelector(".r-pills button") || band().querySelector("p:not(.r-label)"))) && spins < 3000) { await tick(); spins += 1; }
  const tBody = performance.now() - t0;
  const cellBtn = hud.querySelector('.b-cell .s-pills button[aria-pressed="true"]') || null;
  const pillBtns = [...hud.querySelectorAll(".b-read .r-pills button")];
  const pressedPill = pillBtns.find((x) => x.getAttribute("aria-pressed") === "true") || null;
  const pools = window.__placeCard.pools || {};
  const g = wb.querySelector(":scope > .g");
  const frame = { cell: cellBtn ? cellBtn.textContent : null, pills: pillBtns.map((x) => x.dataset.pointer || x.textContent), pressed: pressedPill ? (pressedPill.dataset.pointer || pressedPill.textContent) : null,
    empty: band() && !pillBtns.length ? (band().querySelector("p:not(.r-label)") || {}).textContent || "" : null,
    unoffered: (hud.querySelector(".line-unoffered") || {}).textContent || null, kindsHeld: (hud.querySelector(".kinds-switch") || {}).textContent || null,
    now: (hud.querySelector(":scope > .r-now .v") || {}).textContent || "", line: g ? [...g.childNodes].filter((x) => !(x.classList && x.classList.contains("g-lic"))).map((x) => x.textContent).join("") : null,
    pools: Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, { at: v.at, gave: v.gave, colloc: v.colloc || [], why: v.why }])) };
  const hereOf = () => { const c0 = card(); const h = c0 ? [...c0.querySelectorAll("h3")].find((x) => x.textContent === "At this word") : null; return h ? h.nextElementSibling : null; };
  spins = 0; while (hereOf() && hereOf().dataset.ready !== "1" && spins < 5000) { await tick(); spins += 1; }
  const boxes = () => (card() ? [...card().querySelectorAll("h3")].filter((h) => h.textContent === "In the dictionaries").map((h) => h.parentElement) : []);
  spins = 0; while (boxes().some((b) => b.dataset.ready !== "1" && !/could not be fetched/.test(b.textContent)) && spins < 5000) { await tick(); spins += 1; }
  const tAll = performance.now() - t0;
  const c = card();
  const h3 = c ? [...c.querySelectorAll("h3")].find((h) => h.textContent === "At this word") : null; const here = h3 ? h3.nextElementSibling : null;
  const UNA = "Brown-Driver-Briggs, unabridged";
  const rows = here ? [...here.querySelectorAll(".row")].map((r) => { const name = r.querySelector(".src b").textContent;
    if (name !== UNA) return [name, [...r.querySelectorAll(".line .he, .line .rd, .line .it")].map((x) => x.textContent)];
    const strings = [...r.querySelectorAll(":scope > .line")].flatMap((l) => { const k = [...l.children]; return [k[0].textContent, k[1].textContent.replace(/ $/, ""), ...[...l.querySelectorAll(".rd, .it")].map((x) => x.textContent), ...k.filter((x) => x.classList.contains("gap") && /^ [†‡]$/.test(x.textContent)).map((x) => x.textContent.trim())]; });
    return [name, strings, [...r.querySelectorAll(":scope > .sub")].map((x) => x.textContent)]; }) : null;
  const pair = here ? [...here.querySelectorAll(":scope > .form-h")].filter((x) => / under both forms: /.test(x.textContent)).map((x) => x.textContent) : null;
  const wn = hud.querySelector(":scope > .head .wn");
  const out = { place: hud.classList.contains("place") && !!c, open: window.__placeCard.open ? { label: window.__placeCard.open.label, i: window.__placeCard.open.i } : null,
    pair, head: wn ? wn.textContent : null, word: (hud.querySelector(":scope > .head b") || {}).textContent || null, rows, tBody, tAll, tags: boxes().length, ready: boxes().filter((b) => b.dataset.ready === "1").length,
    entries: c ? c.querySelectorAll("button.open").length : 0, active: wb.classList.contains("active"), frame,
    uhal: (() => { const rows = c ? [...c.querySelectorAll(".row")].filter((r) => (r.querySelector(".src b") || {}).textContent === "unfoldingWord Hebrew and Aramaic Lexicon") : []; return { drawn: rows.filter((r) => r.querySelector("button.open")).length, w: rows.filter((r) => /another word of the number than the one STEP's letter names/.test(r.textContent)).length, none: rows.filter((r) => /has no entry under this number/.test(r.textContent)).length }; })() };
  if (openShut && c) {
    const box = () => { const r = hud.getBoundingClientRect(); const b = c.getBoundingClientRect(); return [r.left, r.top, r.width, r.height, b.top, b.height, window.scrollX, window.scrollY].map((x) => Math.round(x * 10) / 10).join(","); };
    // the sheet's opening (its pop: it grows from 93 in 100 for its first moments) is let finish before it is measured
    const popping = hud.getAnimations ? hud.getAnimations().length : 0; out.popping = popping;
    if (hud.getAnimations) await Promise.all(hud.getAnimations().map((a) => a.finished.catch(() => null)));
    // and the frame above the listing let settle (its record, fetched for the pill standing, lands after the card opens):
    // the box measured until two readings a sixth of a second apart agree, three seconds at most
    { let last = box(); for (let k = 0; k < 20; k += 1) { await new Promise((r) => setTimeout(r, 150)); const now = box(); if (now === last) break; last = now; } }
    const seen = [box()]; const btns = [...c.querySelectorAll("button.open")];
    for (const b of btns) { b.click(); let k = 0; while (!(b.nextElementSibling.dataset.ready === "1" || /could not/.test(b.nextElementSibling.textContent)) && k < 2000) { await tick(); k += 1; } seen.push(box()); }
    const openedAll = btns.every((b) => b.nextElementSibling.dataset.ready === "1" && !b.nextElementSibling.hidden);
    for (const b of btns) { b.click(); seen.push(box()); }
    const shutAll = btns.every((b) => b.nextElementSibling.hidden);
    out.openShut = { buttons: btns.length, moved: new Set(seen).size !== 1, openedAll, shutAll, first: seen[0], moves: [...new Set(seen)].slice(0, 3) };
  }
  return out;
}`;
globalThis.fetch = globalThis.fetch || null;
const realFetch = globalThis.fetch;
const { placeCardOf } = await import(join(R, "tools", "place-card-v1.mjs"));
const diskCard = placeCardOf({ data: "d/", fault: () => {} });
const fetchDisk = async (url) => { const p = join(DIR, String(url).slice(2)); try { return new Response(readFileSync(p), { status: 200 }); } catch { return new Response("no", { status: 404 }); } };
const pillKey = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase();
const pw = await loadPlaywright();
const tree = await serveTree(SITE);
const browser = await pw.chromium.launch(launchOptions());
const uhalReport = { cards_drawing_a_row: 0, cards_saying_w: 0, cards_saying_no_entry: 0, rows_drawn: 0, rows_w: 0, rows_no_entry: 0 };
const pillsReport = { pills_shown: 0, pills_held_by_a_switch: 0, held_examples: [], cells: 0, pills_as_the_files: 0, differ: [], shown_as_given: 0, shown_differ: [], empty_cells: 0, empty_said: {}, no_pill_pressed_at_rest: [], now_is_the_line: 0, now_differs: [] };
const report = { chapters: [], words: 0, cards_opened: 0, place_cards: 0, here_as_the_data: 0, here_differs: [], head_as_the_word: 0, head_differs: [], not_opened: [], dictionaries_not_drawn: [], tag_boxes: 0, entry_buttons: 0, body_ms: [], all_ms: [], real_taps: 0, real_taps_opened: 0, open_shut: { cards: 0, buttons: 0, moved: 0, not_all_opened: 0, not_all_shut: 0, moves: [] }, page_errors: [], faults: [] };
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message))); page.on("console", (m) => { if (m.type() === "error" && !/\/favicon\.ico$/.test((m.location() || {}).url || "")) errors.push(`${m.text()} @ ${(m.location() || {}).url || ""}`); });
  let nowAt = "the page opening";
  page.on("requestfailed", (r) => errors.push(`request failed: ${r.url().replace(tree.base, "")} (${(r.failure() || {}).errorText}) during ${nowAt}`));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url().replace(tree.base, "")}`); });
  let open = null;
  for (const [book, ch] of chapters) {
    const doc = JSON.parse(gunzipSync(readFileSync(join(DIR, book, `${ch}.json.gz`))).toString("utf8"));
    const words = []; for (const v of doc.verses) { let n = 0; for (const e of v.e) if (e.m === undefined) { n += 1; words.push([v.l, e.i, n, e]); } }
    if (open !== book) {
      await page.goto(`${tree.base}/reader/zone.html?b=${book}`, { waitUntil: "networkidle" });
      await page.waitForSelector("section.seg", { timeout: 60000 });
      await page.waitForFunction(() => window.__placeCard && typeof window.__materialise === "function", null, { timeout: 60000 });
      await page.waitForTimeout(600);
      open = book;
    }
    // the chapter's sections built by the page's own function
    const built = await page.evaluate((prefix) => { const all = [...document.querySelectorAll("section.seg")]; const idx = all.map((s, i) => (s.__sec && String(s.__sec.label).startsWith(prefix) ? i : -1)).filter((i) => i >= 0); if (!idx.length) return 0; window.__materialise(idx[0], idx[idx.length - 1] + 1); return idx.length; }, `${ch}:`);
    await page.waitForTimeout(300);
    const one = { book, chapter: ch, words: words.length, sections: built, opened: 0, as_data: 0 };
    // a few real taps first, as a finger does it
    for (const k of [0, Math.floor(words.length / 2), words.length - 1].filter((x, j, a) => x >= 0 && a.indexOf(x) === j)) {
      const [label, ei] = words[k]; nowAt = `a real tap at ${book} ${label} entry ${ei}`;
      const handle = await page.evaluateHandle(([label, ei]) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label); const w = sec.__sec.words[ei]; const wb = [...sec.querySelectorAll(".wb")].find((x) => x.__word === w); return wb.querySelector(".w span") || wb.querySelector(".w") || wb; }, [label, ei]);
      await page.keyboard.press("Escape");
      // the word brought to the middle of the window, clear of the bar fixed at its foot, and tapped as a finger does
      await handle.evaluate((x) => x.scrollIntoView({ block: "center" })); await page.waitForTimeout(150);
      await handle.tap(); report.real_taps += 1;
      await page.waitForTimeout(250);
      if (await page.evaluate(([label, i]) => !!(window.__placeCard.open && window.__placeCard.open.label === label && window.__placeCard.open.i === i && !document.getElementById("hud").hidden), [label, ei])) report.real_taps_opened += 1;
      await page.keyboard.press("Escape");
    }
    for (let k = 0; k < words.length; k += 1) {
      const [label, ei, n, e] = words[k];
      const openShut = k < 3 || k % 20 === 0; nowAt = `the press at ${book} ${label} entry ${ei}${openShut ? ", its entries opened and shut" : ""}`;
      const got = await page.evaluate(`(${PRESS})(${JSON.stringify([label, ei, n, openShut])})`);
      report.words += 1; const at = `${book} ${label} entry ${ei} (word ${n})`;
      if (got.fault || !got.place || !got.open || got.open.label !== label || got.open.i !== ei) { report.not_opened.push(`${at}: ${got.fault || JSON.stringify(got.open)}`); continue; }
      report.cards_opened += 1; report.place_cards += 1; one.opened += 1; report.body_ms.push(got.tBody); report.all_ms.push(got.tAll); report.tag_boxes += got.tags; report.entry_buttons += got.entries;
      if (got.ready !== got.tags) report.dictionaries_not_drawn.push(at);
      if (got.head && got.head.startsWith(`${label}:${n} `)) report.head_as_the_word += 1; else report.head_differs.push(`${at}: ${got.head}`);
      const want = expected(e); const pairW = pairWant(e);
      if (JSON.stringify(got.rows) === JSON.stringify(want) && JSON.stringify(got.pair) === JSON.stringify(pairW)) { report.here_as_the_data += 1; one.as_data += 1; } else if (report.here_differs.length < 20) report.here_differs.push({ at, got: got.rows, want, pair: got.pair, pairWant: pairW }); else report.here_differs.push(at);
      if (got.uhal) { const u = got.uhal; uhalReport.rows_drawn += u.drawn; uhalReport.rows_w += u.w; uhalReport.rows_no_entry += u.none; if (u.drawn) uhalReport.cards_drawing_a_row += 1; if (u.w) uhalReport.cards_saying_w += 1; if (u.none) uhalReport.cards_saying_no_entry += 1; }
      // the pills: the open cell's offered pills are what the place answers gave it, and what they gave is what the
      // files give (the block reading the files from this disk)
      if (got.frame) {
        const F = got.frame; const pool = F.cell && F.pools[F.cell] ? F.pools[F.cell] : Object.values(F.pools)[0] || null;
        if (pool && pool.at) {
          pillsReport.cells += 1;
          globalThis.fetch = fetchDisk;
          // a block of several words of a run: each word whole, a source's readings of them all joined (placePool)
          const want = pool.at.ns ? await (async () => { const each = []; for (const [j, n] of pool.at.ns.entries()) each.push(await diskCard.pillsAt(doc, pool.at.ref, n, pool.at.reading, 0, pool.at.ts[j] - 1, pool.at.ts[j])); const pills = []; for (const src of ["step", "macula"]) { const rs = each.map((g) => ((g.pills || []).find((x) => x.src === src) || {}).text); if (rs.every(Boolean)) pills.push({ text: rs.join("/"), src }); } pillsReport.run_blocks = (pillsReport.run_blocks || 0) + 1; return { pills }; })()
            : await diskCard.pillsAt(doc, pool.at.ref, pool.at.n, pool.at.reading, pool.at.a, pool.at.b, pool.at.t);
          globalThis.fetch = realFetch;
          if (JSON.stringify(want.pills.map((x) => [x.text, x.src])) === JSON.stringify(pool.gave)) pillsReport.pills_as_the_files += 1; else if (pillsReport.differ.length < 20) pillsReport.differ.push({ at, cell: F.cell, gave: pool.gave.slice(0, 6), files: want.pills.slice(0, 6).map((x) => [x.text, x.src]) }); else pillsReport.differ.push(at);
          const shown = [...new Set(F.pills.map((x) => String(x).toLowerCase()))], given = new Set(pool.gave.map((x) => pillKey(x[0])));
          const stray = shown.filter((x) => !given.has(x)); const heldAll = [...given].filter((x) => !shown.includes(x));
          // what rests shut by the kinds record (UBS's collocation glosses given by no pill that stands) apart from what a switch holds
          const stands = new Set(pool.gave.filter((x) => !(pool.colloc || []).includes(x[0])).map((x) => pillKey(x[0])));
          const kinds = heldAll.filter((x) => !stands.has(x)); const held = heldAll.filter((x) => stands.has(x));
          pillsReport.pills_resting_shut = (pillsReport.pills_resting_shut || 0) + kinds.length; if (kinds.length) pillsReport.cells_resting_some_shut = (pillsReport.cells_resting_some_shut || 0) + 1;
          if (kinds.length && F.kindsHeld) pillsReport.cells_saying_so = (pillsReport.cells_saying_so || 0) + 1;
          pillsReport.pills_shown += shown.length; pillsReport.pills_held_by_a_switch += held.length; if (held.length && pillsReport.held_examples.length < 12) pillsReport.held_examples.push(`${at} ${F.cell}: ${held.slice(0, 4).join(" | ")}`);
          if (!stray.length) pillsReport.shown_as_given += 1; else if (pillsReport.shown_differ.length < 20) pillsReport.shown_differ.push({ at, cell: F.cell, not_given: stray.slice(0, 8) }); else pillsReport.shown_differ.push(at);
        }
        if (F.empty !== null) { pillsReport.empty_cells += 1; pillsReport.empty_said[F.empty] = (pillsReport.empty_said[F.empty] || 0) + 1; }
        if (!F.pressed && F.empty === null && F.unoffered) (pillsReport.line_not_offered || (pillsReport.line_not_offered = [])).push(`${at}: ${F.unoffered}`);
        else if (!F.pressed && F.empty === null) pillsReport.no_pill_pressed_at_rest.push(`${at}: the line «${F.line}»`);
        if (F.pressed && F.pills.length && F.pills[0] !== F.pressed) (pillsReport.pressed_not_first || (pillsReport.pressed_not_first = [])).push(`${at}: pressed «${F.pressed}», first «${F.pills[0]}»`);
        if (F.line !== null && F.now.replace(/[\u200b\u00bf]/gu, "").replace(/^\s*\+\s*/u, "").trim().toLowerCase() === F.line.replace(/[\u200b\u00bf]/gu, "").replace(/^\s*\+\s*/u, "").trim().toLowerCase()) pillsReport.now_is_the_line += 1; else if (pillsReport.now_differs.length < 30) pillsReport.now_differs.push(`${at}: the card's line «${F.now}», under the word «${F.line}»`);
      }
      if (got.openShut) { const r = got.openShut; report.open_shut.cards += 1; report.open_shut.buttons += r.buttons; if (got.popping) report.open_shut.measured_after_the_opening_ended = (report.open_shut.measured_after_the_opening_ended || 0) + 1; if (r.moved) { report.open_shut.moved += 1; if (report.open_shut.moves.length < 10) report.open_shut.moves.push({ at, moves: r.moves }); } if (!r.openedAll) report.open_shut.not_all_opened += 1; if (!r.shutAll) report.open_shut.not_all_shut += 1; }
    }
    const faults = await page.evaluate(() => window.__placeCard.faults.splice(0)); for (const x of faults) report.faults.push(`${book} ${ch}: ${x}`);
    report.chapters.push(one); console.log(`${book} ${ch}: ${one.words} words, ${one.sections} sections, ${one.opened} place cards, ${one.as_data} as the data`);
  }
  await page.keyboard.press("Escape");
  report.page_errors = errors.filter((x) => !/favicon/.test(x));
} finally { await browser.close(); await tree.close(); }
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? Math.round(s[Math.floor(s.length / 2)] * 10) / 10 : null; };
const pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? Math.round(s[Math.min(s.length - 1, Math.floor(s.length * p))] * 10) / 10 : null; };
report.timing = { press_to_body_drawn_ms: { median: med(report.body_ms), p95: pct(report.body_ms, 0.95), max: pct(report.body_ms, 1) }, press_to_dictionaries_drawn_ms: { median: med(report.all_ms), p95: pct(report.all_ms, 0.95), max: pct(report.all_ms, 1) } };
delete report.body_ms; delete report.all_ms;
report.pills = pillsReport; report.uhal = uhalReport;
writeFileSync(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ chapters: report.chapters.length, words: report.words, cards_opened: report.cards_opened, here_as_the_data: report.here_as_the_data, here_differs: report.here_differs.length, head_as_the_word: report.head_as_the_word, head_differs: report.head_differs.length, not_opened: report.not_opened.length, dictionaries_not_drawn: report.dictionaries_not_drawn.length, tag_boxes: report.tag_boxes, entry_buttons: report.entry_buttons, real_taps: `${report.real_taps_opened}/${report.real_taps}`, open_shut: { ...report.open_shut, moves: report.open_shut.moves.length }, timing: report.timing, page_errors: report.page_errors.length, faults: report.faults.length }, null, 1));
