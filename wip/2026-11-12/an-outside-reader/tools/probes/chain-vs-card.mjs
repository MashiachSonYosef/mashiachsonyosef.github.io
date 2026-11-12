// The chain book set beside the cards the page draws, word by word: every pill a word's card prints, hashed here
// (sha256 over the UTF-8 bytes, first 12 hex digits, node's own), looked for among the links the chain book holds
// for that word; and the source the card credits beside the source the chain names. A pill that is no link is
// classed by what stands behind it: an overlay's reading (the card says so itself), a reading the store holds under
// another spelling of the same printed form (a closing period, "/" pieces, a capital), or neither.
// node chain-vs-card.mjs <reader dir> <site root dir> <zone url base> <book> <first section> <count> <out.json>
//      [--lift]   every switch lifted before the cards are read: the pointing "keep" (nothing withheld), every source on, signs printed
// Nothing is written but the dump asked for. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
const argv = process.argv.slice(2);
const LIFT = argv.includes("--lift"); if (LIFT) argv.splice(argv.indexOf("--lift"), 1);
const [reader, site, base, book, fromArg, countArg, out] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const { readingKey } = await import(pathToFileURL(join(reader, "tools", "gloss-store-v1.mjs")).href);
const short = (s) => createHash("sha256").update(String(s), "utf8").digest("hex").slice(0, 12);
const chain = JSON.parse(gunzipSync(readFileSync(join(site, "chain", book, "chain-v1.json.gz"))).toString("utf8"));
const zone = JSON.parse(gunzipSync(readFileSync(join(reader, "data/zones", `${book}.bin`))).toString("utf8"));
const ix = JSON.parse(readFileSync(join(reader, "data/route-store/index.json"), "utf8"));
const labelOf = (m) => (ix.m_sources[m] && ix.m_sources[m].label) || null;
const FROM = Number(fromArg), COUNT = Number(countArg);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
if (LIFT) {
  await p.evaluate(() => { localStorage.setItem("fh.masorah", "keep"); localStorage.setItem("fh.signs", "printed"); localStorage.setItem("fh.sources.off", "[]"); localStorage.setItem("fh.sources.shelve", "[]"); });
  await p.reload({ waitUntil: "networkidle" });
}
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(600);
const state = await p.evaluate(() => ({ masorah: localStorage.getItem("fh.masorah"), signs: window.__signs, off: window.__sourcesOff || [] }));
const shards = new Map();
const rowsOf = async (k) => {
  const hex = createHash("sha256").update(k, "utf8").digest("hex").slice(0, 2);
  if (!shards.has(hex)) shards.set(hex, JSON.parse(gunzipSync(readFileSync(join(reader, "data/route-store/shards", `${hex}.bin`))).toString("utf8")));
  return shards.get(hex)[k] || [];
};
const T = { words: 0, opened: 0, pills: 0, linked: 0, sameSource: 0, otherSource: 0, otherSourceOverlay: 0, notLinked: 0, overlay: 0, printForm: 0, caseOnly: 0, neither: 0, chainLinks: 0, chainNoPill: 0, lineLinked: 0, lineNot: 0, withheld: 0, stemWithheld: 0, bySources: 0 };
const kinds = new Map(), eg = { overlay: [], printForm: [], caseOnly: [], neither: [], otherSource: [], lineNot: [] };
const cards = [];
for (let i = FROM; i < FROM + COUNT && i < zone.sections.length; i += 1) {
  const sec = zone.sections[i], cs = chain.sections[i].cells;
  const wordsZ = sec.words.map((w, j) => ({ w, j })).filter((x) => !x.w.mark);
  for (let n = 0; n < wordsZ.length; n += 1) {
    const { w: zw, j } = wordsZ[n];
    if (Array.isArray(zw.w)) continue;   // a word written one way and read another: its halves have their own cards
    T.words += 1;
    await p.keyboard.press("Escape"); await p.waitForTimeout(80);
    const got = await p.evaluate(async ({ i, n }) => {
      const s = document.getElementById(`s${i}`);
      for (let g = 0; g < 400 && !s.querySelector(".he-text .wb"); g += 1) { s.scrollIntoView({ block: "center" }); await new Promise((q) => setTimeout(q, 20)); }
      const wb = [...s.querySelectorAll(".he-text .wb:not(.mark)")][n];
      if (!wb) return null;
      wb.scrollIntoView({ block: "center" }); await new Promise((q) => setTimeout(q, 60));
      window.__pool = null;
      const run = wb.closest(".wjoin");
      const line = run && run.__gloss ? (run.__gloss.cloneNode(true)) : (wb.querySelector(":scope > .g") ? wb.querySelector(":scope > .g").cloneNode(true) : null);
      if (line) line.querySelectorAll(".g-lic").forEach((x) => x.remove());
      (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
      return { k: wb.__word ? wb.__word.k : "", s: wb.__word ? wb.__word.s : "", line: line ? line.textContent.trim() : "", inRun: !!run };
    }, { i, n });
    if (!got) continue;
    const t0 = Date.now();
    let ready = false;
    while (Date.now() - t0 < 8000) { ready = await p.evaluate(() => Array.isArray(window.__pool) && !!document.querySelector("#hud .b-read .r-pills")); if (ready) break; await p.waitForTimeout(60); }
    if (!ready) { cards.push({ at: `${sec.label}:${n + 1}`, k: got.k, opened: false }); continue; }
    await p.waitForTimeout(120);
    const card = await p.evaluate(() => { const pl = document.querySelector("#hud .b-read .r-pills"); const head = document.querySelector("#hud .head"); return { pool: window.__pool || [], ov: window.__poolOv || [], lead: window.__poolLead || [], by: window.__poolBy || [], place: window.__poolPlace || [], data: pl ? { ...pl.dataset } : {}, head: head ? head.textContent.replace(/\s+/g, " ").trim() : "" }; });
    T.opened += 1;
    const cell = cs[j];
    const reads = cell.reads || [];
    const linkBy = new Map(reads.map((r) => [r.r, r]));
    T.chainLinks += reads.length;
    T.withheld += Number(card.data.withheld || 0); T.stemWithheld += Number(card.data.stemWithheld || 0); T.bySources += Number(card.data.withheldBySources || 0);
    const store = await rowsOf(got.k);
    const pillHashes = new Set();
    const rec = { at: `${sec.label}:${n + 1}`, k: got.k, s: got.s, head: card.head, inRun: got.inRun, pills: card.pool.length, links: reads.length, pool: card.pool, lead: card.lead, ov: card.ov, by: card.by, line: got.line, data: card.data, miss: [] };
    card.pool.forEach((t, x) => {
      T.pills += 1;
      const h = short(t); pillHashes.add(h);
      const link = linkBy.get(h);
      if (link) {
        T.linked += 1;
        const lab = labelOf(card.lead[x]);
        if (lab && link.s === short(lab)) T.sameSource += 1;
        else { T.otherSource += 1; if (card.ov[x]) T.otherSourceOverlay += 1; if (eg.otherSource.length < 8) eg.otherSource.push(`${rec.at} ${JSON.stringify(t)}: the card credits ${card.lead[x]}${card.ov[x] ? ` (${card.ov[x]})` : ""}`); }
        return;
      }
      T.notLinked += 1;
      let kind;
      if (card.ov[x]) kind = "overlay";
      else {
        const same = store.filter((r) => readingKey(r[1]) === String(t).toLowerCase());
        const viaRaw = same.find((r) => linkBy.has(short(r[1])));
        if (viaRaw) kind = String(viaRaw[1]).toLowerCase() === String(viaRaw[1]) || readingKey(viaRaw[1]) !== String(viaRaw[1]).toLowerCase() || String(viaRaw[1]).toLowerCase() !== String(t).toLowerCase() ? "printForm" : "caseOnly";
        else kind = "neither";
        if (viaRaw && String(viaRaw[1]).toLowerCase() === String(t).toLowerCase() && viaRaw[1] !== t) kind = "caseOnly";
      }
      T[kind] += 1;
      const src = card.lead[x] || "";
      kinds.set(`${kind} · ${src} ${labelOf(src) || card.ov[x] || ""}`.slice(0, 90), (kinds.get(`${kind} · ${src} ${labelOf(src) || card.ov[x] || ""}`.slice(0, 90)) || 0) + 1);
      if (eg[kind].length < 10) eg[kind].push(`${rec.at} ${JSON.stringify(String(t).slice(0, 70))} (${src})`);
      rec.miss.push({ t, kind, src });
    });
    T.chainNoPill += reads.filter((r) => !pillHashes.has(r.r)).length;
    // the line under the word, where the word stands alone
    if (!got.inRun && got.line) { if (linkBy.has(short(got.line))) T.lineLinked += 1; else { T.lineNot += 1; if (eg.lineNot.length < 8) eg.lineNot.push(`${rec.at} ${JSON.stringify(got.line)}`); } }
    cards.push(rec);
  }
}
await b.close();
console.log(`${book} sections ${FROM}..${FROM + COUNT - 1} (${zone.sections[FROM].label} to ${zone.sections[Math.min(zone.sections.length, FROM + COUNT) - 1].label}) · switches ${LIFT ? "lifted" : "at rest"}: pointing ${state.masorah || "(resting)"}, signs ${state.signs}, sources off ${JSON.stringify(state.off)}`);
console.log(`  ${T.words} words · ${T.opened} cards opened · ${T.pills} pills · ${T.chainLinks} links in the chain for the same words`);
console.log(`  pills that are a link on the same word: ${T.linked} · of those the card credits the source the chain names at ${T.sameSource}, another at ${T.otherSource} (${T.otherSourceOverlay} of them an overlay's)`);
console.log(`  pills that are no link: ${T.notLinked} · an overlay's reading ${T.overlay} · the chain holds the store's spelling of it (a period, "/" pieces) ${T.printForm} · a capital only ${T.caseOnly} · neither ${T.neither}`);
console.log(`  links with no pill: ${T.chainNoPill} · the cards say they withheld ${T.withheld} as pointed otherwise, ${T.stemWithheld} as another stem, ${T.bySources} by the source switches`);
console.log(`  the line under a word standing alone is a link at ${T.lineLinked}, is not at ${T.lineNot}`);
for (const [k, n] of [...kinds].sort((a, c) => c[1] - a[1]).slice(0, 24)) console.log(`     ${String(n).padStart(4)}  ${k}`);
for (const [k, v] of Object.entries(eg)) if (v.length) console.log(`  ${k}: ${v.join(" | ")}`);
writeFileSync(out, `${JSON.stringify({ book, lift: LIFT, state, totals: T, cards }, null, 1)}\n`);
console.log(`dump: ${out}`);
