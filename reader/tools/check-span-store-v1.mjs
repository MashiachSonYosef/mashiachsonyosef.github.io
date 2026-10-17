// THE SPAN STORE ON THE PAGE (Moses, relay v75.3; the owner: "an underline
// is one license defining both words"; "right, no +, in fact basically the
// opposite of most compspans"). Judged on disk and on the page:
//   S1  the served store: the index's counts on their axes, every book file's
//       places pointing at rows the file holds, every row's M a licensed
//       source the page can name
//   S2  every place of a book is laid as one cell whose ink is the key, with
//       one line reading the store's first row under a chip, and one blob
//   S3  a cell's card opens on the span whole: the pills are the rows'
//       readings, the record under the first is that row's D, and a place
//       inside another's is a rung of the longer cell's card
//   S4  the two sources the shelf lacked (M197, M199) resolve with a license
// Usage: node tools/check-span-store-v1.mjs [url] [--books amos,genesis]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
import { readFileSync, readdirSync, existsSync } from "node:fs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BOOKS = arg("books", "amos,genesis").split(",");
const DIR = "data/span-store";
const ix = JSON.parse(readFileSync(`${DIR}/index.json`, "utf8"));
const served = JSON.parse(readFileSync("data/route-store/index.json", "utf8")).m_sources;
const postures = JSON.parse(readFileSync("data/license-postures-v1.json", "utf8")).postures || {};
const ms = { ...served, ...ix.m_sources };
// S1
const files = readdirSync(DIR).filter((f) => f.endsWith(".json") && f !== "index.json");
let places = 0, badRows = 0, badM = 0, rowsSeen = new Set();
for (const f of files) {
  const b = JSON.parse(readFileSync(`${DIR}/${f}`, "utf8"));
  places += b.places;
  if (b.placesList.length !== b.places) badRows += 1;
  for (const p of b.placesList) {
    const rows = b.keys[p.key] || [];
    const ids = new Set(rows.map((r) => r.row_id));
    if (!p.row_ids.every((id) => ids.has(id))) badRows += 1;
    for (const r of rows) { rowsSeen.add(r.row_id); const m = ms[r.slots[3]]; if (!m || !postures[m.licensePosture]) badM += 1; if (r.slots.length !== 7 || typeof r.slots[1] !== "string" || typeof r.slots[2] !== "string") badRows += 1; }
  }
}
check("S1  the served store: places and rows as the lane counted them, every row seven slots, every M licensed", places === ix.counts.places.value && badRows === 0 && badM === 0 && files.length === ix.counts.books.value,
  `${places} places [places] in ${files.length} books (index: ${ix.counts.places.value}, ${ix.counts.books.value}) · ${rowsSeen.size} rows seen under keys · ${badRows} bad places or rows · ${badM} rows with no licensed source`);
check("S4  the sources the shelf lacked resolve with a licence the page knows", ["M197", "M199"].every((id) => ms[id] && postures[ms[id].licensePosture]), Object.keys(ix.m_sources).map((id) => `${id} ${ms[id].licensePosture}`).join(", "));
// S2, S3 on the page
const pw = await loadPlaywright();
const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
for (const book of BOOKS) {
  if (!existsSync(`${DIR}/${book}.json`)) { console.log(`  --  ${book}: no span file; skipped`); continue; }
  await p.goto(`${BASE}?b=${book}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.evaluate(async () => { let g = 0; while (g < 4000) { const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 5)); g += 1; } window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400)); });
  const r2 = await p.evaluate(() => {
    const st = window.__spanStore || { places: 0, laid: 0, skipped: [] };
    const file = window.__spanBook || null;
    // two places the store itself marks as overlapping (neither inside the
    // other) cannot both be cells: the first laid stands, the other is skipped
    const out = { places: st.places, laid: st.laid, overlapped: st.skipped.filter((x) => x.why === "overlaps a laid span" && x.overlaps && x.overlaps.length).length, skipped: st.skipped.filter((x) => !(x.why === "overlaps a laid span" && x.overlaps && x.overlaps.length)).map((x) => `${x.ref} ${x.key}: ${x.why}`), cells: 0, noCell: [], lineBad: [], blobBad: [], chipBad: [] };
    const letters = (t) => [...String(t || "")].filter((c) => c >= "\u05d0" && c <= "\u05ea").join("");
    const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ");
    const cells = [...document.querySelectorAll("section.seg .he-text .wjoin")].filter((c) => c.__run && c.__run.spanKey);
    for (const c of cells) {
      out.cells += 1;
      const key = c.__run.spanKey, rows = c.__run.span ? null : null;
      const words = [...c.querySelectorAll(":scope > .wj-ink > .wb")].filter((w) => !w.classList.contains("mark"));   // a paseq inside the place rides in the cell
      const ink = words.map((w, j) => letters(w.querySelector(".w").textContent) + (j < words.length - 1 ? (/\u05be$/u.test(w.querySelector(".w").textContent.trim()) ? "\u05be" : " ") : "")).join("");
      if (ink !== key) out.noCell.push(`${c.__run.label} ${key}: ink ${ink}`);
      const g = c.querySelector(":scope > .g");
      const cl = g ? g.cloneNode(true) : null; const chip = cl && cl.querySelector(".g-lic"); if (chip) chip.remove();
      const text = cl ? cl.textContent.trim() : "";
      if (!g || g.dataset.span !== key) out.lineBad.push(`${c.__run.label} ${key}: line "${text}" not the store's`);
      if (g && !g.querySelector(".g-lic")) out.chipBad.push(`${c.__run.label} ${key}`);
      if (c.querySelectorAll(":scope > svg.wj-tie").length !== 1) out.blobBad.push(`${c.__run.label} ${key}: ${c.querySelectorAll(":scope > svg.wj-tie").length} blobs`);
    }
    return out;
  });
  check(`S2  ${book}: every place laid as one cell whose ink is the key, one line from the store under a chip, one blob`, r2.laid + r2.overlapped === r2.places && r2.skipped.length === 0 && r2.noCell.length === 0 && r2.lineBad.length === 0 && r2.chipBad.length === 0 && r2.blobBad.length === 0,
    `${r2.laid} of ${r2.places} places laid [places]${r2.overlapped ? ` (${r2.overlapped} overlapping another, as the store marks them, not laid)` : ""} · ${r2.cells} cells on the page` + (r2.skipped.length ? ` · skipped: ${r2.skipped.slice(0, 2).join(" | ")}` : "") + (r2.noCell.length ? ` · ink: ${r2.noCell.slice(0, 2).join(" | ")}` : "") + (r2.lineBad.length ? ` · line: ${r2.lineBad.slice(0, 2).join(" | ")}` : "") + (r2.chipBad.length ? ` · no chip: ${r2.chipBad.slice(0, 2).join(" | ")}` : "") + (r2.blobBad.length ? ` · blob: ${r2.blobBad.slice(0, 2).join(" | ")}` : ""));
  // S3: the first spaced place, the first maqaf place, the first nested place
  const file = JSON.parse(readFileSync(`${DIR}/${book}.json`, "utf8"));
  const picks = [file.placesList.find((x) => x.key.includes(" ") && !x.inside_of && !x.contains.length), file.placesList.find((x) => x.key.includes("\u05be") && !x.inside_of && !x.contains.length), file.placesList.find((x) => x.contains && x.contains.length)].filter(Boolean);
  const r3 = [];
  for (const pl of picks) {
    const got = await p.evaluate(async (pl) => {
      const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === pl.ref);
      const c = sec && [...sec.querySelectorAll(".wjoin")].find((c) => c.__run && c.__run.spanKey === pl.key);
      if (!c) return { err: "no cell" };
      c.scrollIntoView({ block: "center" }); c.querySelector(".wb .w").click();
      const t0 = Date.now(); while (Date.now() - t0 < 8000 && !document.querySelector("#hud .r-pills button")) await new Promise((r) => setTimeout(r, 60));
      await new Promise((r) => setTimeout(r, 600));
      const h = document.getElementById("hud");
      const row = h.querySelector(".b-chain") || h.querySelector(".b-cut");
      const cuts = [...(row ? row.querySelectorAll(".s-pills button") : [])].map((x) => ({ t: x.textContent, on: x.getAttribute("aria-pressed") === "true" }));
      const pills = [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim());
      const d = (h.querySelector(".d-text") || {}).textContent || "";
      const lit = ([...h.querySelectorAll('.r-pills button[aria-pressed="true"]')][0] || {}).textContent || "";
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return { cuts, pills, d, lit: lit.trim(), off: [...(window.__sourcesOff || [])] };
    }, pl);
    // the rows whose source the page has on; identical readings stand as one
    // pill with every record beneath (one-reading-one-pill), so the record
    // shown is that of a row reading as the lit pill reads
    const off = new Set(got.off || []);
    const rows = (file.keys[pl.key] || []).filter((r) => !off.has(r.slots[3]));
    const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ");
    // the pool lowercases to group (one reading, one pill) and cuts a
    // comma list into its senses, so a row's reading stands as one pill or
    // as its pieces, case aside
    const low = (t) => String(t).toLowerCase();
    const pills = (got.pills || []).map(low);
    const asPills = (t) => pills.includes(low(t)) || (t.includes(",") && t.split(",").map((x) => x.trim()).filter(Boolean).every((x) => pills.includes(low(x))));
    const wantR = [...new Set(rows.map((r) => spanJoin(r.slots[1])))];
    const on = got.cuts && got.cuts.find((x) => x.on);
    const litRows = rows.filter((r) => low(spanJoin(r.slots[1])) === low(got.lit));
    const dOk = litRows.some((r) => r.slots[2].trim() === got.d.trim());
    // an inner place stands as a piece of a division of the outer card
    // ("outer + inner"), by its own key
    const rungsOk = pl.contains.every((k) => got.cuts.some((x) => x.t.split(" + ").includes(k)));
    const ok = !got.err && on && on.t === pl.key && rows.length > 0 && low(got.lit) === low(spanJoin(rows[0].slots[1])) && wantR.every(asPills) && dOk && rungsOk;
    r3.push({ ok, say: got.err ? `${pl.ref} ${pl.key}: ${got.err}` : `${pl.ref} ${pl.key}: opens on ${on ? on.t : "nothing"} · lit "${got.lit}" (the store's first: "${rows.length ? spanJoin(rows[0].slots[1]) : "none on"}") · ${wantR.filter(asPills).length} of ${wantR.length} readings among ${got.pills.length} pills · D ${dOk ? "a row's of the lit reading" : "not a row's"}${pl.contains.length ? ` · rungs ${pl.contains.join(",")} ${rungsOk ? "offered" : "missing"}` : ""}` });
  }
  check(`S3  ${book}: a cell's card opens on the span whole, its pills the rows' readings, the record the first row's D, an inner place a rung of the outer card`, r3.length > 0 && r3.every((x) => x.ok), r3.map((x) => x.say).join(" ‖ "));
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
