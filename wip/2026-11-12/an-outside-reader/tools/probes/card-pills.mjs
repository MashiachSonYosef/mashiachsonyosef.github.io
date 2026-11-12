// A word's card as the page draws it, pill by pill, with what stands behind each pill in the served store: the rows
// that print that reading under the word's key, each row's source, its own headwords (the source's bytes), and the
// stems the lattice sidecar holds for it; beside the place's own headword and stems. And what the card says of
// itself: its head, its notes, what it withheld and why.
// node card-pills.mjs <reader dir> <zone url base> <book> <out.json> <label:word> [<label:word> ...] [--shot dir]
//   label as the zone gives it (1:1); word counted from 1, marks not counted
// Nothing is written but the dump asked for (and pictures, if asked). It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const argv = process.argv.slice(2);
const si = argv.indexOf("--shot"); const SHOT = si >= 0 ? argv[si + 1] : null; if (si >= 0) argv.splice(si, 2);
const [reader, base, book, out, ...asks] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const { printedForm, readingKey } = await import(pathToFileURL(join(reader, "tools", "gloss-store-v1.mjs")).href);
const ix = JSON.parse(readFileSync(join(reader, "data/route-store/index.json"), "utf8"));
const zone = JSON.parse(gunzipSync(readFileSync(join(reader, "data/zones", `${book}.bin`))).toString("utf8"));
const lattice = JSON.parse(gunzipSync(readFileSync(join(reader, "data/zones", `${book}.lattice.bin`))).toString("utf8"));
const secIndex = new Map((zone.sections || []).map((s, i) => [String(s.label), i]));
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(600);
const cards = [];
if (SHOT) mkdirSync(SHOT, { recursive: true });
for (const ask of asks) {
  const cut = ask.lastIndexOf(":");
  const label = ask.slice(0, cut), n = Number(ask.slice(cut + 1));
  const i = secIndex.get(label);
  if (i === undefined) { console.log(`${ask}: no such section`); continue; }
  const zw = (zone.sections[i].words || []).filter((w) => !w.mark)[n - 1];
  await p.keyboard.press("Escape");
  await p.waitForTimeout(150);
  const word = await p.evaluate(async ({ i, n }) => {
    const s = document.getElementById(`s${i}`);
    for (let g = 0; g < 400 && !s.querySelector(".he-text .wb"); g += 1) { s.scrollIntoView({ block: "center" }); await new Promise((q) => setTimeout(q, 20)); }
    const wb = [...s.querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
    if (!wb) return null;
    wb.scrollIntoView({ block: "center" });
    await new Promise((q) => setTimeout(q, 120));
    const before = window.__pool;
    window.__pool = null;
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    return { s: wb.__word ? wb.__word.s : "", k: wb.__word ? wb.__word.k : "", before: !!before, line: ((wb.querySelector(":scope > .g") || {}).textContent || "").trim() };
  }, { i, n });
  if (!word) { console.log(`${ask}: no such word on the page`); continue; }
  const t0 = Date.now();
  while (Date.now() - t0 < 12000 && !(await p.evaluate(() => Array.isArray(window.__pool) && !!document.querySelector("#hud .b-read .r-pills button")))) await p.waitForTimeout(80);
  await p.waitForTimeout(500);
  const card = await p.evaluate(() => {
    const hud = document.getElementById("hud");
    const txt = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : "");
    const read = hud.querySelector(".b-read");
    const pills = hud.querySelector(".b-read .r-pills");
    // the card's bands above the readings, as text: what it says of the word before any reading
    const bands = [...hud.children].filter((c) => !c.contains(read) || c === read).map((c) => ({ cls: c.className, text: c === read ? "" : txt(c).slice(0, 400) })).filter((x) => x.text);
    return {
      gradedBy: window.__cardGradedBy || "", pool: window.__pool || [], by: window.__poolBy || [], ov: window.__poolOv || [], place: window.__poolPlace || [], lead: window.__poolLead || [],
      data: pills ? { ...pills.dataset } : {}, notes: [...hud.querySelectorAll(".b-read p, .b-read .note, .b-read .kq-role")].map(txt).filter(Boolean),
      pressed: txt(hud.querySelector(".b-read .r-pills button[aria-pressed=\"true\"], .b-read .r-pills button.on")), bands, all: txt(hud).slice(0, 1200),
    };
  });
  if (SHOT) await p.screenshot({ path: join(SHOT, `${book}-${label.replace(/:/gu, "-")}-${n}.png`) });
  // the served store's rows under the word's key
  const rows = await p.evaluate(async (k) => {
    const ix2 = await (await fetch("data/route-store/index.json")).json();
    const hex = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(k)))[0].toString(16).padStart(2, "0");
    const res = await fetch(`data/route-store/shards/${hex}.bin?v=${ix2.store_version}`);
    const text = await new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).text();
    return JSON.parse(text)[k] || [];
  }, word.k).catch(() => []);
  const gr = (lattice.grades || {})[word.s] || null;
  const stemsOfKey = (lattice.stems || {})[word.k] || null;
  const pillsOut = card.pool.map((t, j) => {
    const key = String(t).toLowerCase();
    const behind = rows.filter((r) => readingKey(r[1]) === key).map((r) => ({ m: r[3], rank: r[0], text: r[1], heads: Array.isArray(r[6]) ? r[6] : null, stems: stemsOfKey ? stemsOfKey[`${r[3]}\u0001${r[0]}\u0001${r[1]}`] || null : null }));
    return { text: t, by: card.by[j] || "", lead: card.lead[j] || "", overlay: card.ov[j] || "", place: !!card.place[j], rows: behind };
  });
  cards.push({ ask, label, n, s: word.s, k: word.k, h: zw ? zw.h || null : null, hp: zw ? zw.hp || null : null, placePieces: zw && zw.pg ? zw.pg.map((x) => x.g) : null, line: word.line, placeStems: gr && gr.st ? gr.st : null, gradedBy: card.gradedBy, data: card.data, notes: card.notes, pressed: card.pressed, bands: card.bands, all: card.all, storeRows: rows.length, pills: pillsOut });
  const lab = (m) => (ix.m_sources[m] && ix.m_sources[m].label) || m;
  void lab; void printedForm;
  console.log(`${book} ${label} word ${n} · ${word.s} (key ${word.k}; headword ${zw && zw.hp ? zw.hp : "none"}; stems at this place ${gr && gr.st ? gr.st.join(", ") : "none said"}) · ${card.pool.length} pills · ${Object.entries(card.data).filter(([k]) => /ithheld|rows/u.test(k)).map(([k, v]) => `${k}=${v}`).join(" ")}`);
  for (const nt of card.notes.slice(0, 5)) console.log(`     the card says: ${nt.slice(0, 220)}`);
}
writeFileSync(out, `${JSON.stringify({ book, base, cards }, null, 1)}\n`);
console.log(`dump: ${out} (${cards.length} cards)`);
await b.close();
