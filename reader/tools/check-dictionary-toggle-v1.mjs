// THE CONCORDANCE PILL AND ITS TABLE (the owner, 2026-10-17: "simple toggle,
// cards unchanged, hud opens to a table hud"; "both should be openable";
// "it would just be he created places, not close"; "agree keep it" of the
// way back; 2026-10-18: "lets go live with the toggle", "make the pill say
// concordance"). Dictionary store v1.1 (Moses, FOR-ELIJAH-v79), baked by
// tools/bake-dictionary-store-v1.mjs.
//   D1  the pill stands beside the readers' pills, off; with it off a card is
//       the card (its readings showing, no table)
//   D2  with it on, a word's card keeps its head and opens to a table of one
//       row: the reading the line stands on, the card's pressed pill, which is
//       the store's reading at this place from the source that reads it
//       (TAHOT first), naming its source and licence; its pill opens the
//       other readings, each counted (the owner, 2026-10-18: "you only need
//       the 1 r pill showing, the rest would be drop downs from that")
//   D3  the row's places stand open (the owner, 2026-10-18: "its already
//       expanded by way of that r pill being selected"): as many as the row
//       counts (fifty at a time), this place first and said, every other a
//       link to the page's own address for exactly the place it names; each
//       place's verse fills with the word marked once, and the other source's
//       reading at the place stands with its licence
//   D4  each reading is the card's own R pill (the owner, 2026-10-18: "this
//       can just be the R pills we already have"): the table marks a reading
//       as the card's exactly when the card has that pill; a pick becomes the
//       row with its own count and its places open; where the card has the
//       pill it is pressed and the line reads it, where it has none the line
//       stays; picking this place's reading again puts the line back
//   D5  the headers sort the other readings: A–Z by the reading, "places" by
//       the count; on a word with no other readings a header leaves the
//       places open
//   D6  following a place in the same book and in another lands on exactly
//       that place with its card open; the page offers "Back to" the place
//       left, showing once the card is closed and clear of the place's own
//       way back; tapping it returns there and is spent; the pill is
//       remembered over a reload
//   D7  a reading the source divides ("in/ beginning") reads as the card
//       prints it, and the card's pressed pill is the table's
//   D8  a card that is not one word's stays the card with the pill on: a
//       named run's card; and under "look up by: the headword" the table
//       still reads the word as inked
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
// the table's final state: "table", a note the page says when no source reads
// the letters, or the store's failure (which fails the check)
const tabState = () => p.waitForFunction(() => {
  const tb = document.querySelector("#hud .dict-tab"); if (!tb) return null;
  if (tb.querySelector("table")) return "table";
  const n = tb.querySelector(".note"); return n && !/^asking/u.test(n.textContent) ? n.textContent : null;
}, null, { timeout: 15000 }).then((h) => h.jsonValue()).catch(() => "timeout");
const NO_ROW = /^no per-place source gives a reading/u;
const rowOf = () => p.evaluate(() => {
  const trs = [...document.querySelectorAll("#hud .dict-tab tbody tr:not(.sub)")];
  const tr = trs[0]; if (!tr || !tr.cells[2]) return null;
  const b = tr.querySelector(".r-pills button"); const sub = tr.nextElementSibling;
  return { n: trs.length, here: tr.classList.contains("here"), he: tr.cells[0].textContent, reading: b.textContent.trim(), raw: b.dataset.reading || "", menu: b.hasAttribute("aria-expanded"),
    pressed: b.getAttribute("aria-pressed"), offCard: b.classList.contains("off-card"), who: (tr.querySelector(".who") || {}).textContent || "", lic: !!tr.querySelector(".who .lic"), count: tr.cells[2].textContent,
    placesOpen: !!sub && !sub.hidden && !sub.classList.contains("reads") && tr.cells[2].querySelector("button").getAttribute("aria-expanded") === "true", items: sub && !sub.hidden ? sub.querySelectorAll(".item:not(.opt)").length : 0 };
});
// the card's own pills, read from the card itself
const cardPills = () => p.evaluate(() => [...document.querySelectorAll("#hud > .rows .r-pills button")].map((x) => ({ t: x.textContent.trim(), pressed: x.getAttribute("aria-pressed") === "true" })));
const menuOf = () => p.evaluate(() => {
  const card = [...document.querySelectorAll("#hud > .rows .r-pills button")].map((x) => x.textContent.trim());
  return [...document.querySelectorAll("#hud .dict-tab tr.sub.reads .item.opt")].map((it) => {
    const b = it.querySelector(".r-pills button"); const r = b.textContent.trim();
    return { r, card: card.includes(r), mark: !b.classList.contains("off-card"), pressed: b.getAttribute("aria-pressed"), count: (it.querySelector(".who") || {}).textContent };
  });
});
const openMenu = () => p.evaluate(() => { const b = document.querySelector("#hud .dict-tab tbody tr.pick .r-pills button[aria-expanded=\"false\"]"); if (b) b.click(); return !!b; });
const pickMenu = (r) => p.evaluate((r) => { const b = [...document.querySelectorAll("#hud .dict-tab tr.sub.reads .item.opt .r-pills button")].find((x) => x.textContent.trim() === r); if (b) b.click(); return !!b; }, r);
const lineNow = () => p.evaluate(() => { const act = document.querySelector(".wb.active"); const g = act && act.querySelector(":scope > .g"); return g ? [...g.childNodes].filter((n) => !(n.nodeType === 1 && n.classList.contains("g-lic"))).map((n) => n.textContent).join("").trim() : ""; });
const headWn = () => p.evaluate(() => { const h = document.querySelector("#hud:not([hidden]) .head .wn"); return h ? h.textContent.trim().split(/\s/u)[0] : ""; });
// what the store holds for the open word, read the way the page reads it:
// the word's letters, its shard, the source that reads this place
const storeHere = () => p.evaluate(async () => {
  const act = document.querySelector(".wb.active"); const sec = act && act.closest("section.seg");
  if (!act || !sec || !sec.__sec) return null;
  const n = [...sec.querySelectorAll(".he-text .wb:not(.mark)")].indexOf(act) + 1;
  const k = act.__word && act.__word.k;
  const key = [...String(k || "").normalize("NFD")].filter((c) => { const x = c.codePointAt(0); return x >= 0x5d0 && x <= 0x5ea; }).join("");
  const book = new URLSearchParams(location.search).get("b") || (document.querySelector('meta[name="reader-book"]') || {}).content;
  const root = (document.querySelector('meta[name="reader-home"]') || {}).content || location.pathname.replace(/[^/]*$/u, "");
  const ix = await (await fetch(`${root}data/dictionary-store/index.json`, { cache: "no-cache" })).json();
  const hex = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)))[0].toString(16).padStart(2, "0");
  const res = await fetch(`${root}data/dictionary-store/shards/${hex}.bin?v=${ix.store_version}`);
  const text = await new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).text();
  const v = JSON.parse(text)[key];
  const at = (src) => ((v && v.readings) || []).filter((g) => g.src === src && g.places.some((q) => q.book === book && q.ref === sec.__sec.label && q.w_page === n)).map((g) => g.reading);
  return { key, book, ref: sec.__sec.label, n, tahot: at("tahot"), macula: at("macula") };
});

// D1: off by default, and a card is the card
const pill0 = await p.evaluate(() => { const x = document.getElementById("dictPill"); return x ? { on: x.classList.contains("on"), state: (document.getElementById("dictState") || {}).textContent, label: x.textContent.trim(), inRow: !!x.closest("#modeRow") } : null; });
await tap(0); const plain = await waitFor("#hud .r-pills button");
const off = await p.evaluate(() => { const hud = document.getElementById("hud"); const rows = hud.querySelector(":scope > .rows");
  return { dict: hud.classList.contains("dict"), tab: !!hud.querySelector(".dict-tab"), rows: rows ? getComputedStyle(rows).display : "none", vis: [...hud.querySelectorAll(":scope > .rows .r-pills button")].some((x) => x.offsetParent !== null) }; });
await esc();
check("D1  the concordance pill stands beside the readers' pills, off; with it off a card is the card, its readings showing and no table",
  !!pill0 && pill0.inRow && !pill0.on && pill0.state === "off" && pill0.label === "concordance" && plain && !off.dict && !off.tab && off.rows !== "none" && off.vis, JSON.stringify({ ...pill0, ...off }));

// D2: on, a word's card opens to its one row; find a word whose reading here
// stands at two places or more and has other readings
await p.click("#dictPill"); await p.waitForTimeout(200);
let t = null, storeFail = null, seenRows = 0;
const n0 = await words();
for (let i = 0; i < Math.min(40, n0) && !t && !storeFail; i += 1) {
  if (!(await tap(i))) break;
  const st = await tabState();
  if (st !== "table") { if (!NO_ROW.test(st)) storeFail = `word ${i}: ${st}`; await esc(); continue; }
  // the card's readings arrive after its head; the table follows them
  await waitFor('#hud > .rows .r-pills button[aria-pressed="true"]', 5000);
  await p.waitForTimeout(400);
  const row = await rowOf();
  if (row) seenRows += 1;
  if (row && row.menu && cnt(row.count) >= 2 && row.here) {
    const card = await p.evaluate(() => ({ head: !!document.querySelector("#hud > .head"), hidden: [...document.querySelectorAll("#hud > .rows, #hud > .r-now")].every((x) => getComputedStyle(x).display === "none") }));
    const cps = await cardPills();
    const store = await storeHere();
    await openMenu(); await p.waitForTimeout(200);
    t = { i, ...card, row, cardPressed: (cps.find((x) => x.pressed) || {}).t || null, store, menu: await menuOf() };
  } else await esc();
}
const want = t && t.store ? (t.store.tahot.length ? t.store.tahot : t.store.macula) : [];
const d2 = t ? Object.entries({ head: t.head, hidden: t.hidden, oneRow: t.row.n === 1, here: t.row.here, he: !!t.row.he, pressed: t.row.pressed === "true", onCard: !t.row.offCard, isCards: t.row.reading === t.cardPressed,
  isStores: want.includes(t.row.raw), who: !!t.row.who && t.row.lic, two: cnt(t.row.count) >= 2, open: t.row.placesOpen, others: t.menu.length >= 1 && t.menu.every((m) => m.r && m.r !== t.row.reading && cnt(m.count) >= 1) }).filter(([, v]) => !v).map(([k]) => k) : null;
check("D2  with the pill on, a word's card keeps its head and opens to one row, the line's reading (the card's pressed pill, the store's reading here from the source that reads it), naming its source and licence; its pill opens the other readings, each counted",
  !storeFail && !!t && d2.length === 0,
  storeFail ? `the store did not answer: ${storeFail}` : t ? `"${t.row.reading}" (${t.row.count}) · card "${t.cardPressed}" · store here ${JSON.stringify(want)} · ${t.menu.length} other readings${d2.length ? " · not: " + d2.join(", ") : ""}` : `no such word among ${seenRows} tables`);

// D5: sort the other readings (the menu is open)
const so = t ? await p.evaluate(() => {
  const read = () => [...document.querySelectorAll("#hud .dict-tab tr.sub.reads .item.opt")].map((it) => ({ r: it.querySelector(".r-pills button").textContent.trim(), n: parseInt(it.querySelector(".who").textContent, 10) }));
  const btn = (id) => document.querySelector(`#hud .dict-tab th button[data-sort="${id}"]`);
  btn("az").click(); const az = read();
  btn("count").click(); const ct = read();
  btn("text").click();
  return { az: az.length > 1 && az.every((x, k) => k === 0 || az[k - 1].r.localeCompare(x.r) <= 0), ct: ct.length > 1 && ct.every((x, k) => k === 0 || ct[k - 1].n >= x.n), pressed: btn("text").getAttribute("aria-pressed") };
}) : null;

// D3: places, open with the row (the menu closed again first)
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
  // the first places' verses, read as they come into view
  const ex = [];
  for (let j = 0; j < Math.min(3, got.items); j += 1) {
    await p.evaluate((j) => { const e = document.querySelectorAll("#hud .dict-tab tr.sub .item .ex")[j]; if (e) e.scrollIntoView({ block: "nearest" }); }, j);
    await p.waitForTimeout(1500);
    ex.push(await p.evaluate((j) => { const e = document.querySelectorAll("#hud .dict-tab tr.sub .item .ex")[j]; return e ? e.querySelectorAll(".ex-he .hit").length : -1; }, j));
  }
  return { ...got, ex };
})() : null;
check("D3  the row's places stand open: as many as the row counts (fifty at a time), this place first and said, every other a link to exactly its place on the page's own address; each verse marks the word once, and the other source's reading stands with its licence",
  !!pl && t.row.placesOpen && pl.items === Math.min(pl.n, 50) && pl.more === pl.n > 50 && /^here · /u.test(pl.first) && pl.links.length === pl.items - 1 && !pl.bad.length && pl.ex.every((x) => x === 1) && pl.beside >= 1,
  pl ? `${pl.items} of ${pl.n} · ${pl.links.length} links · verses ${JSON.stringify(pl.ex)} · ${pl.beside} with the other source${pl.bad.length ? " · " + pl.bad.slice(0, 3).join("; ") : ""}` : "");

// D4: the card's mark, and picks on and off the card
const rd = t ? await (async () => {
  await openMenu(); await p.waitForTimeout(200);
  const menu = await menuOf();
  const markOk = menu.every((m) => m.card === m.mark);
  const out = { markOk, menu: menu.length, runs: [] };
  for (const opt of [menu.find((m) => m.card && m.pressed !== "true"), menu.find((m) => !m.card)].filter(Boolean)) {
    if (!(await p.$("#hud .dict-tab tr.sub.reads"))) { await openMenu(); await p.waitForTimeout(200); }
    const before = await lineNow();
    await pickMenu(opt.r); await p.waitForTimeout(1200);
    const row = await rowOf();
    const cps = await cardPills();
    out.runs.push({ opt, row, cardPressed: (cps.find((x) => x.t === opt.r) || {}).pressed || false, before, line: await lineNow() });
  }
  // this place's reading again
  await openMenu(); await p.waitForTimeout(200);
  await pickMenu(t.row.reading); await p.waitForTimeout(1200);
  out.back = { row: await rowOf(), line: await lineNow() };
  return out;
})() : null;
const runOk = (x) => x.row.reading === x.opt.r && x.row.count.trim() === x.opt.count.trim() && x.row.n === 1 && x.row.placesOpen && x.row.items === Math.min(cnt(x.opt.count), 50)
  && (x.opt.card ? x.cardPressed && x.row.pressed === "true" && x.line.includes(x.opt.r) : x.line === x.before);
check("D4  the table marks a reading as the card's exactly when the card has that pill; a pick becomes the row with its count and places open, pressing the card's pill where it has one (the line reads it) and leaving the line where it has none; this place's reading picked again puts the line back",
  !!rd && rd.markOk && rd.runs.length >= 1 && rd.runs.every(runOk) && rd.back.row.reading === t.row.reading && rd.back.row.pressed === "true" && rd.back.line.includes(t.row.reading),
  rd ? `marks ${rd.markOk ? "agree" : "DISAGREE"} over ${rd.menu} · ${rd.runs.map((x) => `"${x.opt.r}" (${x.opt.card ? "on the card" : "not on the card"}) ${runOk(x) ? "ok" : "BAD " + JSON.stringify(x)}`).join(" · ")} · back "${rd.back.row.reading}" line "${rd.back.line.slice(0, 40)}"` : "");

// D5 (a word with no other readings: a header leaves its places open)
let lone = null;
if (t) {
  const origin = t.i;
  await esc();
  for (let i = 0; i < Math.min(80, n0) && !lone; i += 1) {
    if (i === origin || !(await tap(i))) continue;
    if ((await tabState()) !== "table") { await esc(); continue; }
    await p.waitForTimeout(300);
    const row = await rowOf();
    if (row && !row.menu && row.placesOpen) {
      await p.evaluate(() => document.querySelector('#hud .dict-tab th button[data-sort="count"]').click());
      await p.waitForTimeout(200);
      lone = { before: row, after: await rowOf() };
    } else await esc();
  }
  await esc();
}
check("D5  the headers sort the other readings: A–Z by the reading, \"places\" by the count; where there are no others a header leaves the places open",
  !!so && so.az && so.ct && so.pressed === "true" && (!lone || lone.after.placesOpen), `${JSON.stringify(so)} · ${lone ? `a lone reading "${lone.before.reading}": places open after a sort ${lone.after.placesOpen}` : "no lone reading among the words tried"}`);

// D6: follow a place in this book, back, then one in another book; reload
let d6 = null;
if (t) {
  const reopen = async () => { await tap(t.i); await tabState(); await p.waitForTimeout(500); };
  const linkTo = (same) => p.evaluate((same) => {
    const here = new URLSearchParams(location.search).get("b") || (document.querySelector('meta[name="reader-book"]') || {}).content;
    const a = [...document.querySelectorAll("#hud .dict-tab tbody tr.pick + tr.sub a")].find((x) => { const h = x.getAttribute("href"); const bk = (h.match(/[?&]b=([a-z0-9-]+)/u) || h.match(/^\/([a-z0-9-]+)\//u) || [])[1]; return same ? bk === here : bk && bk !== here; });
    if (!a) return null;
    return { href: a.getAttribute("href"), place: a.getAttribute("href").match(/#(\d+:\d+:\d+)$/u)[1], label: a.textContent };
  }, same);
  await reopen();
  const from = await headWn();
  const hereLabel = await p.evaluate(() => { const x = document.querySelector("#hud .dict-tab tbody tr.pick + tr.sub .item"); return x ? x.firstChild.textContent.replace(/^here · /u, "") : ""; });
  d6 = { from, hereLabel };
  const same = await linkTo(true);
  if (same) {
    await p.evaluate((h) => [...document.querySelectorAll("#hud .dict-tab tbody tr.pick + tr.sub a")].find((x) => x.getAttribute("href") === h).click(), same.href);
    await p.waitForTimeout(2500);
    const landed = await headWn();
    const back = await p.evaluate(() => (document.getElementById("dictBack") || {}).textContent || "");
    await esc();
    const vis = await p.evaluate(() => { const x = document.getElementById("dictBack"); const r = x && x.getBoundingClientRect(); const pb = document.getElementById("placeBack"); const q = pb && !pb.hidden ? pb.getBoundingClientRect() : null;
      return !!x && !x.hidden && r.width > 0 && r.height > 0 && !(q && r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom); });
    await p.evaluate(() => document.getElementById("dictBack").click());
    await p.waitForTimeout(2500);
    const returned = await headWn();
    const spent = await p.evaluate(() => !document.getElementById("dictBack") && !localStorage.getItem("fh.dict.back"));
    d6.same = { same, landed, back, vis, returned, spent };
  }
  if (!(await p.$("#hud:not([hidden]) .dict-tab"))) await reopen();
  const other = await linkTo(false);
  if (other) {
    await p.evaluate((h) => [...document.querySelectorAll("#hud .dict-tab tbody tr.pick + tr.sub a")].find((x) => x.getAttribute("href") === h).click(), other.href);
    await p.waitForLoadState("networkidle"); await p.waitForTimeout(3000);
    const landed = await headWn();
    const back = await p.evaluate(() => (document.getElementById("dictBack") || {}).textContent || "");
    await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(2000);
    const kept = await p.evaluate(() => ({ on: document.getElementById("dictPill").classList.contains("on"), ls: localStorage.getItem("fh.dict") }));
    d6.other = { other, landed, back, kept };
  }
}
const s6 = d6 && d6.same, o6 = d6 && d6.other;
// a place inside a run opens the run's card, whose head names the run's words
const landedAt = (place, wn) => { const [c, v, w] = place.split(":").map(Number); const m = String(wn).match(/^(\d+):(\d+):(\d+)(?:\u2013(\d+))?$/u); return !!m && +m[1] === c && +m[2] === v && +m[3] <= w && w <= +(m[4] || m[3]); };
const sOk = !s6 || (landedAt(s6.same.place, s6.landed) && s6.back === `Back to ${d6.hereLabel}` && s6.vis && s6.returned === d6.from && s6.spent);
const oOk = !o6 || (landedAt(o6.other.place, o6.landed) && o6.back === `Back to ${d6.hereLabel}` && o6.kept.on && o6.kept.ls === "on");
check("D6  following a place in this book and in another (each where the word has one) lands on exactly it with its card open; \"Back to\" the place left shows once the card is closed, clear of the place's own way back, returns there and is spent; the pill is remembered over a reload",
  (!!s6 || !!o6) && sOk && oOk,
  d6 ? `same book: ${s6 ? `${s6.same.place} landed ${s6.landed} · "${s6.back}" shows ${s6.vis} · back at ${s6.returned} (from ${d6.from}) · spent ${s6.spent}` : "no link"} | other book: ${o6 ? `${o6.other.label} landed ${o6.landed} · "${o6.back}" · pill kept ${o6.kept.on}/${o6.kept.ls}` : "no link"}` : "no table");

// D7: a divided reading reads as the card prints it, pressed on both
await p.goto(URL, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
let d7 = null;
const n1 = await words();
for (let i = 0; i < Math.min(60, n1) && !d7; i += 1) {
  if (!(await tap(i))) break;
  if ((await tabState()) !== "table") { await esc(); continue; }
  await p.waitForTimeout(300);
  const row = await rowOf();
  if (row && row.here && row.raw.includes("/")) { const cps = await cardPills(); d7 = { row, cardPressed: (cps.find((x) => x.pressed) || {}).t || null }; }
  else await esc();
}
check("D7  a reading the source divides reads as the card prints it, and the card's pressed pill is the table's, pressed",
  !!d7 && d7.row.reading === d7.cardPressed && d7.row.pressed === "true" && !d7.row.offCard && !d7.row.reading.includes("/"),
  d7 ? `"${d7.row.raw}" reads "${d7.row.reading}" · card "${d7.cardPressed}"` : "no divided reading here among the words tried");
await esc();

// D8: a named run's card stays the card; the headword lookup reads the ink
// (sections are built as they come into view: walk them until a run shows)
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
if (t) {
  await p.evaluate(() => localStorage.setItem("fh.lookup", "headword"));
  await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  await tap(t.i);
  if ((await tabState()) === "table") { await p.waitForTimeout(400); hw = await rowOf(); }
  await p.evaluate(() => localStorage.removeItem("fh.lookup"));
}
check("D8  a named run's card stays the card with the pill on, and under \"look up by: the headword\" the table still reads the word as inked",
  (!run || (runCard && runCard.open && !runCard.dict && !runCard.tab)) && !!hw && hw.here && hw.reading === t.row.reading,
  `${run ? `run card ${JSON.stringify(runCard)}` : "no named run on this page"} · headword lookup: ${hw ? `"${hw.reading}" here ${hw.here}` : "no table"}`);
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
