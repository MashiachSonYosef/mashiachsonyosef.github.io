// check-overlays-v1 · an overlay's rows are rows like the store's, and its chips switch them
//
// GUARDS: overlay-rule-v2-an-overlay-row-is-a-row-like-the-stores
// LEDGER: -
// no frame letter. This writes nothing: it reads the overlays the reader serves
// and the page it draws.
//
// The owner ruled Jastrow and Samaritan in on 2026-10-02 (data/serving-rulings-v1.json,
// jastrow-served and samaritan-served). Each is served beside the route store under
// data/overlays/<id>/, never merged into it. Since 2026-10-03 each of their sources
// is a chip on the sources row like every other dictionary ("samaritan just goes in
// as another of the 36 dictionaries afaik, same for jastrow"), and their rows are
// grouped, sorted and credited like any other's ("i wouldnt autosort jastrow or
// samaritans last, no, just treat them normal"). What must hold:
//
//   O1  every overlay beside the store is the corpus lane's delivery, file for file:
//       sha256 and size against the manifest that came with it
//   O2  the page loads each overlay and draws its sources as chips on the sources
//       row, pressed on, and pressed off when the reader turned them off
//   O3  with their chips off, no card holds a reading only they give, and no
//       reading is carried by one of their sources
//   O4  with them on, every reading the card holds with them off is still there,
//       and every reading they add is carried by one of their sources
//   O5  the line under every word is the same with the chips on and off
//   O6  an overlay's reading, opened, names its overlay in the card
//   O7  an overlay's reading is one pill: it joins the pill that prints the same and
//       never stands beside it, so the chips add no reading printed twice (the store's
//       own period-split pills, "womb" and "womb.", wait on the bake and are counted)
//
// Run: node tools/check-overlays-v1.mjs [zone url]   (with python3 -m http.server 8899 in reader/)
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const OVERLAYS = ["jastrow", "samaritan"].filter((id) => existsSync(join("data", "overlays", id, "index.json")));
if (!OVERLAYS.length) { console.log("SKIPPED — no overlay beside the store (data/overlays/<id>/index.json)"); process.exit(3); }
for (const id of OVERLAYS) {
  const dir = join("data", "overlays", id);
  const man = JSON.parse(readFileSync(join(dir, "MANIFEST-overlay-v1.json"), "utf8"));
  const off = man.files.filter((f) => {
    const p = join(dir, f.path);
    if (!existsSync(p)) return true;
    const b = readFileSync(p);
    return b.length !== f.bytes || createHash("sha256").update(b).digest("hex") !== f.sha256;
  });
  check(`O1  the ${id} overlay is the corpus lane's delivery, file for file`, off.length === 0,
    off.length ? `${off.length} of ${man.files.length} differ: ${off.slice(0, 4).map((f) => f.path).join(", ")}` : `${man.files.length} files · store_version ${man.store_version}`);
}

// the resting-off record's version, so a pass sets its own state over it
const DEFAULTS_VER = existsSync(join("data", "source-defaults-v1.json")) ? String(JSON.parse(readFileSync(join("data", "source-defaults-v1.json"), "utf8")).version || "") : "";
// every source id the overlays bring, read off their own indexes
const OV_IDS = [];
for (const id of OVERLAYS) for (const m of Object.keys(JSON.parse(readFileSync(join("data", "overlays", id, "index.json"), "utf8")).m_sources || {})) OV_IDS.push(m);

const pw = await loadPlaywright();
const URL0 = defaultZoneUrl();
const BASE = URL0.split("?")[0];
const BOOK = (URL0.match(/[?&]b=([^&]+)/) || [])[1] || "daniel";
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
const SAMPLE = 30;

const pass = async (state) => {
  await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" });
  await p.evaluate(({ ovs, ids, off, ver }) => {
    for (const id of ovs) localStorage.removeItem(`fh.overlay.${id}`);
    // a reader who has seen the resting-off defaults (source-defaults-rule-v1)
    // and set every chip as this pass asks
    localStorage.setItem("fh.sources.defaults", ver);
    localStorage.setItem("fh.sources.off", JSON.stringify(off ? ids : []));
  }, { ovs: OVERLAYS, ids: OV_IDS, off: state === "off", ver: DEFAULTS_VER });
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  // the sources row is drawn once the page's records have arrived, which can
  // be after the first words are on screen: wait for its chips, not a clock
  await p.waitForFunction(() => document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp').length > 0, null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(500);
  const lines = await p.evaluate(() => [...document.querySelectorAll(".wb > .g, .wjoin > .g")].slice(0, 400).map((g) => g.textContent));
  const meta = await p.evaluate(() => ({ overlays: window.__overlays || [],
    chips: [...document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp[data-ids]')].map((c) => ({ ids: c.dataset.ids.split(" "), on: c.getAttribute("aria-pressed") === "true" })) }));
  const cards = [];
  const n = await p.evaluate(() => document.querySelectorAll("section.seg .he-text .wb").length);
  for (let i = 0; i < Math.min(SAMPLE, n); i += 1) {
    const got = await p.evaluate(async (i) => {
      const w = document.querySelectorAll("section.seg .he-text .wb")[i];
      window.__pool = null; window.__poolOv = null;
      (w.querySelector(".w span") || w.querySelector(".w")).click();
      const t0 = Date.now(); while (Date.now() - t0 < 6000 && !window.__pool) await new Promise((r) => setTimeout(r, 40));
      const out = { pool: window.__pool || [], ov: window.__poolOv || [], lead: window.__poolLead || [], by: window.__poolBy || [] };
      const x = document.querySelector("#hud .head button"); if (x) x.click();
      return out;
    }, i);
    cards.push(got);
  }
  return { lines, meta, cards };
};

const on = await pass("on");
const off = await pass("off");
for (const id of OVERLAYS) {
  const mine = new Set(Object.keys(JSON.parse(readFileSync(join("data", "overlays", id, "index.json"), "utf8")).m_sources || {}));
  const chipsOn = on.meta.chips.filter((c) => c.ids.some((m) => mine.has(m)));
  const chipsOff = off.meta.chips.filter((c) => c.ids.some((m) => mine.has(m)));
  check(`O2  the ${id} overlay loads and its sources are chips on the sources row, on and off as the reader set them`,
    on.meta.overlays.includes(id) && chipsOn.length > 0 && chipsOn.every((c) => c.on) && chipsOff.length === chipsOn.length && chipsOff.every((c) => !c.on),
    `${chipsOn.length} chip${chipsOn.length === 1 ? "" : "s"} · on: ${chipsOn.filter((c) => c.on).length} pressed · off: ${chipsOff.filter((c) => !c.on).length} released`);
}
const ovIdSet = new Set(OV_IDS);
const carriedByOv = (by) => String(by || "").split(" ").some((m) => ovIdSet.has(m));
const leaked = off.cards.filter((c) => c.ov.some(Boolean) || c.by.some(carriedByOv)).length;
check("O3  with their chips off, no card holds a reading only they give, and none is carried by their sources", leaked === 0, `${off.cards.length} cards · ${leaked} with an overlay reading or carrier`);
let lost = 0, unbacked = 0, added = 0, ovLed = 0;
on.cards.forEach((c, i) => {
  const o = off.cards[i];
  const had = new Set(o.pool);
  if (o.pool.some((t) => !c.pool.includes(t))) lost += 1;
  c.pool.forEach((t, k) => { if (!had.has(t)) { added += 1; if (!carriedByOv(c.by[k])) unbacked += 1; } if (ovIdSet.has(c.lead[k])) ovLed += 1; });
});
check("O4  on, every reading the card holds off is still there, and every reading added is carried by an overlay's source", lost === 0 && unbacked === 0,
  `${on.cards.length} cards · ${added} readings added · ${lost} cards that lost a reading · ${unbacked} added readings no overlay source carries · ${ovLed} pills credited to an overlay's source, sorted like any other`);
const diffLines = on.lines.filter((t, i) => t !== off.lines[i]).length;
check("O5  the line under every word is the same on and off", diffLines === 0 && on.lines.length === off.lines.length, `${on.lines.length} lines · ${diffLines} differ`);

// O7 · an overlay's reading is one pill
{
  const twice = (c) => { const n = new Map(); c.pool.forEach((t) => n.set(t.toLowerCase(), (n.get(t.toLowerCase()) || 0) + 1)); return [...n].filter(([, k]) => k > 1).map(([t]) => t); };
  let beside = 0, shared = 0, storeTwice = 0;
  on.cards.forEach((c, i) => {
    const dupOn = twice(c), dupOff = new Set(twice(off.cards[i]));
    storeTwice += dupOff.size;
    // a reading printed twice with the chips on that was not printed twice off, or a twice-printed reading one of whose pills only an overlay carries
    for (const t of dupOn) if (!dupOff.has(t) || c.pool.some((x, k) => x.toLowerCase() === t && c.ov[k])) beside += 1;
    c.by.forEach((by) => { const ids = String(by || "").split(" "); if (ids.some((m) => ovIdSet.has(m)) && ids.some((m) => m && !ovIdSet.has(m))) shared += 1; });
  });
  check("O7  an overlay's reading is one pill: it joins the pill that prints the same, never stands beside it", beside === 0,
    `${shared} pills carried by an overlay's source and the store's together · ${beside} overlay readings printed beside a pill that prints the same · ${storeTwice} store readings printed twice by a closing period, waiting on the bake`);
}

// O6 · open one overlay reading and read its mark
const pick = on.cards.findIndex((c) => c.ov.some(Boolean));
if (pick < 0) check("O6  an overlay's reading names its overlay in the card", false, `no overlay reading among the first ${SAMPLE} cards of ${BOOK}`);
else {
  await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" });
  await p.evaluate((ver) => { localStorage.setItem("fh.sources.defaults", ver); localStorage.setItem("fh.sources.off", "[]"); }, DEFAULTS_VER);
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const want = on.cards[pick].pool[on.cards[pick].ov.findIndex(Boolean)];
  const mark = await p.evaluate(async ({ i, want }) => {
    const w = document.querySelectorAll("section.seg .he-text .wb")[i];
    window.__pool = null;
    (w.querySelector(".w span") || w.querySelector(".w")).click();
    const t0 = Date.now(); while (Date.now() - t0 < 6000 && !window.__pool) await new Promise((r) => setTimeout(r, 40));
    const btn = [...document.querySelectorAll("#hud .r-pills button")].find((x) => x.textContent.trim() === want);
    if (btn) btn.click();
    else {
      const sel = document.querySelector("#hud .r-overflow select");
      const opt = sel && [...sel.options].find((o) => o.textContent.trim() === want);
      if (!opt) return { how: "not offered", marks: [] };
      sel.value = opt.value; sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await new Promise((r) => setTimeout(r, 300));
    return { how: btn ? "pill" : "list", marks: [...document.querySelectorAll("#hud .d-card .att .ov-mark")].map((s) => s.textContent) };
  }, { i: pick, want });
  check("O6  an overlay's reading names its overlay in the card", mark.marks.length > 0, `"${want}" by ${mark.how} · marks: ${mark.marks.join(", ") || "none"}`);
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
