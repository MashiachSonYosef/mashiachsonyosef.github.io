// Read-only (helper A): the model of the gates (model.mjs) against what the page said on the cards the probe opened.
// For each block read on the page: the counts the card says each gate withheld (entry, name, pointing, unpointed, stem)
// against the model's over every store row of the block's key, and the pills on the card against the model's standing
// rows of the twelve. Usage: node compare.mjs <reader dir> <probe out.json> [--verbose]
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { loadModel, gz } from "./model.mjs";
const [R, OUT, VERB] = process.argv.slice(2);
const M = await loadModel(R);
const probed = JSON.parse(readFileSync(OUT, "utf8"));
const zones = new Map(), sides = new Map();
const zoneOf = (b) => zones.get(b) || zones.set(b, gz(join(R, "data", "zones", `${b}.bin`))).get(b);
const sideOf = (b) => sides.get(b) || sides.set(b, gz(join(R, "data", "zones", `${b}.lattice.bin`))).get(b);
// the dictionaries beside the store (Jastrow, the Samaritan works): the page asks their rows the pointing and the stem
// too and counts them with the store's (zone.html 9142-9158), after the source switches (MSAM2 rests off)
const OV = ["jastrow", "samaritan"].map((id) => ({ id, ix: JSON.parse(readFileSync(join(R, "data", "overlays", id, "index.json"), "utf8")), cache: new Map() }));
const overlayRows = (k) => {
  const shard = createHash("sha256").update(k, "utf8").digest("hex").slice(0, 2);
  const out = [];
  for (const o of OV) {
    if (!o.cache.has(shard)) { const f = join(R, "data", "overlays", o.id, "shards", `${shard}.bin`); o.cache.set(shard, existsSync(f) ? gz(f) : {}); }
    const ruled = o.ix.lanes ? new Set(Object.entries(o.ix.lanes).filter(([, l]) => l && l.standing === "ruled").map(([id]) => id)) : null;
    for (const row of o.cache.get(shard)[k] || []) { if (ruled && row[7] && !(row[7].lanes || [row[7].lane]).some((l) => ruled.has(l))) continue; if (String(row[3]) === "MSAM2") continue; out.push(row.slice(0, 7)); }
  }
  return out;
};
const res = { cards: 0, blocks: 0, agree: 0, disagree: 0, notModeled: 0, details: [] };
const key = (t) => String(t).toLowerCase();
for (const p of probed) {
  if (p.pageerror) { res.details.push({ book: p.book, pageerror: p.pageerror }); continue; }
  if (p.fault) { res.details.push({ ...p }); continue; }
  const zone = zoneOf(p.book), side = sideOf(p.book);
  const sec = zone.sections[p.si], w = sec.words[p.e];
  let n = 0; for (let i = 0; i <= p.e; i += 1) if (!sec.words[i].mark) n += 1;
  const placeName = `${p.book} ${sec.label}:${n}`;
  res.cards += 1;
  if (w.w || w.kq || !w.k) { res.notModeled += 1; res.details.push({ place: placeName, note: "a pair: not modeled here" }); continue; }
  const namesMarked = !!(zone.emitted_from && zone.emitted_from.toggles && zone.emitted_from.toggles.lattice && zone.emitted_from.toggles.lattice.names);
  const cells = M.cellsOfWord(w, namesMarked);
  const check = (read, cell, how) => {
    res.blocks += 1;
    const ev = M.evalCell({ ...cell, side });
    const cnt = { entry: 0, name: 0, "point-x": 0, "point-n": 0, piece: 0, stem: 0 };
    for (const x of ev.rows) if (x.held && cnt[x.held] !== undefined) cnt[x.held] += 1;
    // the rows beside the store, asked the pointing and the stem as the page asks them
    const ovc = { x: 0, n: 0, stem: 0 };
    { const extra = overlayRows(cell.key);
      const beginsWord = !(cell.pp && cell.pp.a > 0);
      let left = extra;
      if (ev.attested && cell.pointed && M.isPointed(cell.pointed)) left = extra.filter((row) => { const h = M.heldByPointing(M.gradeRow(row, cell.pointed, beginsWord)); if (h === "x") ovc.x += 1; else if (h) ovc.n += 1; return !h; });
      if (ev.stemsHere && side.stems && side.stems[cell.key]) { const fams = new Set(ev.stemsHere.map(M.stemFamily)); for (const row of left) { const st = side.stems[cell.key][`${row[3]}\u0001${row[0]}\u0001${row[1]}`]; if (Array.isArray(st) && st.length && !st.some((y) => fams.has(M.stemFamily(y)))) ovc.stem += 1; } } }
    // the model's pills of the twelve: the rows left, the kinds laid at the place, the sense openings out
    const groups = new Map();
    for (const x of ev.rows) {
      if (x.held || !M.index.m_sources[x.m]) continue;
      if (M.restsOff(x.row, placeName)) continue;
      if (x.opens) continue;
      for (const t of M.store.readingsOf(x.row)) { const k = M.readingKey(t); const g = groups.get(k) || groups.set(k, { text: t, ms: new Set() }).get(k); g.ms.add(x.m); }
    }
    let model = [...groups.keys()];
    if (how === "whole-divided") model = model.filter((k) => !/\//u.test(groups.get(k).text));
    const unsigned = model.filter((k) => !M.hasSourceSign(groups.get(k).text));
    const ds = read.dataset || {};
    const page = (read.pool || []).map(key);
    const pageSet = new Set(page);
    const diffs = [];
    const num = (x) => Number(x || 0);
    if (read.dataset) {
      if (num(ds.entryWithheld) !== cnt.entry) diffs.push(`entry withheld: page ${ds.entryWithheld}, model ${cnt.entry}`);
      if (num(ds.nameWithheld) !== cnt.name) diffs.push(`name withheld: page ${ds.nameWithheld}, model ${cnt.name}`);
      if (num(ds.withheld) !== cnt["point-x"] + cnt.piece + ovc.x) diffs.push(`pointed otherwise (and piece kind) withheld: page ${ds.withheld}, model ${cnt["point-x"]}+${cnt.piece}+${ovc.x} beside the store`);
      if (num(ds.unpointedWithheld) !== cnt["point-n"] + ovc.n) diffs.push(`unpointed held back: page ${ds.unpointedWithheld}, model ${cnt["point-n"]}+${ovc.n} beside the store`);
      if (num(ds.stemWithheld) !== cnt.stem + ovc.stem) diffs.push(`stem withheld: page ${ds.stemWithheld}, model ${cnt.stem}+${ovc.stem} beside the store`);
    } else if (model.length) diffs.push(`the page drew no pills; the model has ${model.length}`);
    // the pills: every unsigned pill of the model stands on the page; every pill of the page is the model's, or the place's own
    const missing = unsigned.filter((k) => !pageSet.has(k));
    const extra = page.filter((k, i) => !groups.has(k) && !(read.poolPlace || [])[i] && !(read.poolOv || [])[i] && !/PIECE:/u.test((read.poolBy || [])[i] || ""));
    const extraDivided = how === "whole-divided" ? [] : [];
    if (missing.length) diffs.push(`pills the model has and the page does not: ${missing.slice(0, 6).join(" | ")}${missing.length > 6 ? ` (+${missing.length - 6})` : ""}`);
    if (extra.length) diffs.push(`pills the page has and the model does not: ${extra.slice(0, 6).join(" | ")}${extra.length > 6 ? ` (+${extra.length - 6})` : ""}`);
    const signedModel = model.length - unsigned.length;
    const row = { place: placeName, how, block: cell.key, page_pills: page.length, model_pills: model.length, model_unsigned: unsigned.length, page_signs_off: num(ds.signsOff), model_signed: signedModel, counts: cnt, page_counts: read.dataset ? { entry: num(ds.entryWithheld), name: num(ds.nameWithheld), pointed: num(ds.withheld), unpointed: num(ds.unpointedWithheld), stem: num(ds.stemWithheld), kind: num(ds.kindWithheld), rows: num(ds.rows) } : null, diffs };
    if (diffs.length) res.disagree += 1; else res.agree += 1;
    res.details.push(row);
  };
  // which block did the card open on?
  const opened = p.opened;
  const divided = cells.length > 1;
  if (!divided) check(opened, cells[0], "whole");
  else {
    const at = cells.find((c) => c.kind === "piece" && c.key === opened.block && c.opened) || cells.find((c) => c.kind === "piece" && c.key === opened.block);
    if (opened.block && at) check(opened, at, "opened-piece");
    else if (!opened.block) res.details.push({ place: placeName, how: "opened", note: `the card opened on no named block (label ${opened.label}); pills ${opened.pills.length}; cells ${JSON.stringify(opened.cells)}; cuts ${JSON.stringify(opened.cuts)}` });
    for (const b of p.blocks || []) {
      const cell = cells.filter((c) => c.kind === "piece")[b.i];
      if (cell && cell.key === (opened.cells[b.i] || [])[0]) check(b, cell, `piece-${b.i}-${cell.role}`);
      else res.details.push({ place: placeName, how: `piece-${b.i}`, note: `the page's block ${JSON.stringify(opened.cells[b.i])} is not the model's ${cell ? cell.key : null}` });
    }
    if (p.whole) check(p.whole, cells[0], "whole-divided");
  }
}
const bad = res.details.filter((d) => d.diffs && d.diffs.length);
console.log(JSON.stringify({ cards: res.cards, blocks_compared: res.blocks, agree: res.agree, disagree: res.disagree, pairs_not_modeled: res.notModeled }));
for (const d of res.details) if (VERB || (d.diffs && d.diffs.length) || d.note || d.pageerror || d.fault) console.log(JSON.stringify(d));
