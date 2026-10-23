// THE CONCORDANCE PILL AND ITS TABLE (the owner, 2026-10-17: "simple toggle,
// cards unchanged, hud opens to a table hud"; "both should be openable";
// "it would just be he created places, not close"; "agree keep it" of the
// way back; 2026-10-18: "lets go live with the toggle", "make the pill say
// concordance", "see how many r pills i can find for bara? it should all be
// in the blue english dropdown"). Dictionary store v1.1 (Moses,
// FOR-ELIJAH-v79), baked by tools/bake-dictionary-store-v1.mjs.
//   D1  the pill stands beside the readers' pills, off by default and saying
//       nothing more (the owner, 2026-10-18: "we default off so that already
//       says that"); with it off a card is the card (its readings showing, no
//       table)
//   D2  with it on, a word's card keeps its head and opens to a table of one
//       row: the card's pressed pill, which is the store's reading at this
//       place from the source that reads it (TAHOT first), naming its source
//       and license, its places open; its pill opens a dropdown holding
//       every pill the card has, in the card's order, and the readings of
//       these letters at other places the card has no pill for; every count
//       is the number of places a source reads exactly those words
//   D3  the row's places stand open (the owner, 2026-10-18: "its already
//       expanded by way of that r pill being selected"): as many as the row
//       counts (fifty at a time), this place first and said, every other a
//       link to the page's own address for exactly the place it names; each
//       place's verse fills with the word marked once, and the other source's
//       reading at the place stands with its license
//   D4  a pick from the card's pills presses the card's pill and the line
//       reads it, and the row is it with its count and places; a pick of a
//       reading the card has no pill for is the row and leaves the line; this
//       place's reading picked again puts the line back
//   D5  the headers sort the dropdown: A–Z by the reading, "places" by the
//       count, each group on its own
//   D6  following a place in the same book and in another lands on exactly
//       that place with its card open; the page offers "Back to" the place
//       left, showing once the card is closed and clear of the place's own
//       way back; tapping it returns there and is spent; the pill is
//       remembered over a reload
//   D7  a reading the source divides ("in/ beginning") reads as the card
//       prints it, and the card's pressed pill is the table's, pressed
//   D8  the dropdown carries every band of the card (the chain, the
//       divisions, the blocks) and its notes; a block pressed there is
//       pressed on the card, and the dropdown holds exactly its pills
//   D9  under "look up by: the headword" the counts are the inked word's
//       letters; a named run's card stays the card
//   D10 a catalog that does not answer is said in the card's words, with its
//       "try again", never as a card with no reading
//   D11 a rail switch that redraws the card's pills is followed: a pick from
//       the dropdown is still a press on the card
// The words are found on the page, never named here (check-scope-derived S1).
// Usage: node tools/check-dictionary-toggle-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const URL = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch { /* fresh reader */ } });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(1200);
const words = () => p.evaluate(() => [...document.querySelectorAll(".he-text .wb:not(.mark)")].filter((x) => x.querySelector(".g:not(.bare)") && !x.__run).length);
const tap = (i) => p.evaluate((i) => { const wb = [...document.querySelectorAll(".he-text .wb:not(.mark)")].filter((x) => x.querySelector(".g:not(.bare)") && !x.__run)[i]; if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; }, i);
const waitFor = async (sel, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.$(sel)) return true; await p.waitForTimeout(100); } return false; };
const cnt = (x) => parseInt(String(x || "").trim(), 10);
const esc = async () => { await p.keyboard.press("Escape"); await p.waitForTimeout(250); };
// the table's final state: "table", or what the store said instead
const tabState = () => p.waitForFunction(() => {
  const tb = document.querySelector("#hud .dict-tab"); if (!tb) return null;
  if (tb.querySelector("table")) return "table";
  const n = tb.querySelector(".note"); return n && !/^asking/u.test(n.textContent) ? n.textContent : null;
}, null, { timeout: 20000 }).then((h) => h.jsonValue()).catch(() => "timeout");
// the card's readings arrive after its head; the table follows them
const settle = async () => { await waitFor('#hud > .rows .b-read .r-pills button[aria-pressed="true"]', 5000); await p.waitForTimeout(400); };
const rowOf = () => p.evaluate(() => {
  const trs = [...document.querySelectorAll("#hud .dict-tab tbody tr:not(.sub)")];
  const tr = trs[0]; if (!tr || !tr.cells[2]) return null;
  const b = tr.querySelector(".r-pills button"); const sub = tr.nextElementSibling; const nb = tr.cells[2].querySelector("button");
  return { n: trs.length, here: tr.classList.contains("here"), he: tr.cells[0].textContent, reading: b.textContent.trim(), raw: b.dataset.reading || "", menu: b.hasAttribute("aria-expanded"),
    pressed: b.getAttribute("aria-pressed"), offCard: b.classList.contains("off-card"), who: (tr.querySelector(".who") || {}).textContent || "", lic: !!tr.querySelector(".who .lic"), count: tr.cells[2].textContent,
    placesOpen: !!nb && !!sub && !sub.hidden && !sub.classList.contains("reads") && nb.getAttribute("aria-expanded") === "true", items: sub && !sub.hidden && !sub.classList.contains("reads") ? sub.querySelectorAll(".item").length : 0 };
});
// the card's own pills, read from the card itself
const cardPills = () => p.evaluate(() => [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => ({ t: x.textContent.trim(), pressed: x.getAttribute("aria-pressed") === "true" })));
const menuOf = () => p.evaluate(() => {
  const card = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => x.textContent.trim());
  const read = (sel, group) => [...document.querySelectorAll(`#hud .dict-tab tr.sub.reads ${sel} .opt`)].map((o) => {
    const b = o.querySelector(".r-pills button"); const r = b.textContent.trim();
    return { r, group, card: card.includes(r), mark: !b.classList.contains("off-card"), pressed: b.getAttribute("aria-pressed"), count: (o.querySelector(".n") || {}).textContent || "0" };
  });
  return { card: read(".opts:not(.rest)", "card"), rest: read(".opts.rest", "rest"),
    blocks: [...document.querySelectorAll("#hud .dict-tab tr.sub.reads .menu > .s-pills button")].map((x) => ({ t: x.textContent, pressed: x.getAttribute("aria-pressed") === "true" })),
    label: (document.querySelector("#hud .dict-tab tr.sub.reads .menu > p.card-label") || {}).textContent || "" };
});
const openMenu = () => p.evaluate(() => { const b = document.querySelector("#hud .dict-tab tbody tr.pick .r-pills button[aria-expanded=\"false\"]"); if (b) b.click(); return !!b; });
const pickMenu = (r, group) => p.evaluate(([r, group]) => { const b = [...document.querySelectorAll(`#hud .dict-tab tr.sub.reads ${group === "rest" ? ".opts.rest" : ".opts:not(.rest)"} .opt .r-pills button`)].find((x) => x.textContent.trim() === r); if (b) b.click(); return !!b; }, [r, group]);
const lineNow = () => p.evaluate(() => { const act = document.querySelector(".wb.active"); const g = act && act.querySelector(":scope > .g"); return g ? [...g.childNodes].filter((n) => !(n.nodeType === 1 && n.classList.contains("g-lic"))).map((n) => n.textContent).join("").trim() : ""; });
const headWn = () => p.evaluate(() => { const h = document.querySelector("#hud:not([hidden]) .head .wn"); return h ? h.textContent.trim().split(/\s/u)[0] : ""; });
// what the store holds for the open word, read the way the page reads it:
// the word's letters, its shard; the source that reads this place, and the
// number of places each reading's words stand at (joined as the card joins).
// With a block of the word pressed, the store under the block's own letters:
// a block's reading is counted where its letters stand as a word
// (check-block-in-table B3)
const storeHere = (keyIn = null) => p.evaluate(async (keyIn) => {
  const act = document.querySelector(".wb.active"); const sec = act && act.closest("section.seg");
  if (!act || !sec || !sec.__sec) return null;
  const n = [...sec.querySelectorAll(".he-text .wb:not(.mark)")].indexOf(act) + 1;
  const k = act.__word && act.__word.k;
  const key = keyIn || [...String(k || "").normalize("NFD")].filter((c) => { const x = c.codePointAt(0); return x >= 0x5d0 && x <= 0x5ea; }).join("");
  const book = new URLSearchParams(location.search).get("b") || (document.querySelector('meta[name="reader-book"]') || {}).content;
  const root = (document.querySelector('meta[name="reader-home"]') || {}).content || location.pathname.replace(/[^/]*$/u, "");
  const ix = await (await fetch(`${root}data/dictionary-store/index.json`, { cache: "no-cache" })).json();
  const hex = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)))[0].toString(16).padStart(2, "0");
  const res = await fetch(`${root}data/dictionary-store/shards/${hex}.bin?v=${ix.store_version}`);
  const text = await new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).text();
  const v = JSON.parse(text)[key];
  const join = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");
  const at = (src) => ((v && v.readings) || []).filter((g) => g.src === src && g.places.some((q) => q.book === book && q.ref === sec.__sec.label && q.w_page === n)).map((g) => g.reading);
  const counts = {};
  for (const g of (v && v.readings) || []) { const t = join(g.reading); counts[t] = counts[t] || new Set(); for (const q of g.places) counts[t].add(`${q.book}|${q.ref}|${q.w_page}`); }
  return { key, book, ref: sec.__sec.label, n, tahot: at("tahot"), macula: at("macula"), counts: Object.fromEntries(Object.entries(counts).map(([t, s]) => [t, s.size])) };
}, keyIn);
const lettersOf = (t) => [...String(t || "").normalize("NFD")].filter((c) => { const x = c.codePointAt(0); return x >= 0x5d0 && x <= 0x5ea; }).join("");

// D1: off by default, and a card is the card
const pill0 = await p.evaluate(() => { const x = document.getElementById("dictPill"); return x ? { on: x.classList.contains("on"), state: (document.getElementById("dictState") || {}).textContent, label: x.textContent.trim(), pressed: x.getAttribute("aria-pressed"), inRow: !!x.closest("#modeRow") } : null; });
await tap(0); const plain = await waitFor("#hud .r-pills button");
const off = await p.evaluate(() => { const hud = document.getElementById("hud"); const rows = hud.querySelector(":scope > .rows");
  return { dict: hud.classList.contains("dict"), tab: !!hud.querySelector(".dict-tab"), rows: rows ? getComputedStyle(rows).display : "none", vis: [...hud.querySelectorAll(":scope > .rows .r-pills button")].some((x) => x.offsetParent !== null) }; });
await esc();
check("D1  the concordance pill stands beside the readers' pills, off; with it off a card is the card, its readings showing and no table",
  !!pill0 && pill0.inRow && !pill0.on && pill0.state === "" && pill0.pressed === "false" && pill0.label === "concordance hud" && plain && !off.dict && !off.tab && off.rows !== "none" && off.vis, JSON.stringify({ ...pill0, ...off }));

// D2: on, a word's card opens to its one row; find a word whose reading here
// stands at two places or more, with a dropdown of more than one pill
await p.click("#dictPill"); await p.waitForTimeout(200);
let t = null, storeFail = null, seenRows = 0;
const n0 = await words();
for (let i = 0; i < Math.min(40, n0) && !t && !storeFail; i += 1) {
  if (!(await tap(i))) break;
  const st = await tabState();
  if (st !== "table") { if (/did not answer|timeout/u.test(st)) storeFail = `word ${i}: ${st}`; await esc(); continue; }
  await settle();
  const row = await rowOf();
  if (row) seenRows += 1;
  if (row && cnt(row.count) >= 2 && row.here) {
    const card = await p.evaluate(() => ({ head: !!document.querySelector("#hud > .head"), hidden: [...document.querySelectorAll("#hud > .rows, #hud > .r-now")].every((x) => getComputedStyle(x).display === "none") }));
    const cps = await cardPills();
    const store = await storeHere();
    await openMenu(); await p.waitForTimeout(250);
    const menu = await menuOf();
    const notes = await p.evaluate(() => ({ card: [...document.querySelectorAll("#hud > .rows .b-read > p:not(.r-label):not(.r-piece)")].map((x) => (x.firstChild || x).textContent), menu: [...document.querySelectorAll("#hud .dict-tab .menu > p.card-note")].map((x) => x.firstChild.textContent) }));
    if (menu.card.length + menu.rest.length > 1) t = { i, ...card, row, cps, cardPressed: (cps.find((x) => x.pressed) || {}).t || null, store, menu, notes };
    else await esc();
  } else await esc();
}
const want = t && t.store ? (t.store.tahot.length ? t.store.tahot : t.store.macula) : [];
const d2 = t ? Object.entries({
  head: t.head, hidden: t.hidden, oneRow: t.row.n === 1, here: t.row.here, he: !!t.row.he, pressed: t.row.pressed === "true", onCard: !t.row.offCard, isCards: t.row.reading === t.cardPressed,
  isStores: want.includes(t.row.raw), who: !!t.row.who && t.row.lic, open: t.row.placesOpen,
  everyPill: t.menu.card.length === t.cps.length && t.menu.card.every((m, j) => m.r === t.cps[j].t && m.mark && m.pressed === String(t.cps[j].pressed)),
  restOff: t.menu.rest.every((m) => !m.card && !m.mark),
  counts: [...t.menu.card, ...t.menu.rest].every((m) => cnt(m.count) === (t.store.counts[m.r] || 0)) && cnt(t.row.count) === (t.store.counts[t.row.reading] || 0),
  restAll: Object.keys(t.store.counts).every((x) => t.menu.card.some((m) => m.r === x) || t.menu.rest.some((m) => m.r === x)),
  notes: JSON.stringify(t.notes.card) === JSON.stringify(t.notes.menu),
}).filter(([, v]) => !v).map(([k]) => k) : null;
check("D2  with the pill on, a word's card keeps its head and opens to one row, the card's pressed pill (the store's reading here), its source and license, its places open; the dropdown holds every pill the card has, in its order, and the other places' readings, each counted exactly",
  !storeFail && !!t && d2.length === 0,
  storeFail ? `the store did not answer: ${storeFail}` : t ? `"${t.row.reading}" (${t.row.count}) · ${t.menu.card.length} of the card's ${t.cps.length} pills · ${t.menu.rest.length} from other places · store here ${JSON.stringify(want)}${d2.length ? " · not: " + d2.join(", ") : ""}` : `no such word among ${seenRows} tables`);

// D5: sort the dropdown (it is open)
const so = t ? await p.evaluate(() => {
  const read = (sel) => [...document.querySelectorAll(`#hud .dict-tab tr.sub.reads ${sel} .opt`)].map((o) => ({ r: o.querySelector(".r-pills button").textContent.trim(), n: parseInt((o.querySelector(".n") || {}).textContent || "0", 10) }));
  const btn = (id) => document.querySelector(`#hud .dict-tab th button[data-sort="${id}"]`);
  const az = (l) => l.every((x, k) => k === 0 || l[k - 1].r.localeCompare(x.r) <= 0);
  const ct = (l) => l.every((x, k) => k === 0 || l[k - 1].n >= x.n);
  btn("az").click(); const a1 = read(".opts:not(.rest)"), a2 = read(".opts.rest");
  btn("count").click(); const c1 = read(".opts:not(.rest)"), c2 = read(".opts.rest");
  btn("text").click();
  return { az: az(a1) && az(a2), ct: ct(c1) && ct(c2), n: a1.length + a2.length, pressed: btn("text").getAttribute("aria-pressed") };
}) : null;
check("D5  the headers sort the dropdown: A–Z by the reading, \"places\" by the count, each group on its own",
  !!so && so.az && so.ct && so.n > 1 && so.pressed === "true", JSON.stringify(so));

// D3: places, open with the row (the dropdown closed again first)
const pl = t ? await (async () => {
  await p.evaluate(() => { const m = document.querySelector("#hud .dict-tab tbody tr.pick .r-pills button[aria-expanded=\"true\"]"); if (m) m.click(); });
  await p.waitForTimeout(200);
  const got = await p.evaluate(() => {
    const tr = document.querySelector("#hud .dict-tab tbody tr.pick"); const sub = tr.nextElementSibling;
    const deployed = !!document.querySelector('meta[name="reader-book"]');
    const items = [...sub.querySelectorAll(".item")];
    const bad = [];
    const links = items.slice(1).map((x) => {
      const a = x.querySelector("a"); if (!a) { bad.push(`no link: ${x.textContent.slice(0, 40)}`); return null; }
      const m = a.textContent.match(/(\d+):(\d+):(\d+)/u); const h = a.getAttribute("href");
      const tail = `#${m[1]}:${m[2]}:${m[3]}`;
      const ok = deployed ? new RegExp(`^/[a-z0-9-]+/${m[1]}/(\\?dict=(on|off))?${tail}$`, "u").test(h) : h.startsWith(`${location.pathname}?b=`) && h.endsWith(tail);
      if (!ok) bad.push(`${a.textContent} -> ${h}`);
      return h;
    }).filter(Boolean);
    return { n: parseInt(tr.cells[2].textContent, 10), items: items.length, more: !!sub.querySelector("button.more"), first: (items[0] || {}).textContent || "", links, bad,
      beside: items.filter((x) => x.querySelector(".who .rd") && x.querySelector(".who .lic")).length };
  });
  const ex = [];
  for (let j = 0; j < Math.min(3, got.items); j += 1) {
    await p.evaluate((j) => { const e = document.querySelectorAll("#hud .dict-tab tr.sub .item .ex")[j]; if (e) e.scrollIntoView({ block: "nearest" }); }, j);
    await p.waitForTimeout(1500);
    ex.push(await p.evaluate((j) => { const e = document.querySelectorAll("#hud .dict-tab tr.sub .item .ex")[j]; return e ? e.querySelectorAll(".ex-he .hit").length : -1; }, j));
  }
  return { ...got, ex };
})() : null;
check("D3  the row's places stand open: as many as the row counts (fifty at a time), this place first and said, every other a link to exactly its place on the page's own address; each verse marks the word once, and the other source's reading stands with its license",
  !!pl && t.row.placesOpen && pl.items === Math.min(pl.n, 50) && pl.more === pl.n > 50 && /^here · /u.test(pl.first) && pl.links.length === pl.items - 1 && !pl.bad.length && pl.ex.every((x) => x === 1) && pl.beside >= 1,
  pl ? `${pl.items} of ${pl.n} · ${pl.links.length} links · verses ${JSON.stringify(pl.ex)} · ${pl.beside} with the other source${pl.bad.length ? " · " + pl.bad.slice(0, 3).join("; ") : ""}` : "");

// D4: picks from the card's pills and from the other places
const rd = t ? await (async () => {
  await openMenu(); await p.waitForTimeout(250);
  const menu = await menuOf();
  const out = { runs: [] };
  const onCard = menu.card.find((m) => m.pressed !== "true" && cnt(m.count) > 0) || menu.card.find((m) => m.pressed !== "true");
  for (const opt of [onCard, menu.rest[0]].filter(Boolean)) {
    if (!(await p.$("#hud .dict-tab tr.sub.reads"))) { await openMenu(); await p.waitForTimeout(250); }
    const before = await lineNow();
    await pickMenu(opt.r, opt.group); await p.waitForTimeout(1200);
    const row = await rowOf();
    const cps = await cardPills();
    out.runs.push({ opt, row, cardPressed: (cps.find((x) => x.t === opt.r) || {}).pressed || false, before, line: await lineNow() });
  }
  await openMenu(); await p.waitForTimeout(250);
  await pickMenu(t.row.reading, "card"); await p.waitForTimeout(1200);
  out.back = { row: await rowOf(), line: await lineNow() };
  return out;
})() : null;
const runOk = (x) => x.row.reading === x.opt.r && cnt(x.row.count) === cnt(x.opt.count) && x.row.n === 1
  && (cnt(x.opt.count) ? x.row.placesOpen && x.row.items === Math.min(cnt(x.opt.count), 50) : !x.row.placesOpen)
  && (x.opt.group === "card" ? x.cardPressed && x.row.pressed === "true" && !x.row.offCard && x.line.includes(x.opt.r) : x.row.offCard && x.line === x.before);
check("D4  a pick from the card's pills presses the card's pill and the line reads it; a pick of another place's reading is the row and leaves the line; this place's reading picked again puts the line back",
  !!rd && rd.runs.length >= 1 && rd.runs.every(runOk) && rd.back.row.reading === t.row.reading && rd.back.row.pressed === "true" && rd.back.line.includes(t.row.reading),
  rd ? `${rd.runs.map((x) => `"${x.opt.r}" (${x.opt.group}, ${x.opt.count}) ${runOk(x) ? "ok" : "BAD " + JSON.stringify(x)}`).join(" · ")} · back "${rd.back.row.reading}" line "${rd.back.line.slice(0, 40)}"` : "");

// D6: follow a place in this book, then one in another book; each time the
// way back shows once the card is closed, returns, and is spent; reload
let d6 = null;
// a link to a place in this book or another, paging the places until one shows
const linkTo = async (same) => {
  for (let k = 0; k < 40; k += 1) {
    const got = await p.evaluate((same) => {
      const here = new URLSearchParams(location.search).get("b") || (document.querySelector('meta[name="reader-book"]') || {}).content;
      const a = [...document.querySelectorAll("#hud .dict-tab tbody tr.pick + tr.sub a")].find((x) => { const h = x.getAttribute("href"); const bk = (h.match(/[?&]b=([a-z0-9-]+)/u) || h.match(/^\/([a-z0-9-]+)\//u) || [])[1]; return same ? bk === here : bk && bk !== here; });
      if (a) return { href: a.getAttribute("href"), place: a.getAttribute("href").match(/#(\d+:\d+:\d+)$/u)[1], label: a.textContent };
      const more = document.querySelector("#hud .dict-tab tbody tr.pick + tr.sub button.more");
      if (more) { more.click(); return "more"; }
      return null;
    }, same);
    if (got !== "more") return got;
    await p.waitForTimeout(150);
  }
  return null;
};
const hop = async (lk, load) => {
  await p.evaluate((h) => [...document.querySelectorAll("#hud .dict-tab tbody tr.pick + tr.sub a")].find((x) => x.getAttribute("href") === h).click(), lk.href);
  if (load) await p.waitForLoadState("networkidle");
  await p.waitForTimeout(load ? 3000 : 2500);
  const landed = await headWn();
  const back = await p.evaluate(() => (document.getElementById("dictBack") || {}).textContent || "");
  await esc();
  const vis = await p.evaluate(() => { const x = document.getElementById("dictBack"); const r = x && x.getBoundingClientRect(); const pb = document.getElementById("placeBack"); const q = pb && !pb.hidden ? pb.getBoundingClientRect() : null;
    return !!x && !x.hidden && r.width > 0 && r.height > 0 && !(q && r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom); });
  await p.evaluate(() => { const x = document.getElementById("dictBack"); if (x) x.click(); });
  if (load) await p.waitForLoadState("networkidle");
  await p.waitForTimeout(load ? 3000 : 2500);
  const returned = await headWn();
  const spent = await p.evaluate(() => !document.getElementById("dictBack") && !localStorage.getItem("fh.dict.back"));
  return { lk, landed, back, vis, returned, spent };
};
if (t) {
  await esc();
  const reopen = async () => { if (!(await p.$("#hud:not([hidden]) .dict-tab"))) { await tap(t.i); await tabState(); } await settle(); };
  await reopen();
  const from = await headWn();
  const hereLabel = await p.evaluate(() => { const x = document.querySelector("#hud .dict-tab tbody tr.pick + tr.sub .item"); return x ? x.firstChild.textContent.replace(/^here · /u, "") : ""; });
  d6 = { from, hereLabel };
  const same = await linkTo(true);
  if (same) d6.same = await hop(same, false);
  await reopen();
  const other = await linkTo(false);
  if (other) d6.other = await hop(other, true);
  await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(2000);
  d6.kept = await p.evaluate(() => ({ on: document.getElementById("dictPill").classList.contains("on"), ls: localStorage.getItem("fh.dict") }));
}
// a place inside a run opens the run's card, whose head names the run's words
const landedAt = (place, wn) => { const [c, v, w] = place.split(":").map(Number); const m = String(wn).match(/^(\d+):(\d+):(\d+)(?:–(\d+))?$/u); return !!m && +m[1] === c && +m[2] === v && +m[3] <= w && w <= +(m[4] || m[3]); };
const hopOk = (h) => !h || (landedAt(h.lk.place, h.landed) && h.back === `Back to ${d6.hereLabel}` && h.vis && h.returned === d6.from && h.spent);
const hopSay = (h) => (h ? `${h.lk.label} landed ${h.landed} · "${h.back}" shows ${h.vis} · back at ${h.returned} (from ${d6.from}) · spent ${h.spent}` : "no link");
check("D6  following a place in this book and in another (each where the word has one) lands on exactly it with its card open; \"Back to\" the place left shows once the card is closed, clear of the place's own way back, returns there and is spent; the pill is remembered over a reload",
  !!d6 && (!!d6.same || !!d6.other) && hopOk(d6.same) && hopOk(d6.other) && d6.kept.on && d6.kept.ls === "on",
  d6 ? `same book: ${hopSay(d6.same)} | other book: ${hopSay(d6.other)} | pill kept ${d6.kept.on}/${d6.kept.ls}` : "no table");

// D7 and D8 (pieces and chains): a divided reading; a block of a word in
// pieces pressed in the dropdown; a word of a maqaf chain
await p.goto(URL, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
let d7 = null, d8 = null, chain = null;
const cardState = () => p.evaluate(() => ({
  pills: [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => x.textContent.trim()),
  label: (document.querySelector("#hud > .rows .b-read .r-label") || {}).textContent || "",
  notes: [...document.querySelectorAll("#hud > .rows .b-read > p:not(.r-label):not(.r-piece)")].map((x) => (x.firstChild || x).textContent),
  bands: [...document.querySelectorAll("#hud > .rows > .band:not(.b-read)")].map((b) => [...b.querySelectorAll(".s-pills button")].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`)).filter((r) => r.length),
  bandCls: [...document.querySelectorAll("#hud > .rows > .band:not(.b-read)")].filter((b) => b.querySelector(".s-pills button")).map((b) => [...b.classList].find((c) => c !== "band")),
  chain: !!document.querySelector("#hud > .rows > .band.b-chain .s-pills button") }));
const menuState = () => p.evaluate(() => ({
  bands: [...document.querySelectorAll("#hud .dict-tab .menu > .s-pills")].map((r) => [...r.children].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`)),
  notes: [...document.querySelectorAll("#hud .dict-tab .menu > p.card-note")].map((x) => x.firstChild.textContent) }));
const mirrors = (c, m, mb) => JSON.stringify(c.bands) === JSON.stringify(mb.bands) && JSON.stringify(c.notes) === JSON.stringify(mb.notes)
  && m.card.length === c.pills.length && m.card.every((x, j) => x.r === c.pills[j]) && (c.pills.length ? m.label === c.label : true);
const n1 = await words();
for (let i = 0; i < Math.min(60, n1) && !(d7 && d8); i += 1) {
  if (!(await tap(i))) break;
  if ((await tabState()) !== "table") { await esc(); continue; }
  await settle();
  const row = await rowOf();
  if (!d7 && row && row.here && row.raw.includes("/")) { const cps = await cardPills(); d7 = { row, cardPressed: (cps.find((x) => x.pressed) || {}).t || null }; }
  if (!d8) {
    await openMenu(); await p.waitForTimeout(250);
    const c0 = await cardState();
    // the blocks band; press each unpressed block in turn until the card
    // answers one with pills
    const cellRow = c0.bandCls.indexOf("b-cell");
    const last = cellRow >= 0 ? c0.bands[cellRow] : [];
    for (let j = 0; j < last.length && !d8; j += 1) {
      if (last[j].endsWith("*")) continue;
      await p.evaluate(([r, j]) => { const row = document.querySelectorAll("#hud .dict-tab .menu > .s-pills")[r]; const x = row && row.children[j]; if (x) x.click(); }, [cellRow, j]);
      await waitFor("#hud > .rows .b-read .r-pills button", 8000); await p.waitForTimeout(900);
      const c1 = await cardState();
      if (!c1.pills.length) continue;
      const m1 = await menuOf(); const mb = await menuState(); const store = await storeHere(lettersOf(last[j]));
      d8 = { target: last[j], c1, m1, mb, mirror: mirrors(c1, m1, mb), pressed: (c1.bands[c1.bandCls.indexOf("b-cell")] || []).includes(`${last[j]}*`),
        counts: [...m1.card, ...m1.rest].every((m) => cnt(m.count) === (store.counts[m.r] || 0)), open: !!(await p.$("#hud .dict-tab tr.sub.reads")) };
    }
  }
  await esc();
}
// a word of a maqaf chain: its card carries the chain's bands
for (let i = 0; i < Math.min(80, n1) && !chain; i += 1) {
  if (!(await tap(i))) break;
  if ((await tabState()) !== "table") { await esc(); continue; }
  await settle();
  const c = await cardState();
  if (c.chain) { await openMenu(); await p.waitForTimeout(250); const m = await menuOf(); const mb = await menuState(); chain = { bands: c.bands.length, mirror: mirrors(c, m, mb) }; }
  await esc();
}
check("D7  a reading the source divides reads as the card prints it, and the card's pressed pill is the table's, pressed",
  !!d7 && d7.row.reading === d7.cardPressed && d7.row.pressed === "true" && !d7.row.offCard && !d7.row.reading.includes("/"),
  d7 ? `"${d7.row.raw}" reads "${d7.row.reading}" · card "${d7.cardPressed}"` : "no divided reading here among the words tried");
check("D8  the dropdown carries every band of the card (its chain, divisions and blocks) and its notes; a block pressed there is pressed on the card, and the dropdown then holds exactly that block's pills, each counted exactly",
  !!d8 && d8.mirror && d8.pressed && d8.counts && d8.open && (!chain || chain.mirror),
  `${d8 ? `block ${d8.target}: ${d8.c1.pills.length} pills · mirror ${d8.mirror} · pressed on the card ${d8.pressed} · counts ${d8.counts} · dropdown open ${d8.open}` : "no block of a word in pieces answered with pills"} · ${chain ? `chain word: ${chain.bands} bands, mirror ${chain.mirror}` : "no chain word among the words tried"}`);

// D9: the headword lookup reads the word as inked; a named run's card stays
// the card
const runWb = () => p.evaluate(() => { const wb = [...document.querySelectorAll(".he-text .wb:not(.mark)")].find((x) => x.__run && x.querySelector(".g:not(.bare)")); if (!wb) return null; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; });
let run = await runWb();
const nSec = await p.evaluate(() => document.querySelectorAll("section.seg").length);
for (let j = 0; j < Math.min(120, nSec) && !run; j += 1) {
  await p.evaluate((j) => { const s2 = document.querySelectorAll("section.seg")[j]; if (s2) s2.scrollIntoView({ block: "start" }); }, j);
  await p.waitForTimeout(120);
  run = await runWb();
}
let runCard = null;
if (run) { await p.waitForTimeout(1500); runCard = await p.evaluate(() => { const hud = document.getElementById("hud"); return { open: !hud.hidden, dict: hud.classList.contains("dict"), tab: !!hud.querySelector(".dict-tab") }; }); await esc(); }
let hw = null;
await p.evaluate(() => localStorage.setItem("fh.lookup", "headword"));
await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(1500);
const letters = (s) => [...String(s || "").normalize("NFD")].filter((c) => { const x = c.codePointAt(0); return x >= 0x5d0 && x <= 0x5ea; }).join("");
for (let i = 0; i < Math.min(60, n1) && !hw; i += 1) {
  if (!(await tap(i))) break;
  if ((await tabState()) !== "table") { await esc(); continue; }
  await settle();
  const note = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .head p.kq-role")].find((y) => /^looked up by its headword/u.test(y.textContent)); return x ? x.textContent : null; });
  const m = note && note.match(/^looked up by its headword (\S+) . the form as written is keyed (\S+)$/u);
  if (m && letters(m[1]) !== letters(m[2])) {
    const row = await rowOf(); const cps = await cardPills(); const store = await storeHere();
    await openMenu(); await p.waitForTimeout(250);
    const menu = await menuOf();
    hw = { head: m[1], ink: m[2], storeKey: store.key, row, cardPressed: (cps.find((x) => x.pressed) || {}).t || null,
      counts: [...menu.card, ...menu.rest].every((x) => cnt(x.count) === (store.counts[x.r] || 0)) && menu.card.length === cps.length };
  }
  await esc();
}
await p.evaluate(() => localStorage.removeItem("fh.lookup"));
check("D9  under \"look up by: the headword\" the row is the card's pressed pill and every count is the word's inked letters', not the headword's; a named run's card stays the card",
  !!hw && hw.storeKey === letters(hw.ink) && hw.row.reading === hw.cardPressed && hw.counts && (!run || (runCard && runCard.open && !runCard.dict && !runCard.tab)),
  `${hw ? `headword ${hw.head}, inked ${hw.ink}: counts by ${hw.storeKey} ${hw.counts} · row "${hw.row.reading}" · card "${hw.cardPressed}"` : "no word looked up by a headword of other letters"} · ${run ? `run card ${JSON.stringify(runCard)}` : "no named run on this page"}`);

// D10: the card's catalog does not answer: the table says so in the card's
// words, its "try again" presses the card's own, and the readings arrive
await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(1500);
let d10 = null;
await p.route("**/data/route-store/shards/**", (r) => r.abort());
// a word whose card asks the catalog (the D2 word did)
if (t && await tap(t.i)) {
  await tabState(); await p.waitForTimeout(3500);
  const down = await p.evaluate(() => ({
    note: (document.querySelector("#hud .dict-tab tr.pick.none td.note") || {}).textContent || "",
    menuNotes: [...document.querySelectorAll("#hud .dict-tab .menu > p.card-note")].map((x) => x.firstChild.textContent),
    cardNotes: [...document.querySelectorAll("#hud > .rows .b-read > p:not(.r-label):not(.r-piece)")].map((x) => (x.firstChild || x).textContent),
    again: !!document.querySelector("#hud .dict-tab .menu > p.card-note button") }));
  await p.unroute("**/data/route-store/shards/**");
  await p.evaluate(() => { const x = document.querySelector("#hud .dict-tab .menu > p.card-note button"); if (x) x.click(); });
  await waitFor('#hud > .rows .b-read .r-pills button[aria-pressed="true"]', 10000); await p.waitForTimeout(800);
  d10 = { down, after: await rowOf(), cps: await cardPills() };
}
await p.unroute("**/data/route-store/shards/**").catch(() => {});
check("D10 when the catalog does not answer, the table does not claim the card has no reading: it carries the card's own notes and its \"try again\", which brings the readings",
  !!d10 && !!d10.down.note && !/^the card has no reading/u.test(d10.down.note) && d10.down.again && JSON.stringify(d10.down.menuNotes) === JSON.stringify(d10.down.cardNotes) && !!d10.after && d10.after.pressed === "true" && d10.after.reading === ((d10.cps.find((x) => x.pressed) || {}).t),
  d10 ? `note "${d10.down.note}" · card says "${(d10.down.cardNotes[0] || "").slice(0, 60)}" · try again mirrored ${d10.down.again} · then "${d10.after ? d10.after.reading : ""}"` : "no word to open");

// D11: a rail switch redraws the card's pills in another order: the
// dropdown follows, and a pick from it is still a press on the card
await esc();
let d11 = null;
if (t) {
  await tap(t.i); await tabState(); await settle();
  await openMenu(); await p.waitForTimeout(250);
  const switched = await p.evaluate(() => { const x = [...document.querySelectorAll("#defRow button")].find((y) => y.getAttribute("aria-pressed") !== "true" && !y.disabled); if (!x) return null; x.click(); return x.textContent; });
  await p.waitForTimeout(1500);
  if (switched) {
    const c = await cardState(); const m = await menuOf();
    const order = m.card.length === c.pills.length && m.card.every((x, j) => x.r === c.pills[j]);
    const pick = m.card.find((x) => x.pressed !== "true");
    await pickMenu(pick.r, "card"); await p.waitForTimeout(1200);
    const row = await rowOf(); const cps = await cardPills();
    d11 = { switched, order, pick: pick.r, row, cardPressed: (cps.find((x) => x.pressed) || {}).t || null, line: await lineNow() };
  }
}
check("D11 a rail switch that redraws the card's pills is followed by the dropdown, and a pick from it is still a press on the card the line reads",
  !!d11 && d11.order && d11.cardPressed === d11.pick && d11.row.reading === d11.pick && d11.line.includes(d11.pick),
  d11 ? `switch "${d11.switched}" · order follows ${d11.order} · picked "${d11.pick}" · card "${d11.cardPressed}" · line "${d11.line.slice(0, 40)}"` : "no rail switch to press");
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
