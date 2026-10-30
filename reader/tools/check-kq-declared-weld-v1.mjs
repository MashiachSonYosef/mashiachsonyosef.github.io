// GUARDS: kq-declared-weld-v1-the-written-form-is-defined-by-what-is-read
//
// THE WRITTEN FORM OF A PAIR IS DEFINED BY WHAT IS READ.
//
// The owner, 2026-10-30, of the card at a pair whose written letters the
// catalog also reads as other words (Mizzah, "exhausted", "one who sprinkles"
// under the letters the Masorah reads as "what is this"): "i see this is not
// right"; and the rule he asked for: "the card specifically saying 'this exact
// spelling actually means what this exact spelling means'". A weld is right
// where a source declares the equivalence and wrong where the page infers it
// from the ink. The Masorah's note, carried verbatim by the licensed source,
// declares this one: written so, read so. So a ketiv is a spelling, not a
// key, and on a served book with source-marked pairs:
//
//   KW1  at a pair whose written letters the catalog reads as other words
//        (derived: a pair on disk whose written key has a baked lead and whose
//        place reading spells the read words joined), the written branch's
//        readings are the place's own readings and pointer pills that name a
//        read word; no pill stands on the catalog's rows under the written
//        letters alone
//   KW2  the row says so, in words: written X, read Y, and how many readings
//        of these letters as other words it withheld; the count on the row
//        is the count the page exposes, and at that pair it is at least one
//   KW3  the read branch is untouched: no pointer pill, no such note, nothing
//        withheld by the weld
//   KW4  the line under the pair and its Hebrew never change through opening
//        the card and pressing every branch (rule 1, kq-shapes)
//   KW5  where the source's own reading of the place spells the read words
//        joined, the line reads it (with its source's chip), never the baked
//        lead of the written letters
//   KW6  at a pair with no place reading and a read half (derived), the line
//        never prints the baked lead of the written letters: the read half's,
//        or nothing
//   KW7  a pointer pill ruled on the written branch prints on the line with
//        its read word, as the pill prints; reset puts the line back
//   KW8  a word that is no pair has no such note and no pointer pill
//
// Sites are derived from the zones on disk, never typed here.
// Run: SERVE_PORT=<port> node tools/check-kq-declared-weld-v1.mjs
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesServed, defaultZoneUrl } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ZONES = join(HERE, "..", "data", "zones");
const BASE = defaultZoneUrl().split("?")[0];
let failed = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "  ok " : "FAIL "} ${name}${detail ? `  ·  ${detail}` : ""}`); if (!ok) failed += 1; };
const fold = (t) => String(t || "").replace(/\s+/gu, " ").replace(/\.$/u, "").trim().toLowerCase();
const bare = (t) => String(t || "").replace(/[\u0591-\u05c7​-‏\[\]()]/gu, "").trim();
const spanJoin = (t) => String(t || "").replace(/\s*\/\s*/gu, " + ").replace(/\.$/u, "").trim();

// ---- the sites, read off the shelf ------------------------------------
const sites = { homograph: null, noPlace: null, plain: null };
// the served zones only: an unserved bin is a page the gate refuses
for (const slug of zonesServed(ZONES)) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, `${slug}.bin`))).toString("utf8")); } catch { continue; }
  const gl = z.gloss || {};
  for (const sec of z.sections || []) {
    const words = sec.words || [];
    for (let i = 0; i < words.length; i += 1) {
      const w = words[i];
      const addr = `${sec.label}:${i + 1}`;
      if (!w.kq || !Array.isArray(w.w)) { if (!sites.plain && sites.homograph && w.k && !w.kq && gl[w.k]) sites.plain = { slug, addr, s: w.s }; continue; }
      const reads = w.w.filter((r) => r.role === "QERE"), writes = w.w.filter((r) => r.role === "KETIV");
      if (!reads.length || !writes.length) continue;
      const spelled = Array.isArray(w.pg) ? w.pg.map((x) => (x && x.k) || "").join("") : "";
      const kLead = writes.map((r) => gl[r.k]).find((g) => g && g !== "—");
      const qLead = reads.map((r) => gl[r.k]).find((g) => g && g !== "—");
      // the written form must stand as one block of its own: where the read
      // words' letters tile the written letters exactly, the card opens on
      // the source's division and the whole-form rung is a press away
      if (!sites.homograph && kLead && reads.length > 1 && reads.map((r) => r.k).join("") === spelled && spelled && reads.map((r) => r.k).join("") !== writes.map((r) => r.k).join(""))
        sites.homograph = { slug, addr, s: w.s, k: w.kq.k, q: w.kq.q, reads: reads.map((r) => bare(r.s || r.k)), place: w.pg.map((p) => String(p.g).trim()).join(" + "), kLead };
      if (!sites.noPlace && !spelled && kLead && qLead && kLead !== qLead && reads.length === 1 && writes.length === 1)
        sites.noPlace = { slug, addr, s: w.s, k: w.kq.k, q: w.kq.q, kLead, qLead };
    }
  }
  if (sites.homograph && sites.noPlace && sites.plain) break;
  if (sites.homograph && !sites.plain) { const H = sites.homograph; if (H.slug !== slug) { /* keep looking in later zones */ } }
}
check("KW0  the shelf holds the sites this check needs: a pair whose written letters the catalog reads otherwise and whose source spells the read words joined; a pair with no place reading; a plain word",
  !!(sites.homograph && sites.noPlace && sites.plain), JSON.stringify({ homograph: sites.homograph && `${sites.homograph.slug} ${sites.homograph.addr}`, noPlace: sites.noPlace && `${sites.noPlace.slug} ${sites.noPlace.addr}`, plain: sites.plain && `${sites.plain.slug} ${sites.plain.addr}` }));
if (!sites.homograph || !sites.plain) { console.log("SKIPPED \u2014 no served pair on disk meets the sites this check needs"); process.exit(3); }

// ---- the page -----------------------------------------------------------
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());
const ctx = await browser.newContext({ viewport: { width: 1100, height: 1400 } });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const openAt = async (slug, addr) => {
  await p.goto(`${BASE}?b=${slug}#${addr}`, { waitUntil: "load" });
  await p.waitForSelector("#hud .head b", { timeout: 60000 });
  await p.waitForFunction(() => window.__pool && window.__pool.length, null, { timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(900);
};
const cell = () => p.evaluate(() => {
  const w = document.querySelector(".wb.active") || document.querySelector(".wb.on");
  if (!w) return null;
  const g = w.querySelector(":scope > .g");
  const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  const chip = g && g.querySelector(".g-lic");
  return { he: (w.querySelector(":scope > .w") || w).textContent.replace(/\s+/g, " ").trim(), en: c ? c.textContent.replace(/\s+/g, " ").trim() : null, chip: chip ? chip.textContent.trim() : null };
});
const card = () => p.evaluate(() => {
  const hud = document.getElementById("hud");
  const t = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
  const box = [...hud.querySelectorAll(".rows .band")].find((b) => /Exact selectable routes/.test(t(b.querySelector(".r-label")) || ""));
  const pillsEl = box ? box.querySelector(".r-pills") : null;
  const pills = box ? [...box.querySelectorAll(".r-pills button")] : [];
  return {
    role: t(hud.querySelector(".head .kq-role")),
    pills: pills.map((x, i) => ({ t: t(x), read: x.dataset.read || "", place: !!(window.__poolPlace || [])[i], kq: (window.__poolKq || [])[i] || "", pressed: x.getAttribute("aria-pressed") === "true" })),
    withheld: pillsEl ? Number(pillsEl.dataset.kqWithheld || 0) : null,
    note: t(hud.querySelector(".kq-weld")),
    forms: [...hud.querySelectorAll(".s-pills button")].filter((x) => /ketiv|qere/u.test(x.textContent)).map((x) => ({ t: t(x), role: /ketiv/u.test(x.textContent) ? "KETIV" : "QERE", pressed: x.getAttribute("aria-pressed") === "true" })),
  };
});
const pressForm = async (role, nth = 0) => {
  // the pool is cleared before the press, so the wait is for THIS card's pool
  await p.evaluate(() => { window.__pool = null; });
  const did = await p.evaluate(([role, nth]) => {
    const re = role === "KETIV" ? /ketiv/u : /qere/u;
    const btns = [...document.querySelectorAll("#hud .s-pills button")].filter((x) => re.test(x.textContent));
    const b = btns[nth]; if (!b) return false; if (b.getAttribute("aria-pressed") === "true") return true; b.click(); return true;
  }, [role, nth]);
  await p.waitForTimeout(1500);
  await p.waitForFunction(() => window.__pool && window.__pool.length, null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(600);
  return did;
};

// KW1-KW5 at the homograph site
const H = sites.homograph;
await openAt(H.slug, H.addr);
const line0 = await cell();
const c0 = await card();
await pressForm("KETIV");
const lineK = await cell();
const cK = await card();
const readsBare = new Set(H.reads.map(bare));
const onWritten = cK.forms.some((f) => f.role === "KETIV" && f.pressed) && /ketiv/u.test(cK.role || "");
const catalogOnly = cK.pills.filter((x) => !x.place && !x.read);
const pointersNamed = cK.pills.filter((x) => x.read).every((x) => readsBare.has(bare(x.read)) && new RegExp(`\\(read ${x.read.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\)$`, "u").test(x.t));
check("KW1  on the written branch every reading is the place's own or a pointer naming a read word; none stands on the catalog's rows under the written letters alone",
  onWritten && cK.pills.length > 0 && catalogOnly.length === 0 && cK.pills.some((x) => x.read) && pointersNamed,
  `${H.slug} ${H.addr} · written branch ${onWritten} · pills ${cK.pills.length} · catalog-only ${catalogOnly.length} · pointers ${cK.pills.filter((x) => x.read).length} named right ${pointersNamed} · first ${JSON.stringify(cK.pills.slice(0, 3).map((x) => x.t))}`);
const noteN = cK.note ? Number((cK.note.match(/(\d+) readings? of these letters/u) || [])[1] || 0) : -1;
check("KW2  the row says written X, read Y, and how many readings of these letters as other words it withheld; that count is the exposed count and is at least one here",
  !!cK.note && cK.note.includes(`written ${bare(H.k)}`) && cK.note.includes("read ") && noteN === cK.withheld && cK.withheld >= 1,
  `note "${cK.note}" · exposed ${cK.withheld}`);
await pressForm("QERE");
const lineQ = await cell();
const cQ = await card();
check("KW3  the read branch is untouched: no pointer pill, no note, nothing withheld by the weld",
  cQ.forms.some((f) => f.role === "QERE" && f.pressed) && cQ.pills.length > 0 && cQ.pills.every((x) => !x.read) && !cQ.note && cQ.withheld === 0,
  `pills ${cQ.pills.length} · pointers ${cQ.pills.filter((x) => x.read).length} · note ${JSON.stringify(cQ.note)} · withheld ${cQ.withheld}`);
check("KW4  the line under the pair and its Hebrew never changed through the card and every branch press",
  !!line0 && JSON.stringify(line0) === JSON.stringify(lineK) && JSON.stringify(lineK) === JSON.stringify(lineQ),
  `${JSON.stringify(line0)} · after written ${JSON.stringify(lineK)} · after read ${JSON.stringify(lineQ)}`);
check("KW5  where the source spells the read words joined, the line reads the source's own reading of the place, never the written letters' baked lead",
  !!line0 && fold(line0.en) === fold(spanJoin(H.place)) && fold(line0.en) !== fold(H.kLead) && !!line0.chip,
  `line "${line0 && line0.en}" · the place reads "${spanJoin(H.place)}" · the written letters' lead "${H.kLead}" · chip ${line0 && line0.chip}`);

// KW7 — a pointer pill ruled on the written branch
await pressForm("KETIV");
const ruled = await p.evaluate(async () => {
  const wait = (ms) => new Promise((x) => setTimeout(x, ms));
  const pill = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((x) => x.dataset.read && x.getAttribute("aria-pressed") !== "true");
  if (!pill) return { err: "no pointer pill to press" };
  const text = pill.textContent.replace(/\s+/g, " ").trim(); pill.click(); await wait(1000);
  return { text };
});
const lineR = await cell();
check("KW7  a pointer pill ruled on the written branch prints on the line with its read word, as the pill prints",
  !ruled.err && !!lineR && fold(lineR.en) === fold(ruled.text), ruled.err || `pressed "${ruled.text}" · line "${lineR && lineR.en}"`);
await p.evaluate(() => { const x = document.querySelector("#hud button[aria-label='Close']"); if (x) x.click(); });
await p.waitForTimeout(400);
const resetDid = await p.evaluate(() => { const r = document.getElementById("resetPill"); if (!r) return false; r.click(); return true; });
await p.waitForTimeout(1200);
// the word is found by its address after the card is closed, not by the open mark
const lineBack = await p.evaluate((addr) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent === addr.split(":").slice(0, 2).join(":"));
  const w = sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")][Number(addr.split(":")[2]) - 1] : null;
  if (!w) return null;
  const g = w.querySelector(":scope > .g"); const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  return { en: c ? c.textContent.replace(/\s+/g, " ").trim() : null };
}, H.addr);
check("KW7  reset puts the line back", resetDid && !!lineBack && fold(lineBack.en) === fold(line0.en), `reset ${resetDid} · line "${lineBack && lineBack.en}" was "${line0.en}"`);

// KW6 — a pair with no place reading
if (sites.noPlace) {
  const N = sites.noPlace;
  await openAt(N.slug, N.addr);
  const lineN = await cell();
  check("KW6  at a pair with no place reading, the line never prints the baked lead of the written letters",
    !!lineN && fold(lineN.en) !== fold(N.kLead) && (fold(lineN.en) === fold(N.qLead) || !lineN.en),
    `${N.slug} ${N.addr} · line "${lineN && lineN.en}" · written letters' lead "${N.kLead}" · read half's lead "${N.qLead}"`);
} else console.log("  --  KW6 not witnessed: no pair on disk without a place reading whose two halves both have a lead");

// KW8 — a plain word
const P = sites.plain;
await openAt(P.slug, P.addr);
const cP = await card();
check("KW8  a word that is no pair has no such note and no pointer pill", !cP.note && cP.pills.every((x) => !x.read) && cP.withheld === 0,
  `${P.slug} ${P.addr} · note ${JSON.stringify(cP.note)} · pointers ${cP.pills.filter((x) => x.read).length}`);
check("KW9  the page raised no error through all of it", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();
console.log(failed ? `\n${failed} FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
