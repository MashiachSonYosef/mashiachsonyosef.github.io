// Synthesis lane · the lines a reader sees when a book first opens, read off the page that draws them
//
// RULE: resting-lines-rule-v1-the-plain-list-under-a-chapter-is-a-recording-of-the-lines-the-reader-draws-as-it-opens
// LEDGER: -
// no frame letter. This reads what the page drew and decides nothing: no
// reading is chosen, ordered or joined here.
//
// WHY THIS IS A FILE. Every chapter's address carries, under the reader, a
// plain list of the chapter's readings, for a crawler and for a reader with
// no script. It was built by the door from the zone's baked table, oldest
// witness first, which until 6 November 2026 was also what the reader drew.
// That day the reader's resting line became the reading of the place's own
// source, then the pointing's own leader, and the list went on printing the
// table. An outside reader set the two side by side on 12 November: God was
// "judges" in the list and "God" on the line; "and he called" was a line
// about the third book of the Old Testament. Two pages of one site said two
// different things about one word, and the one a search engine reads was the
// worse.
//
// The line is drawn by several hundred lines of the page: the place's
// pieces, a sign left as a gap, the one hop, a joined run's own line, a pair
// written one way and read another, the pointing's leader, a name's lead.
// A second copy of that rule in a builder would drift from the first, and
// two copies drifting is the fault itself. So there is no second copy. The
// page is opened as a first visit opens it, every section is built by the
// page's own function, and the lines it drew are read off it and kept: the
// list is a recording. tools/bake-resting-lines-v1.mjs writes the record,
// tools/build-front-door-v1.mjs prints it and refuses one that is not of
// the tree it builds from, and tools/check-chapter-pages-v3.mjs reads the
// page again.
//
// WHAT A LINE IS, read here and nowhere else: under a section's Hebrew,
// every reading element that is drawn and stands in no other, in the page's
// own order. Under a word standing alone it is that word's line. Under words
// one card joins it is the run's one line over all of them, or, where the
// run reads word by word, each word's part. A scribal mark has no line. A
// line with nothing in it, or the dash the page draws for a word no source
// reads, is a bare word and is counted, not kept. The text is the line's
// own, with the license chip taken off it, as the page's export reads it.
// Who is credited is what the chip itself names (its data-line), and the
// license is the chip's own words. Where the chip names no one source,
// because two sources of one label carry the reading, the line is credited
// by that label, found in the chip's own title (the record's `unnamed`).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";

export const RESTING_LINES_RULE_ID = "resting-lines-rule-v1-the-plain-list-under-a-chapter-is-a-recording-of-the-lines-the-reader-draws-as-it-opens";
export const RESTING_LINES_SCHEMA = "RESTING_LINES_V1";
export const RESTING_DIR = join("data", "resting-lines");
export const recordPath = (readerDir, work) => join(readerDir, RESTING_DIR, `${work}.json.gz`);
export const sha256Of = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

/** IN THE PAGE. The drawn lines of sections [from, to), in the page's own
 *  order. Handed to the browser whole, so it names nothing outside itself.
 *  With `seen` asked for, each section also carries the text the browser
 *  itself renders for its drawn lines (innerText, which leaves out whatever
 *  is not displayed), so a check can hold this reading to the rendering by a
 *  road that does not pass through it. */
export const linesInPage = ([from, to, seen = false]) => {
  const text = (g) => { const c = g.cloneNode(true); for (const x of c.querySelectorAll(".g-lic")) x.remove(); return (c.textContent || "").trim(); };
  const credits = {};
  // a chip that names no one source (two sources of one label carry the
  // reading, and the page will not pick between them) still says whose the
  // reading is and under what license: its own words are handed back with
  // the line's place, [section, line, the license it prints, its title]
  const unnamed = [];
  const credit = (g, i, j) => {
    const chip = g.querySelector(":scope > .g-lic");
    if (!chip) return "";
    const line = chip.dataset.line || "";
    if (!line) unnamed.push([i, j, (chip.textContent || "").replace(/\s+/gu, " ").trim(), chip.title || ""]);
    if (line && !credits[line]) credits[line] = { says: (chip.textContent || "").replace(/\s+/gu, " ").trim(), title: chip.title || "" };
    return line;
  };
  const drawn = (el, stop) => { for (let x = el; x && x !== stop; x = x.parentElement) if (getComputedStyle(x).display === "none") return false; return true; };
  const secs = [...document.querySelectorAll("section.seg")];
  const out = [];
  for (let i = from; i < Math.min(to, secs.length); i += 1) {
    const s = secs[i];
    const he = s.querySelector(".he-text");
    const rec = { i, label: (s.querySelector(".vnum") || {}).textContent || "", built: !!he && !s.classList.contains("seg-wait"), entries: 0, units: [], bare: 0, odd: [] };
    if (seen) rec.seen = "";
    if (he) {
      const wbs = [...he.querySelectorAll(".wb")];
      rec.entries = wbs.length;
      for (const g of he.querySelectorAll(".g")) {
        if (g.parentElement.closest(".g")) continue;
        if (!drawn(g, he)) continue;
        const up = g.parentElement;
        if (seen && !(up.classList.contains("wb") && up.classList.contains("mark"))) rec.seen += ` ${g.innerText || ""}`;
        const push = (first, count, el) => { const t = text(el); if (!t || t === "—") { rec.bare += 1; return; } rec.units.push([first, count, t, credit(el, i, rec.units.length)]); };
        if (up.classList.contains("wb")) { if (!up.classList.contains("mark")) push(wbs.indexOf(up), 1, g); continue; }
        if (up.classList.contains("wjoin")) {
          const rw = [...up.querySelectorAll(".wb")];
          if (g.classList.contains("parts")) for (const part of g.querySelectorAll(":scope > .g-part")) { const w = rw[Number(part.dataset.wi)]; if (w) push(wbs.indexOf(w), 1, part); else rec.odd.push(`a part names word ${part.dataset.wi} of a run of ${rw.length}`); }
          else if (rw.length) push(wbs.indexOf(rw[0]), rw.length, g);
          else rec.odd.push("a run's line over no word");
          continue;
        }
        rec.odd.push(`a line under ${up.tagName.toLowerCase()}.${[...up.classList].join(".")}`);
      }
    }
    out.push(rec);
  }
  return {
    sections: out, credits, unnamed, of: secs.length,
    state: { reader: document.body.classList.contains("en") ? "the English reader" : "the Hebrew reader", pointing: window.__masorah || null, signs: window.__signs || null, names: window.__nonames || null, senses: window.__senses || null, sources_off: [...(window.__sourcesOff || [])].sort() },
  };
};

/** ON A PAGE ALREADY OPEN. The stretch of sections asked for is built by the
 *  page's own function, the lattice is waited for where the work carries
 *  one, and the lines are read until two readings agree. Throws, in words,
 *  where the lines could not be read whole. */
export const linesOnPage = async (p, { from = 0, to = Infinity, settleMs = 350, seen = false } = {}) => {
  const has = await p.evaluate(() => typeof window.__materialise === "function");
  if (!has) throw new Error("the page offers no __materialise: its sections cannot be built without scrolling");
  const total = await p.evaluate(([a, b]) => window.__materialise(a, b === null ? undefined : b), [from, Number.isFinite(to) ? to : null]);
  // the lattice is waited for where the work carries one and the pointing
  // reads it; with the pointing lifted ("keep") the page orders no line by
  // it and does not ask for it
  const wantsLattice = await p.evaluate(() => window.__masorah !== "keep" && !!(window.__zone && window.__zone.emitted_from && window.__zone.emitted_from.toggles && window.__zone.emitted_from.toggles.lattice));
  if (wantsLattice) {
    const t0 = Date.now();
    let landed = false;
    while (Date.now() - t0 < 30000) { landed = await p.evaluate(() => !!(window.__latticeStore || window.__latticeRefused)); if (landed) break; await p.waitForTimeout(100); }
    if (!landed) throw new Error("the work carries a lattice and it did not arrive: the lines would be read without the pointing's leaders");
  }
  const range = [from, Number.isFinite(to) ? Math.min(to, total) : total, seen];
  let last = null, got = null, tries = 0;
  for (; tries < 20; tries += 1) {
    await p.waitForTimeout(settleMs);
    got = await p.evaluate(linesInPage, range);
    const now = JSON.stringify(got.sections);
    if (now === last) break;
    last = now;
  }
  if (tries >= 20) throw new Error("the lines did not come to rest in twenty readings");
  const unbuilt = got.sections.filter((s) => !s.built).length;
  if (unbuilt) throw new Error(`${unbuilt} section(s) were not built`);
  return { ...got, readings: tries + 1 };
};

/** Open a work as a first visit opens it and read its lines: nothing kept on
 *  the device, the page's own defaults, every section (or the stretch asked
 *  for) read as linesOnPage reads it. Throws, in words, where the page could
 *  not be read whole or threw while it drew. */
export const readAtRest = async (browser, base, work, opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  try {
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(String(e && e.message)));
    await p.goto(`${base}/zone.html?b=${work}`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    const got = await linesOnPage(p, opts);
    if (errors.length) throw new Error(`the page threw while it drew: ${errors[0]}`);
    return got;
  } finally { await ctx.close(); }
};

/** WHO EACH LINE OF A SECTION IS CREDITED TO, as the record keeps it: for
 *  each line, the sources its chip names, each { label, license }; or, where
 *  the chip names no one source, the label and license the record found in
 *  the chip's own words. One reading of this, for the door that prints the
 *  credit and the check that holds the door to it. */
export const creditedIn = (record, at) => {
  const byPlace = new Map((record.unnamed || []).filter((u) => u[0] === at).map((u) => [u[1], { label: u[2], license: u[3] }]));
  return record.sections[at][1].map(([, , , credited], j) => {
    const ids = String(credited).split(" ").filter(Boolean);
    if (ids.length) return ids.map((id) => record.sources[id]);
    return byPlace.has(j) ? [byPlace.get(j)] : [];
  });
};

/** The record as kept: gzip of the JSON, the same bytes for the same lines. */
export const writeRecord = (path, record) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(record), "utf8"), { level: 9 })); };
export const readRecord = (path) => (existsSync(path) ? JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")) : null);

/** WHY A RECORD IS NOT OF THIS TREE, in words; [] when it is. A record names
 *  the page it was read off and every file the page asked for while it drew,
 *  each by its sha256. The same page over the same files draws the same
 *  lines, so a record whose every fingerprint stands is the lines this tree
 *  draws; one that names another page, or a file that has moved, is a
 *  recording of something else and is not printed. Any recording read off
 *  the page says of itself what a record of the lines says (read_off.files),
 *  so it is asked the same way, by the shape it should have (`schema`). */
export const whyNotOfThisTree = (readerDir, record, seen = null, schema = RESTING_LINES_SCHEMA) => {
  const why = [];
  if (!record) return ["no record is kept"];
  if (record.schema_version !== schema) why.push(`its shape is ${record.schema_version}, not ${schema}`);
  for (const [rel, sha] of Object.entries((record.read_off && record.read_off.files) || {})) {
    const p = join(readerDir, rel);
    if (!existsSync(p)) { why.push(`${rel} is not here`); continue; }
    // `seen` keeps a file's fingerprint across the records that name it: forty works name the same indexes
    const now = seen && seen.has(p) ? seen.get(p) : sha256Of(p);
    if (seen) seen.set(p, now);
    if (now !== sha) why.push(`${rel} has changed since the page was read`);
  }
  if (!record.read_off || !record.read_off.files || !record.read_off.files["zone.html"]) why.push("it does not name the page it was read off");
  return why;
};
