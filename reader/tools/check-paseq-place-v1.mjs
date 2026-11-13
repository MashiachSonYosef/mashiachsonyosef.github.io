#!/usr/bin/env node
// RUN: tree
// GUARDS: paseq-place-rule-v1-a-paseq-the-edition-writes-inside-a-read-form-prints-there-and-not-after-the-place
// LEDGER: -
// no frame letter. A check reads the list's pin, the zones and the pages and
// judges them; it is not the ledger for one.
//
// A PASEQ THE EDITION WRITES INSIDE A READ FORM PRINTS THERE. At 16 places
// written one way and read another, Miqra according to the Masorah writes a
// paseq inside the read form, and the corpus lane's restore v5 stood each
// after the whole place (the lane's relay v179, 13 November 2026, mending
// its own defect named in v167). tools/apply-paseq-place-v1.mjs writes the
// lane's list on the zones; the page prints the stroke there, with the
// marks. The laws:
//
//   P1  the pin's three files are the bytes it names, and the list is its
//       count of lines
//   P2  every line's place on its zone carries the stroke's glyph and the
//       read word it follows, the glyph being the mark's own; the mark after
//       it is a paseq that says it prints in the read form; the zone's
//       record names the list and these places, and its write is typed; no
//       other word of any zone carries either fact
//   P3  on the page with the marks off, each place prints its carrier and
//       nothing else: the stroke takes no room, and the mark's own block
//       does not show
//   P4  with the marks on, each place prints as the line's `prints` (with
//       the word a maqaf joins to it), the stroke drawn where the edition
//       writes it; the mark's own block still does not show; and the place's
//       text is still its carrier, for everything that reads it
//   P5  a press on the stroke opens the paseq's own card
//   P6  the export writes each listed verse's Hebrew as the lane's list
//       has the verse with the stroke in place (stream_line_in_place),
//       character for character: the stroke inside the read form, nothing
//       at the mark's own position
//
// Run: node tools/check-paseq-place-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { EXEMPTION_RULE_ID } from "./zone-post-build-v1.mjs";

const RULE = "paseq-place-rule-v1-a-paseq-the-edition-writes-inside-a-read-form-prints-there-and-not-after-the-place";
const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
const PIN = join(K3, "data", "paseq-place", "PIN.json");
const sha = (b) => createHash("sha256").update(b).digest("hex");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const first = (xs, k = 3) => xs.slice(0, k).join(" · ") + (xs.length > k ? ` · and ${xs.length - k} more` : "");

if (!existsSync(PIN)) { console.log("SKIPPED — no list of paseq places on this disk (data/paseq-place/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(PIN, "utf8"));

// ---- P1: the pin ------------------------------------------------------------------------------------
let LINES = [];
{
  const faults = [];
  const folder = join(dirname(PIN), pin.folder || "");
  for (const d of [pin.rule, pin.receipt, pin.places]) {
    const p = join(folder, (d || {}).file || "");
    if (!d || !existsSync(p)) { faults.push(`${(d || {}).file || "a file"} is not on disk`); continue; }
    const b = readFileSync(p);
    if (b.length !== d.bytes || sha(b) !== d.sha256) faults.push(`${d.file}: ${b.length} bytes, ${sha(b).slice(0, 12)}; the pin names ${d.bytes}, ${String(d.sha256).slice(0, 12)}`);
    if (d === pin.places) LINES = b.toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  }
  if (LINES.length !== (pin.places || {}).lines) faults.push(`the list holds ${LINES.length} lines; the pin names ${(pin.places || {}).lines}`);
  check("P1  the pin's three files are the bytes it names, and the list is its count of lines", pin.schema_version === "PASEQ_PLACE_PIN_V1" && !faults.length,
    faults.length ? first(faults) : `relay ${pin.relay} · ${LINES.length} places · list ${pin.places.sha256.slice(0, 12)}`);
}

// ---- P2: the zones ----------------------------------------------------------------------------------
const zoneOf = new Map();
const readZone = (book) => { if (!zoneOf.has(book)) zoneOf.set(book, JSON.parse(gunzipSync(readFileSync(join(ZONES, `${book}.bin`))).toString("utf8"))); return zoneOf.get(book); };
const placeOf = (zone, line) => {
  const sec = (zone.sections || []).find((s) => s.label === line.ref);
  if (!sec) return null;
  const n = Number(String(line.place).split(":")[2]);
  let count = 0, i = -1;
  sec.words.forEach((w, j) => { if (!w.mark && (count += 1) === n) i = j; });
  return i < 0 ? null : { sec, i, n, site: sec.words[i], mark: sec.words[i + 1], before: sec.words[i - 1] };
};
{
  const faults = [], owned = new Set();
  const books = new Set();
  for (const line of LINES) {
    const at = `${line.book} ${line.place}`;
    if (!existsSync(join(ZONES, `${line.book}.bin`))) { faults.push(`${at}: no zone`); continue; }
    const zone = readZone(line.book);
    const p = placeOf(zone, line);
    if (!p) { faults.push(`${at}: no such place`); continue; }
    const st = p.site.kq && p.site.kq.stroke;
    if (!st || st.after_read_word !== line.the_stroke_follows_read_word || !p.mark || st.s !== p.mark.s)
      faults.push(`${at}: the place carries ${JSON.stringify(st || null)}; the line's stroke follows read word ${line.the_stroke_follows_read_word}, and the mark after it is ${p.mark ? p.mark.s : "none"}`);
    if (!p.mark || !p.mark.mark || p.mark.mark.kind !== "PASEQ" || p.mark.mark.in_read_form !== true)
      faults.push(`${at}: the word after the place is ${p.mark ? JSON.stringify(p.mark.mark || p.mark.s) : "none"}, not a paseq that prints in the read form`);
    if (p.site.s !== (line.lattice_v12 || {}).site.surface) faults.push(`${at}: the place reads ${p.site.s}, the lattice's site ${line.lattice_v12.site.surface}`);
    owned.add(p.site); owned.add(p.mark);
    books.add(line.book);
  }
  for (const book of books) {
    const z = readZone(book), rec = (z.emitted_from || {}).paseq_place, pb = (z.emitted_from || {}).post_build;
    const mine = LINES.filter((l) => l.book === book).map((l) => l.place).sort().join(",");
    if (!rec || rec.rule_id !== RULE || !rec.places || rec.places.sha256 !== pin.places.sha256 || (rec.here || []).map((h) => h.place).sort().join(",") !== mine)
      faults.push(`${book}: the zone's record ${rec ? `names ${(rec.here || []).length} place(s) of list ${String((rec.places || {}).sha256).slice(0, 12)}` : "is missing"}; the list holds ${mine}`);
    if (!pb || pb.rule_id !== EXEMPTION_RULE_ID || !(pb.wrote || []).includes("emitted_from.paseq_place") || !String(pb.by).includes("tools/apply-paseq-place-v1.mjs"))
      faults.push(`${book}: the write is not typed on the zone (emitted_from.post_build)`);
  }
  for (const f of readdirSync(ZONES).filter((x) => /^[a-z0-9-]+\.bin$/u.test(x))) {
    const z = readZone(f.replace(/\.bin$/u, ""));
    for (const sec of z.sections || []) for (const w of sec.words || [])
      if (((w.kq && w.kq.stroke !== undefined) || (w.mark && w.mark.in_read_form !== undefined)) && !owned.has(w)) { faults.push(`${f} ${sec.label}: ${w.s} carries a paseq-place fact no line names`); }
  }
  check("P2  every line's place carries the stroke and the read word it follows, the mark after it says it prints there, each zone's record names the list and its write is typed, and no other word carries either fact",
    !faults.length, faults.length ? first(faults) : `${LINES.length} places on ${books.size} zones · no fact elsewhere`);
}

// ---- P3, P4, P5: the page ---------------------------------------------------------------------------
const tree = await serveTree(K3);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const off = [], on = [], pressed = [], drew = [], exported = [];
// the text as drawn: the text nodes, and the stroke's span as the glyph its style draws, set off by the space the
// style's margin stands for
const READ = ({ label, n }) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
  const blocks = [...sec.querySelectorAll(".he-text .wb")];
  const site = blocks.filter((b) => !b.classList.contains("mark"))[n - 1];
  const at = blocks.indexOf(site);
  const drawn = (el) => {
    let out = "";
    const walk = (node) => {
      for (const c of node.childNodes) {
        if (c.nodeType === 3) out += c.data;
        else if (c.classList && c.classList.contains("kq-stroke")) {
          const ct = getComputedStyle(c, "::before").content;
          if (ct && ct !== "none" && ct !== "normal") out += ` ${JSON.parse(ct)}`;
        } else walk(c);
      }
    };
    walk(el);
    return out;
  };
  const w = site.querySelector(":scope > .w"), st = site.querySelector(".kq-stroke"), mark = blocks[at + 1];
  return {
    text: w.textContent, drawn: drawn(w), strokes: site.querySelectorAll(".kq-stroke").length,
    room: st ? Math.round(st.getBoundingClientRect().width) : null,
    markShows: mark ? getComputedStyle(mark).display !== "none" : null,
    before: at > 0 ? blocks[at - 1].querySelector(":scope > .w").textContent : "",
  };
};
try {
  for (const book of [...new Set(LINES.map((l) => l.book))]) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, acceptDownloads: true });
    try {
      await page.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
      await page.waitForSelector("section.seg", { state: "attached", timeout: 60000 });
      for (const line of LINES.filter((l) => l.book === book)) try {
        const at = `${book} ${line.place}`;
        const zp = placeOf(readZone(book), line);
        const label = line.ref, n = Number(String(line.place).split(":")[2]);
        const ready = await page.evaluate(async (label) => {
          const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
          if (!sec) return false;
          sec.scrollIntoView({ block: "center" });
          for (let i = 0; i < 150 && !sec.querySelector(".he-text .wb"); i += 1) await new Promise((r) => setTimeout(r, 100));
          return !!sec.querySelector(".he-text .wb");
        }, label);
        if (!ready) { off.push(`${at}: the section was not drawn`); continue; }
        drew.push(at);
        await page.evaluate(() => document.body.classList.remove("marks-on"));
        const a = await page.evaluate(READ, { label, n });
        if (a.text !== zp.site.s || a.drawn !== zp.site.s || a.room !== 0 || a.markShows !== false || a.strokes !== 1)
          off.push(`${at}: drew "${a.drawn}" (text "${a.text}"), the stroke ${a.strokes} span(s) taking ${a.room}px, the mark's block ${a.markShows ? "shows" : "hidden"}`);
        await page.evaluate(() => document.body.classList.add("marks-on"));
        const b = await page.evaluate(READ, { label, n });
        const joined = (line.lattice_v12.site.part != null ? b.before : "") + b.drawn;
        if (joined !== line.prints || b.text !== zp.site.s || b.markShows !== false || !(b.room > 0))
          on.push(`${at}: drew "${joined}", the line prints "${line.prints}"; text "${b.text}"; the mark's block ${b.markShows ? "shows" : "hidden"}; the stroke takes ${b.room}px`);
        const said = await page.evaluate(async ({ label, n }) => {
          const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
          const site = [...sec.querySelectorAll(".he-text .wb")].filter((x) => !x.classList.contains("mark"))[n - 1];
          const st = site.querySelector(".kq-stroke");
          if (!st) return null;
          const hud = document.getElementById("hud");
          if (hud) { hud.hidden = true; hud.replaceChildren(); }
          st.click();
          const open = () => !!hud && !hud.hidden;
          for (let i = 0; i < 30 && !open(); i += 1) await new Promise((r) => setTimeout(r, 100));
          return open() ? hud.textContent.replace(/\s+/g, " ") : "";
        }, { label, n });
        if (said === null) pressed.push(`${at}: the page drew no stroke to press`);
        else if (!said.includes(zp.mark.mark.says)) pressed.push(`${at}: the card said "${said.slice(0, 120)}"`);
        await page.evaluate(() => { document.body.classList.remove("marks-on"); const h = document.getElementById("hud"); if (h) h.hidden = true; });
        // the verse's Hebrew as the export writes it: the section's own row of its menu, the Hebrew kind, pressed twice
        const armed = await page.evaluate(async (label) => {
          document.querySelectorAll(".xp.armed").forEach((x) => x.click());
          document.querySelectorAll("section.seg[data-paseq]").forEach((x) => x.removeAttribute("data-paseq"));
          const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
          sec.setAttribute("data-paseq", "1");
          if (!sec.querySelector(".xp-menu .xp-row .xp")) { const o = sec.querySelector(".xp-open"); if (o) o.click(); }
          for (let i = 0; i < 50 && !sec.querySelector(".xp-menu .xp-row .xp"); i += 1) await new Promise((r) => setTimeout(r, 100));
          return !!sec.querySelector(".xp-menu .xp-row .xp");
        }, label);
        const want = String(line.stream_line_in_place).split("\t").slice(1).join("\t");
        if (!armed) { exported.push(`${at}: the section's export menu did not open`); continue; }
        await page.click("section.seg[data-paseq] .xp-menu .xp-row:first-of-type .xp:nth-of-type(1)");
        await page.waitForFunction(() => /Press again/.test(document.querySelector("section.seg[data-paseq] .xp-note")?.textContent || ""), { timeout: 25000 });
        const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 25000 }), page.click("section.seg[data-paseq] .xp-row .xp.armed")]);
        const file = readFileSync(await dl.path(), "utf8").split("\n");
        const head = file.findIndex((l) => l === `## ${label}`);
        const got = head < 0 ? null : file.slice(head + 1).find((l) => l && !l.startsWith("unit:")) || null;
        if (got !== want) exported.push(`${at}: the export writes "${got}"; the lane's line is "${want}"`);
      } catch (e) { off.push(`${book} ${line.place}: the page could not be read (${String(e.message || e).split("\n")[0].slice(0, 120)})`); }
    } finally { await page.close(); }
  }
} finally { await browser.close(); await tree.close(); }
check("P3  with the marks off, each place prints its carrier and nothing else: the stroke takes no room and the mark's own block does not show",
  drew.length === LINES.length && !off.length, off.length ? first(off) : `${drew.length} places on the page`);
check("P4  with the marks on, each place prints as the line's prints, the stroke where the edition writes it, the mark's own block hidden, and the place's text still its carrier",
  drew.length === LINES.length && !on.length, on.length ? first(on) : `${drew.length} of ${LINES.length} as the list prints them`);
check("P5  a press on the stroke opens the paseq's own card", drew.length === LINES.length && !pressed.length, pressed.length ? first(pressed) : `${drew.length} cards say what a paseq is`);
check("P6  the export writes each listed verse's Hebrew as the lane's line with the stroke in place, character for character",
  drew.length === LINES.length && !exported.length, exported.length ? first(exported) : `${drew.length} verses exported as the list has them`);
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
