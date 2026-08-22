#!/usr/bin/env node
// Synthesis lane · front-door-rule-v1-the-door-lists-what-the-zones-carry
//
// The site's front door, built from the zones rather than typed — both of its
// faces: the page a reader arrives at, and the README somebody browsing the
// repository arrives at. Both said the same kind of thing and both went stale
// the same way, so both are now read out of the zones at build time.
//
// It was typed. Two books were named by hand with their section counts written
// out beside them, and when a third work arrived — the commentary, 181 units
// across 58 works on Genesis and 817 on I Kings — the door did not mention it,
// because nothing was going to notice that it should. A door somebody
// maintains by hand is a door that is out of date the moment it is not
// maintained, and nobody can tell by looking.
//
// So it reads the zones and says what is in them. Add a book and it appears.
// Add a commentary and it appears under its book with its own count.
//
// Two rules this page keeps, and keeps by construction rather than by memory:
//
//   1. It prints no Hebrew it cannot stand behind. A book's own title is
//      corpus text; it appears here exactly as its zone carries it — the
//      ledger's word — with the store's licensed reading beside it under
//      "commonly force read as", the same two-row frame as the masthead
//      inside. The title is a doorway: pressing it opens the book, where the
//      same word opens its full record. A work whose ledger has not named a
//      title shows the open slot instead, in the masthead's own words. No
//      other Hebrew may appear, and the guard below holds the page to that.
//   2. Every number on it is counted from a zone at build time. There is no
//      figure here that somebody decided.
//
//   --zones  directory of built zones        (default data/zones)
//   --out    directory to write the door into (default deploy-root)
//
// Run: node tools/build-front-door-v1.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { openRouteStore } from "./gloss-store-v1.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", "data/zones");
const OUT = arg("out", "deploy-root");
const PLAN = arg("plan", "build/build-plan-v1.json");

const read = (f) => JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));
const has = (f) => existsSync(join(ZONES, f));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n = (x) => Number(x).toLocaleString("en-US");

// ---- what the zones carry ------------------------------------------------
//
// The books the door offers used to be a typed list of two, which is how the
// door and the build could disagree about what is published — the Targum was
// a published work a reader could open and the door never mentioned it as
// one. The list now comes from the same plan the build runs from, derived
// fresh so a stale build/ cannot vouch for itself, in the ledgers' own order.
// A work added by its ledger appears here without anyone editing a list.
//
// The byline is NOT among the things carried over. Each zone already carries
// its own, and an earlier build typed a trimmed copy of it into this list —
// two strings for one fact, and the copy is the one on the page. The zone's
// byline is printed whole, exactly as the zone carries it.
execFileSync("node", ["tools/plan-build-v1.mjs", "--out", PLAN, "--tsv", PLAN.replace(/\.json$/, ".tsv")], { stdio: "pipe" });
const plan = JSON.parse(readFileSync(PLAN, "utf8"));
// What each work's build stands on, and what the Y lane holds back from it —
// derived by tools/emit-work-basis-v1.mjs from the plan and the hold ledgers.
// The door prints incompleteness rather than presenting a typed-basis work
// with a sealed work's face; a door that cannot read the basis file would be
// choosing that face back, so it refuses instead.
execFileSync("node", ["tools/emit-work-basis-v1.mjs", "--plan", PLAN], { stdio: "pipe" });
const WB = JSON.parse(readFileSync(arg("basis", "data/work-basis-v1.json"), "utf8"));
// The same catalog the masthead asks at runtime, asked once at build time:
// does a record read this title's own form as the common name? Where one
// does, its licence rides the force-read line, exactly as it does inside.
const STORE = openRouteStore(arg("store", "data/route-store"));
// Same mapping as zone.html's licenseName — the postures are the store's.
const licenseName = (posture) => {
  const v = String(posture || "").toLowerCase();
  if (!v) return "License unrecorded";
  if (v.startsWith("cc0")) return "CC0";
  if (/_nc(?:_|$)/u.test(v)) return /_sa(?:_|$)/u.test(v) ? "CC BY-NC-SA" : "CC BY-NC";
  // Same clause as zone.html: a chosen CC BY outranks a declined gfdl it mentions.
  if (v.startsWith("cc_by") && !v.startsWith("cc_by_sa")) return "CC BY";
  if (v.includes("by_sa") || v.includes("gfdl")) return "CC BY-SA";
  if (v.startsWith("public_domain")) return "Public Domain";
  if (v.startsWith("cc_by") || v.includes("wordnet")) return "CC BY";
  return posture;
};
const titleReading = (tokens, en) => {
  const key = (tokens || []).map((t) => t.k).filter(Boolean)[0];
  if (!key) return null;
  const routes = STORE.routesFor(key);
  if (!routes) return null;
  // Exact sense match only — a plain ";"-split cannot create a false exact
  // equal (a fragment cut inside brackets keeps its bracket and matches
  // nothing), so the store's own depth rule is not re-implemented here.
  const hits = routes.filter((row) => {
    const senses = String(row[1] || "").split(";").map((x) => x.trim());
    return row[1] === en || senses.includes(en);
  }).filter((row) => STORE.index.m_sources[row[3]]);
  if (!hits.length) return null;
  hits.sort((a, c) => {
    const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10);
    return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9);
  });
  const m = STORE.index.m_sources[hits[0][3]];
  return { lic: licenseName(m.licensePosture), label: m.label || "", year: m.sourceYear || "" };
};
// The atlas: every family and every work the bridge records, built or not,
// emitted by tools/emit-corpus-atlas-v1.mjs with the bridge's sha as its
// receipt. The door refuses to run without it — a door listing only what
// happens to be built would silently shrink the library to this lane's
// output, and silent truncation reads as coverage.
const ATLAS = JSON.parse(readFileSync(arg("atlas", "data/corpus-atlas-v1.json"), "utf8"));
// The family ledger: the synthesis lane's ruling over the bridge's family
// VALUES — authored on the owner's authorization, checked by
// check-family-ledger-v1, and dying the day a corpus-side family record
// lands. The door derives its sections from it; a bridge value the ledger
// does not rule surfaces verbatim in its own section, never swallowed.
const LEDGER = JSON.parse(readFileSync(arg("family-ledger", "data/family-ledger-v1.json"), "utf8"));
const BOOKS = plan.works.map((w) => ({
  slug: w.published_as, zone: `${w.published_as}.bin`,
  work_id: w.work_id, address_by_rule: w.address_by_rule, basis: w.basis,
  held: (WB.works[w.published_as] || {}).held_commentaries || 0,
}));
// Attachment is directional for presentation: the record's pair is
// [base, commentary], the same direction the Y schema's attachment_y_node_id
// points — from the commentary to what it stands on. A commentary work keeps
// its own page and its own address; the door seats it with its base, because
// a commentary is read where its base is read.
const commentaryOf = new Map();   // base slug -> [commentary slugs]
const seated = new Set();         // commentary slugs that sit with a base
const slugOfWork = new Map(plan.works.map((w) => [w.work_id, w.published_as]));
for (const a of plan.attachments || []) {
  const base = slugOfWork.get(a.pair[0]), comm = slugOfWork.get(a.pair[1]);
  if (!base || !comm) continue;
  if (!commentaryOf.has(base)) commentaryOf.set(base, []);
  commentaryOf.get(base).push(comm);
  seated.add(comm);
}

const books = [];
for (const b of BOOKS) {
  if (!has(b.zone)) continue;
  const z = read(join(ZONES, b.zone));
  const sections = (z.sections || []).length;
  const words = (z.sections || []).reduce((t, s) => t + (s.words || []).length, 0);
  // its commentary, if any zone carries some for it
  // A book can carry both grains at once, and Genesis does: some commentary is
  // placed on a word, the rest stands on the section because nothing places it
  // any closer. An earlier version of this took whichever grain it met first
  // and printed that one, which named half of what was there.
  let onWord = 0, onSection = 0, heldLicence = 0, noText = 0, byCoordinate = 0, noCloser = 0, worksCount = 0;
  const side = `${b.slug}-commentary.bin`;
  if (has(side)) {
    const c = read(join(ZONES, side));
    const seen = new Set();
    for (const unit of Object.values(c.units || {})) {
      for (const list of Object.values(unit.words || {}))
        for (const e of list) { onWord += 1; seen.add(e.family_en || e.ref); }
      for (const e of unit.section || []) {
        onSection += 1; seen.add(e.family_en || e.ref);
        if (e.held === "licence") heldLicence += 1;
        else if (e.held) noText += 1;
        // The section is not one thing. For 1 Kings the chain itself puts the
        // commentary there, by coordinate; for Genesis it is where a segment
        // stands when nothing places it closer. Saying "on the section" for
        // both would flatten a proof and a shrug into one number.
        else if (e.basis === "SEALED_UNIT_COORDINATE_IDENTITY") byCoordinate += 1;
        else noCloser += 1;
      }
    }
    worksCount = (c.works && c.works.length) ? c.works.length : seen.size;
  }
  const units = onWord + onSection;
  if (!z.byline) throw new Error(`${b.zone} carries no byline — the door prints the zone's and will not invent one`);
  // The title's own gloss, by the same rule every word in the reader is
  // glossed under: the store's oldest displayable reading for the form's
  // exact key. This is the answer to the title being unreadable — not the
  // force-read, the record.
  const titleKey = (z.work_he_tokens || []).map((t) => t.k).filter(Boolean)[0] || null;
  const titleGloss = titleKey ? (STORE.glossFor(titleKey).text || "") : "";
  books.push({ ...b, en: z.work || b.slug, byline: z.byline, sections, words,
    he: z.work_he || "", heGloss: titleGloss, defOpen: !!(titleKey && titleGloss),
    reading: titleReading(z.work_he_tokens, z.work || b.slug),
    units, onWord, onSection, heldLicence, noText, byCoordinate, noCloser, works: worksCount });
}
if (!books.length) throw new Error(`no zones found in ${ZONES} — refusing to write a door with nothing behind it`);

// ---- the door ------------------------------------------------------------
// A typed-basis work and a sealed work do not wear the same face, and held
// commentary is counted where the book is offered rather than silently
// absent — but in the door's own quiet voice, never as an alarm. The frame
// is recorded as never being grounds to declare a work deficient; an open
// slot is simply named, and the line goes away when its record lands.
const incBits = (b) => {
  const bits = [];
  if (b.basis === "TYPED_AWAITING_LEDGER") bits.push("awaiting its Y ledger — its coordinates stand typed in the open until then");
  if (b.held) bits.push(`${n(b.held)} commentary slots open`);
  return bits;
};
// The card is the collapsed face, so it carries what must never fold away:
// both title rows — the book's own word first, the force-read below it — and
// the bare counts. Everything else about the group (its chain line, its open
// slots, the works seated with it, its commentary) stands behind one quiet
// fold whose summary names each thing it holds, with its count, so nothing
// is out of sight without being said.
const bookCard = (b) => `    <div class="bookcard">
      <span class="row trow"><span class="lab">book title</span>${b.he
        ? (b.defOpen
          ? `<a class="titleway" href="/${b.slug}?t=open" title="open this word\u2019s own record — readings oldest source first"><span class="he" lang="he" dir="rtl">${esc(b.he)}</span><span class="g">${esc(b.heGloss)}</span></a>`
          : `<span class="he" lang="he" dir="rtl">${esc(b.he)}</span>`)
        : `<span class="he none">none is recorded in the ledger</span>`}</span>
      <a class="book" href="/${b.slug}">
      <span class="row"><span class="lab">commonly force read as</span><span class="en">${esc(b.en)}</span>${b.reading
        ? `<span class="chip" title="${esc(b.reading.label)}${b.reading.year ? ` \u00b7 ${esc(b.reading.year)}` : ""}">${esc(b.reading.lic)}</span>` : ""}</span>
      <span class="of">${n(b.sections)} sections · ${n(b.words)} words</span>
      </a>
    </div>`;

// A commentary entry is its own way in, so it opens one. ?c=open tells the
// reader to press the first mark the book carries and the first work behind it
// — the same path a finger takes — rather than landing at the top of the book
// with everything shut. The book's own entry above still opens the book.
// Where each one stands, and how many this page holds rather than prints. A
// count with a bound inside it that nobody prints reads as a total.
const whereLine = (b) => {
  const parts = [];
  if (b.onWord) parts.push(`${n(b.onWord)} on the word it opens by quoting`);
  if (b.byCoordinate) parts.push(`${n(b.byCoordinate)} on the section by coordinate`);
  if (b.noCloser) parts.push(`${n(b.noCloser)} on the section, nothing places them closer`);
  if (b.heldLicence) parts.push(`${n(b.heldLicence)} kept off by a licence`);
  if (b.noText) parts.push(`${n(b.noText)} named, with no text in the record`);
  return parts.join(" · ");
};
const commentaryLine = (b) => (b.units
  ? `      <a class="sub-book" href="/${b.slug}?c=open"><span class="en">Commentary on ${esc(b.en)}</span><span class="of">${n(b.units)} carried${b.works ? ` from ${n(b.works)} work${b.works === 1 ? "" : "s"}` : ""} — ${whereLine(b)}</span></a>`
  : null);

const totalUnits = books.reduce((t, b) => t + b.units, 0);
const bySlug = new Map(books.map((b) => [b.slug, b]));
// One group per base work: its card, the works seated with it, and every way
// its commentary opens. A seated work is still its own book — the row says so
// and goes to it — it is just found where it is read.
const groupFor = (b) => {
  const subs = [];
  let seatedCount = 0;
  for (const cslug of commentaryOf.get(b.slug) || []) {
    const c = bySlug.get(cslug);
    if (!c) continue;
    seatedCount += 1;
    subs.push(`      <a class="sub-work" href="/${c.slug}">${c.he
        ? `<span class="he" lang="he" dir="rtl">${esc(c.he)}</span>`
        : `<span class="he none">none is recorded in the ledger</span>`}<span class="en">${esc(c.en)}</span><span class="of">its own book · ${n(c.sections)} sections · ${n(c.words)} words · ${esc(c.byline)}</span>${incBits(c).length ? `<span class="of slots">${esc(incBits(c).join(" · "))}</span>` : ""}</a>`);
    const cl = commentaryLine(c);
    if (cl) subs.push(cl);
  }
  const cl = commentaryLine(b);
  if (cl) subs.push(cl);
  // What the fold holds, said on its face with the counts it holds it at.
  // A fold that says "more" hides; a fold that says "1 work seated with it ·
  // commentary · 612 carried · 11 commentary slots open" only shortens.
  const bits = [];
  if (seatedCount) bits.push(`${n(seatedCount)} work${seatedCount === 1 ? "" : "s"} seated with it`);
  if (b.units) bits.push(`commentary · ${n(b.units)} carried`);
  if (b.basis === "TYPED_AWAITING_LEDGER") bits.push("awaiting its Y ledger");
  if (b.held) bits.push(`${n(b.held)} commentary slots open`);
  const foldRows = [`      <span class="of fold-line">${esc(b.byline)}</span>`];
  if (incBits(b).length) foldRows.push(`      <span class="of slots fold-line">${esc(incBits(b).join(" · "))}</span>`);
  return `    <div class="workgroup">
${bookCard(b)}
      <details class="fold">
      <summary>${esc(bits.join(" · ") || "its record line")}</summary>
${foldRows.join("\n")}
${subs.join("\n")}
      </details>
    </div>`;
};
// ---- the library, whole, on the ledger's shelves --------------------------
// The atlas says what exists; the ledger says where it stands and what each
// shelf is called. A canonical family pools every bridge value the ledger
// folds into it, renders its Hebrew name where the ledger gives one (each
// keyed token verified against the store; the gloss under it is the store's
// oldest displayable reading, the same rule as every title), keeps the open
// slot where it does not, and says on the fold's inside which bridge values
// it holds — the receipt of the fold. The two review values the corpus lane
// left open stand together in their own held section, and any bridge value
// the ledger has not ruled surfaces verbatim in a section of its own.
const byWorkId = new Map(books.map((b) => [b.work_id, b]));
for (const b of books) {
  let found = false;
  for (const f of Object.values(ATLAS.families)) if (f.works.some((w) => w.id === b.work_id)) { found = true; break; }
  if (!found) throw new Error(`${b.work_id} is published but the atlas does not know it — the bridge and the zones disagree; refusing output`);
}
const seatedBaseOf = new Map();   // seated slug -> base book
for (const [base, comms] of commentaryOf) for (const c of comms) seatedBaseOf.set(c, bySlug.get(base));

const valueOwner = new Map();     // bridge value -> ledger family id | "(awaiting)"
for (const f of LEDGER.families) for (const m of f.members) valueOwner.set(m, f.id);
for (const m of LEDGER.awaiting.members) valueOwner.set(m, "(awaiting)");

const poolOf = (values) => {
  const rows = [];
  for (const v of values) {
    const af = ATLAS.families[v];
    if (!af) continue;
    for (const w of af.works) rows.push({ atlas: w, book: byWorkId.get(w.id) || null, value: v });
  }
  rows.sort((a, b) => a.atlas.c0_first - b.atlas.c0_first);
  return rows;
};
const sums = (rows) => ({
  works: rows.length,
  built: rows.filter((r) => r.book).length,
  units: rows.reduce((t, r) => t + r.atlas.units, 0),
});
const families = LEDGER.families.map((lf) => {
  const present = lf.members.filter((m) => ATLAS.families[m]);
  return { ledger: lf, members: present, rows: poolOf(present) };
}).filter((f) => f.rows.length);
const unruled = Object.keys(ATLAS.families).filter((v) => !valueOwner.has(v));
const awaitingRows = poolOf(LEDGER.awaiting.members.filter((m) => ATLAS.families[m]));

const atlasRow = (w) => {
  const segs = w.id.split("/");
  const name = segs[segs.length - 1];
  const pre = segs.slice(0, -1).join("/");
  return `      <span class="atlas-row" data-p="${esc(pre)}"><span class="aw" dir="auto">${esc(name)}</span><span class="au">${n(w.units)} unit${w.units === 1 ? "" : "s"}</span></span>`;
};
const seatedRow = (b) => {
  const base = seatedBaseOf.get(b.slug);
  return `      <a class="atlas-row built" href="/${b.slug}"><span class="aw">${esc(b.en)}</span><span class="au">its own book · seated with ${esc(base ? base.en : "its base")} — reads there · ${n(b.sections)} sections</span></a>`;
};
const rowsHtml = (rows) => rows.map((r) => {
  if (!r.book) return atlasRow(r.atlas);
  if (seated.has(r.book.slug)) return seatedRow(r.book);
  return groupFor(r.book);
});
const famHeadHe = (lf) => {
  if (!lf.he) return `<span class="he none">none is recorded in the ledger</span>`;
  const key = (lf.he_tokens || []).map((t) => t.k).filter(Boolean)[0] || null;
  const gloss = key ? (STORE.glossFor(key).text || "") : "";
  return `<span class="fam-he" data-named-by="family-ledger-v1#${esc(lf.id)}"><span class="he" lang="he" dir="rtl">${esc(lf.he)}</span>${gloss ? `<span class="g">${esc(gloss)}</span>` : ""}</span>`;
};
const familySection = (fam) => {
  const lf = fam.ledger;
  const s = sums(fam.rows);
  const bits = [`${n(s.works)} work${s.works === 1 ? "" : "s"}`];
  if (s.built) bits.push(`${n(s.built)} built`);
  bits.push(`${n(s.units)} units`);
  const reading = titleReading(lf.he_tokens || [], lf.en);
  const foldLines = [`      <span class="of fold-line">${esc(lf.what)}</span>`];
  foldLines.push(`      <span class="of slots fold-line">the bridge records ${fam.members.length === 1 ? "this shelf as" : "these as"}: ${esc(fam.members.join(" · "))} — folded here by ${esc(LEDGER.schema_version)}, which dies the day the corpus rules the column</span>`);
  return `    <section class="family">
      <details class="fam"${s.built ? " open data-rest-open" : ""}>
      <summary>
        <span class="row"><span class="lab">family</span>${famHeadHe(lf)}</span>
        <span class="row"><span class="lab">commonly force read as</span><span class="en">${esc(lf.en)}</span>${reading
          ? `<span class="chip" title="${esc(reading.label)}${reading.year ? ` · ${esc(reading.year)}` : ""}">${esc(reading.lic)}</span>` : ""}<span class="of">${esc(bits.join(" · "))}</span></span>
      </summary>
      <div class="fgroups">
${foldLines.join("\n")}
${rowsHtml(fam.rows).join("\n")}
      </div>
      </details>
    </section>`;
};
const awaitingSection = () => {
  if (!awaitingRows.length) return "";
  const s = sums(awaitingRows);
  return `    <section class="family">
      <details class="fam">
      <summary>
        <span class="row"><span class="lab">held for review</span><span class="he none">the corpus lane&#8217;s own review markers, standing open</span></span>
        <span class="row"><span class="lab">recorded in the bridge as</span><span class="en">${esc(LEDGER.awaiting.members.join(" · "))}</span><span class="of">${n(s.works)} works · ${n(s.units)} units</span></span>
      </summary>
      <div class="fgroups">
      <span class="of fold-line">${esc(LEDGER.awaiting.why)}</span>
${rowsHtml(awaitingRows).join("\n")}
      </div>
      </details>
    </section>`;
};
const unruledSection = (v) => {
  const rows = poolOf([v]);
  const s = sums(rows);
  return `    <section class="family">
      <details class="fam">
      <summary>
        <span class="row"><span class="lab">family</span><span class="he none">none is recorded in the ledger</span></span>
        <span class="row"><span class="lab">recorded in the bridge as</span><span class="en">${esc(v)}</span><span class="of">${n(s.works)} works · ${n(s.units)} units · the family ledger has not ruled this value</span></span>
      </summary>
      <div class="fgroups">
${rowsHtml(rows).join("\n")}
      </div>
      </details>
    </section>`;
};
const sectionsHtml = [
  ...families.map(familySection),
  awaitingSection(),
  ...unruled.map(unruledSection),
].filter(Boolean);

const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Tabernacle</title>
<meta name="description" content="A Hebrew reader built on a sealed chain: every reading traceable to the record that carries it, and every record to the licence it was released under.">
<style>
  /* colour-role-rule-v1 · the roles are the ledgers and the values are ours.
     The reader paints the recorded contract — structure gold, base surface
     purple — and the door had been wearing an invented blue-grey instead,
     so the way in looked like a different building than the rooms. Same
     tokens as zone.html, verbatim. */
  :root { --bg:#0c0910; --panel:#150f1d; --line:#261d33; --ink:#ece1c4; --muted:#a99a80;
          --faint:#7a6f5c; --gold:#e8c46a; --gold-dim:#9a7f3f; --shani:#c0563f; --shesh:#d8c7a4; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body { margin:0; min-height:100vh; background:var(--bg); color:var(--ink);
         font:16px/1.6 Georgia,"Times New Roman",serif; display:flex; align-items:center;
         justify-content:center; padding:1.4rem 1rem; overflow-x:hidden; }
  main { width:100%; max-width:40rem; }
  h1 { margin:0 0 .35rem; font-size:2.1rem; letter-spacing:.02em; color:var(--gold); }
  p.sub { margin:0 0 1.2rem; color:var(--muted); font-size:.9rem; }
  .books { display:flex; flex-direction:column; gap:.55rem; }
  .bookcard { display:flex; flex-direction:column; align-items:flex-start; gap:.15rem;
           border:1px solid var(--line); border-radius:.7rem; background:var(--panel);
           padding:.7rem .9rem .6rem; }
  .bookcard:hover { border-color:var(--gold-dim); }
  a.book { display:flex; flex-direction:column; align-items:flex-start; gap:.15rem;
           text-decoration:none; color:var(--ink); align-self:stretch; }
  /* Two ways in, and the Hebrew one comes first: the title opens the word's
     own record — readings oldest source first — because the answer this
     project gives to an unreadable word is never the force-read below it. */
  a.titleway { text-decoration:none; display:inline-flex; flex-direction:column; align-items:flex-start; gap:.05rem; }
  a.titleway .g { font-size:.72rem; color:var(--muted); border-bottom:1px dotted var(--gold-dim); }
  a.titleway:hover .g { color:var(--gold); }
  a.titleway:hover .he { color:var(--shesh-bright, #eadbbd); }
  /* The title is the book's own. The English beside it is not a translation of
     it and must not be able to be read as one — it is how a reader who does not
     read Hebrew finds and refers to the book. So each line says which of the
     two it is before the thing itself. The labels are ours; the title is not. */
  .bookcard .row { display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; }
  .bookcard .lab { flex:0 0 auto; min-width:7rem; font-size:.6rem; letter-spacing:.18em;
                text-transform:uppercase; color:var(--faint); }
  .bookcard .en { font-size:1.05rem; font-variant:small-caps; letter-spacing:.12em; color:var(--gold-dim); }
  .bookcard .he, a.sub-work .he { font-family:"Frank Ruehl CLM","David Libre","SBL Hebrew",Georgia,serif;
    font-size:1.25rem; color:var(--shesh); }
  .bookcard .he.none, a.sub-work .he.none { font-family:Georgia,serif; font-size:.85rem;
    font-style:italic; color:var(--faint); }
  .bookcard .chip { font-size:.62rem; letter-spacing:.06em; color:var(--muted);
    border:1px solid var(--line); border-radius:.6rem; padding:.1rem .45rem; }
  a.sub-work .he { font-size:1.05rem; margin-right:.5rem; }
  .bookcard .of { margin-top:.25rem; color:var(--faint); font-size:.76rem; }
  .bookcard .of.slots, a.sub-work .of.slots { margin-top:.2rem; font-style:italic; }
  /* The commentary is not a third book. It arrives shut, and what is behind it
     is one entry per book, each going to the book it belongs to — because that
     is where a commentary is read. */
  #find { margin:0 0 1rem; }
  #find input { width:100%; padding:.6rem .9rem; border:1px solid var(--line); border-radius:.55rem;
    background:var(--panel); color:var(--ink); font:inherit; font-size:.92rem; }
  #find input::placeholder { color:var(--faint); }
  #find input:focus { outline:none; border-color:var(--gold-dim); }
  .workgroup { border:1px solid var(--line); border-radius:.7rem; background:var(--panel); overflow:hidden; }
  .workgroup .bookcard { border:none; border-radius:0; background:none; }
  a.sub-work { display:block; padding:.6rem .9rem .6rem 1.7rem; border-top:1px solid var(--line);
    text-decoration:none; color:var(--ink); }
  a.sub-work:hover { background:rgba(224,182,79,.06); }
  a.sub-work .en { display:block; font-size:.98rem; color:var(--gold-dim); }
  a.sub-work .of { display:block; margin-top:.2rem; color:var(--faint); font-size:.78rem; }
  /* A family is the outermost frame, and its head is the same register at
     family grain: Hebrew name (an open slot until a ledger names one), the
     force-read below, the sums of what it holds on the fold's face. Nested
     folds: the family folds its groups; each group folds its record lines. */
  section.family { }
  details.fam > summary { list-style:none; cursor:pointer; padding:.3rem .15rem .45rem; }
  details.fam > summary::-webkit-details-marker { display:none; }
  details.fam > summary .row { display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; }
  details.fam > summary .lab { flex:0 0 auto; min-width:7rem; font-size:.6rem; letter-spacing:.18em;
    text-transform:uppercase; color:var(--faint); }
  details.fam > summary .en { font-size:1.15rem; font-variant:small-caps; letter-spacing:.14em; color:var(--gold);
    overflow-wrap:anywhere; min-width:0; }
  details.fam > summary .he.none { font-family:Georgia,serif; font-size:.85rem; font-style:italic; color:var(--faint); }
  details.fam > summary .fam-he { display:inline-flex; flex-direction:column; align-items:flex-start; gap:.05rem; }
  details.fam > summary .fam-he .he { font-family:"Frank Ruehl CLM","David Libre","SBL Hebrew",Georgia,serif;
    font-size:1.3rem; color:var(--shesh); }
  details.fam > summary .fam-he .g { font-size:.7rem; color:var(--muted); }
  details.fam > summary .of { color:var(--faint); font-size:.74rem; font-variant:normal; letter-spacing:normal; }
  details.fam > summary > .row:first-child::before { content:"\u25b8"; color:var(--gold-dim); font-size:.8rem; }
  details.fam[open] > summary > .row:first-child::before { content:"\u25be"; }
  details.fam > summary:hover .en { color:var(--shesh); }
  .fgroups { display:flex; flex-direction:column; gap:.55rem; }
  /* A work not yet built: its recorded id and its measured size, quiet and
     unlinked — nothing links to nothing. A built work seated elsewhere links
     to its own page and says where it reads. */
  .atlas-row { display:flex; align-items:baseline; gap:.6rem; padding:.16rem .35rem;
    font-size:.8rem; color:var(--faint); text-decoration:none; flex-wrap:wrap; min-width:0; }
  .atlas-row .aw { color:var(--muted); unicode-bidi:plaintext; flex:1 1 auto; min-width:0;
    overflow-wrap:anywhere;
    font-family:"Frank Ruehl CLM","David Libre","SBL Hebrew",Georgia,serif; }
  .atlas-row .au { font-size:.68rem; white-space:nowrap; }
  a.atlas-row.built .aw { color:var(--gold-dim); }
  a.atlas-row.built:hover .aw { color:var(--gold); }
  /* One quiet fold per group. Its face is the summary line built above —
     each folded thing named with its count — so collapsed is shorter, never
     blinder. Closed is the resting state; the search box opens it when a
     match would otherwise be out of sight. */
  .workgroup details.fold { border-top:1px solid var(--line); }
  .workgroup details.fold > summary { list-style:none; cursor:pointer;
    padding:.4rem .9rem; color:var(--faint); font-size:.72rem; font-style:italic;
    display:flex; align-items:baseline; gap:.45rem; }
  .workgroup details.fold > summary::-webkit-details-marker { display:none; }
  .workgroup details.fold > summary::before { content:"\u25b8"; font-style:normal;
    color:var(--gold-dim); transition:transform 140ms; }
  .workgroup details.fold[open] > summary::before { content:"\u25be"; }
  .workgroup details.fold > summary:hover { color:var(--muted); }
  .workgroup details.fold .fold-line { display:block; margin:0; padding:.05rem .9rem .4rem; }
  a.sub-book { display:block; padding:.6rem .9rem .6rem 1.7rem; border-top:1px solid var(--line);
    text-decoration:none; color:var(--ink); }
  a.sub-book:hover { background:rgba(224,182,79,.06); }
  a.sub-book .en { display:block; font-size:.98rem; color:var(--gold-dim); }
  a.sub-book .of { display:block; margin-top:.2rem; color:var(--faint); font-size:.78rem; }
  footer { margin-top:2.2rem; color:var(--faint); font-size:.78rem; }
  footer a { color:var(--gold-dim); }
</style>
</head>
<body>
<main>
  <!-- Built by tools/build-front-door-v1.mjs from the zones. Every count below
       is read out of a zone; nothing here is typed twice. -->
  <h1>The Tabernacle</h1>
  <p class="sub">A Hebrew reader on a sealed chain. Every reading traces to the record that carries it, and every record to the licence it was released under.</p>
  <form id="find" role="search" onsubmit="return go(event)">
    <input id="q" type="search" autocomplete="off" spellcheck="false"
      placeholder="find a book — its name, however you type it"
      aria-label="find a book" oninput="sift()">
  </form>
  <nav class="books">
${sectionsHtml.join("\n")}
  </nav>
  <script>
  // Finding is the search box's job, not a record's. A book has one name row
  // inside; here a reader may type that name any way hands actually type it —
  // "1 kings", "1-kings", "i-kings" — and reach the same address. The loose
  // matching is ours and lives only in this box.
  var norm = function (t) {
    t = String(t).toLowerCase();
    t = t.replace(/\\b(iii)\\b/g, "3").replace(/\\b(ii)\\b/g, "2").replace(/\\b(i)\\b/g, "1");
    return t.replace(/[^a-z0-9\\u0590-\\u05FF]+/g, "");
  };
  var atlasRows = [].slice.call(document.querySelectorAll(".atlas-row")).map(function (r) {
    var aw = r.querySelector(".aw");
    return { el: r, key: norm((r.getAttribute("data-p") || "") + " " + (aw ? aw.textContent : "") + " " + (r.getAttribute("href") || "")) };
  });
  var groups = [].slice.call(document.querySelectorAll(".workgroup")).map(function (g) {
    var names = [].slice.call(g.querySelectorAll(".en")).map(function (e) { return e.textContent; });
    [].slice.call(g.querySelectorAll(".he:not(.none)")).forEach(function (e) { names.push(e.textContent); });
    [].slice.call(g.querySelectorAll("a[href]")).forEach(function (a) {
      names.push(a.getAttribute("href").replace(/^\\//, "").replace(/\\?.*$/, ""));
    });
    return { el: g, keys: names.map(norm), first: g.querySelector("a.book") };
  });
  function sift() {
    var q = norm(document.getElementById("q").value);
    groups.forEach(function (g) {
      g.el.hidden = !!q && !g.keys.some(function (k) { return k.indexOf(q) >= 0; });
      // A live search opens the fold: the row that matched may stand behind
      // it, and a hit the reader cannot see is a miss. An emptied box folds
      // the groups back to rest.
      var d = g.el.querySelector("details.fold");
      if (d) d.open = !!q && !g.el.hidden;
    });
    // The atlas rows sift like the groups do: a row is hidden when it does
    // not match, so an opened family shows the matches and not the thousands
    // around them.
    atlasRows.forEach(function (r) {
      r.el.hidden = !!q && r.key.indexOf(q) < 0;
    });
    // The family frame follows its contents: hidden when everything inside
    // is, opened by a live match, restored to its resting state — carried on
    // the element itself — when the box empties.
    [].slice.call(document.querySelectorAll("section.family")).forEach(function (fs) {
      var any = [].slice.call(fs.querySelectorAll(".workgroup, .atlas-row")).some(function (g) { return !g.hidden; });
      fs.hidden = !!q && !any;
      var d = fs.querySelector("details.fam");
      if (d) d.open = q ? any : d.hasAttribute("data-rest-open");
    });
  }
  function go(e) {
    e.preventDefault();
    var live = groups.filter(function (g) { return !g.el.hidden; });
    if (live.length && document.getElementById("q").value.trim()) location.href = live[0].first.getAttribute("href");
    return false;
  }
  </script>
  <!-- A book's own title is corpus text and is not printed here. This page
       carries no records, so it can cite nothing; it says only how each book is
       commonly named, and the title itself waits inside, where it opens. -->
  <footer>A book's own title is printed where it can be opened — inside the reader, out of the ledger, with the records behind it. This page names a built book as it is commonly read, and names everything not yet built by its recorded id alone, exactly as the bridge carries it — some ids hold the work's own Hebrew title, and that is the record showing, not this page translating. The Hebrew of each built book carries its own licence, named on the page it is read from and in anything exported from it.</footer>
</main>
</body>
</html>
`;

// ---- the other face of the door ------------------------------------------
//
// The README described a proof slice of two verses with two commentators on it,
// months after the two books and their commentary had shipped whole. Nobody
// lied; it was written once and never had a reason to change. So it is written
// from the same counts as the page.
const readme = `# The Tabernacle

A Hebrew reader on a sealed chain. Every reading printed under a word traces to
the record that carries it, and every record to the licence it was released
under. No English is forced: a word offers every reading its sources attest, one
at a time, and the reader chooses.

Live site: https://mashiachsonyosef.github.io/

## What is published

${books.map((b) => `- **${esc(b.en)}** — ${n(b.sections)} sections, ${n(b.words)} words` +
  (b.units ? `, with ${n(b.units)} commentary units from ${n(b.works)} work${b.works === 1 ? "" : "s"} — ${whereLine(b)}` : "")).join("\n")}

Commentary is not a separate book. It is carried by the book it comments on and
opens where it attaches — at the word, or across the whole section, depending on
what the chain records for it.

## What is in here

- \`index.html\` — the front door. Built by \`tools/build-front-door-v1.mjs\`; do not edit.
- \`genesis-book-reader-v4/zone.html\` — the reader. One page serves every book.
- \`genesis-book-reader-v4/data/zones/\` — the books and their commentary, as built zones.
- \`genesis-book-reader-v4/data/route-store/\` — the readings, keyed by exact form.
- \`genesis-book-reader-v4/tools/\` — every build step and every check.
- \`genesis-book-reader-v4/PIPELINE-MANIFEST.md\` — generated: every rule the code
  declares and which check guards it, and every published file and what builds it.

## Building and checking

\`\`\`
./build.sh <mirror> <bridge.csv.gz> <serves> <YYYY-MM-DD>
tools/run-all-checks.sh
\`\`\`

The build runs from sealed inputs and is re-runnable: the same inputs give the
same bytes. The checks run against the rendered page rather than the source, and
end by printing what they do not cover.

## Two lanes

The corpus lane acquires, verifies and seals the text, the definition records
and the identity ledgers. Nothing in this repository reaches past what that lane
has sealed. The synthesis lane — this repository — builds the reader from those
artifacts and may not add a character to them.

## Licensing

There is no single licence. Every work carries its own, computed from its own
records and named on the page it is read from and in anything exported from it.
Nothing inherits a licence from the book it sits in.

Served from the \`gh-pages\` branch.
`;

const redirect = (b) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(b.en)} · The Tabernacle</title>
<link rel="canonical" href="/${b.slug}">
<!-- One reader, reached by a clean address. The reader rewrites the bar back to
     /${b.slug} once it has loaded, so this path is what a reader sees, keeps and
     returns to — and this file is what makes returning to it work.

     The script goes first, and it is the only one of the two that carries
     anything asked of this address through: /${b.slug}?c=open has to still say
     c=open by the time the reader is the one reading it. The meta refresh below
     it is the fallback for a browser running no script, and it cannot carry a
     question — which is why it must not be the one that wins the race. -->
<script>var q=location.search.replace(/^[?]/,"");location.replace("/genesis-book-reader-v4/zone.html?b=${b.slug}&clean=${b.slug}"+(q?"&"+q:""));</script>
<meta http-equiv="refresh" content="0; url=/genesis-book-reader-v4/zone.html?b=${b.slug}&clean=${b.slug}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0910;
  color:#a99a80;font:16px Georgia,serif} a{color:#e8c46a}</style>
</head>
<body><p>Opening ${esc(b.en)} — <a href="/genesis-book-reader-v4/zone.html?b=${b.slug}&clean=${b.slug}">continue</a></p>
</body>
</html>
`;

// The only Hebrew this page may print is a title carried from a zone — the
// ledger's own word, shown in the masthead's frame. Scrub every carried title
// out and no Hebrew may remain: anything left is a character this page cannot
// stand behind. Checked here rather than trusted, because this file is
// generated and a generator can drift too.
const HEBREW = /[\u0590-\u05FF]/;
const scrubTitles = (text) => {
  // Two kinds of Hebrew stand on this page and both are records: the carried
  // zone titles, and the atlas rows' recorded ids (some ids hold the work's
  // own Hebrew title). One list, longest first — a carried title can sit
  // inside a recorded id (Genesis inside a Ben-Yehuda essay named for it),
  // and scrubbing the short one first would cut it out of the long one's
  // middle and orphan the remainder as Hebrew nobody owns.
  const known = [];
  for (const b of books) if (b.he) known.push(b.he);
  for (const lf of LEDGER.families) if (lf.he) for (const t of lf.he_tokens) known.push(t.s);
  for (const f of Object.values(ATLAS.families))
    for (const w of f.works) if (HEBREW.test(w.id)) known.push(esc(w.id.split("/").pop()));
  known.sort((a, b) => b.length - a.length);
  let t = text;
  for (const nm of known) t = t.split(nm).join("");
  return t;
};
if (HEBREW.test(scrubTitles(doc))) throw new Error("the front door printed a character of the text beyond the carried titles — refusing output");

if (HEBREW.test(readme)) throw new Error("the README printed a character of the text — refusing output");

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "index.html"), doc);
writeFileSync(join(OUT, "README.md"), readme);
for (const b of books) {
  mkdirSync(join(OUT, b.slug), { recursive: true });
  const r = redirect(b);
  if (HEBREW.test(r)) throw new Error(`${b.slug}: the address page printed a character of the text — refusing output`);
  writeFileSync(join(OUT, b.slug, "index.html"), r);
}

// A published address is a promise. Where a work has been republished under
// the address rule, the old address keeps answering — as a plain redirect to
// where the work now lives — driven by the recorded events in
// data/address-history-v1.json, never by a list typed here.
const HISTORY = arg("history", "data/address-history-v1.json");
if (existsSync(HISTORY)) {
  const hist = JSON.parse(readFileSync(HISTORY, "utf8"));
  for (const row of hist.republished || []) {
    const target = slugOfWork.get(row.to_work_id);
    if (!target) throw new Error(`address history points at ${row.to_work_id}, which the plan does not publish — refusing a redirect to nowhere`);
    const b = books.find((x) => x.slug === target);
    if (!b) throw new Error(`address history target ${target} has no zone behind it`);
    mkdirSync(join(OUT, row.from), { recursive: true });
    const moved = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(b.en)} · The Tabernacle</title>
<link rel="canonical" href="/${target}">
<!-- This address was published on this site and later republished at
     /${target}, when its address was rederived from the work id by the
     address rule (${esc(row.on)}). A reader who kept this address still
     arrives; the bar is rewritten to where the work lives now. -->
<script>var q=location.search.replace(/^[?]/,"");location.replace("/${target}"+(q?"?"+q:""));</script>
<meta http-equiv="refresh" content="0; url=/${target}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0910;
  color:#a99a80;font:16px Georgia,serif} a{color:#e8c46a}</style>
</head>
<body><p>${esc(b.en)} now lives at <a href="/${target}">/${target}</a></p>
</body>
</html>
`;
    if (HEBREW.test(moved)) throw new Error(`${row.from}: the redirect page printed a character of the text — refusing output`);
    writeFileSync(join(OUT, row.from, "index.html"), moved);
  }
}

console.log(`${OUT}/index.html + README.md · ${books.length} books · ${n(totalUnits)} commentary units`);
for (const b of books)
  console.log(`  ${b.slug.padEnd(9)} ${n(b.sections)} sections · ${n(b.words)} words` +
    (b.units ? ` · ${n(b.units)} commentary from ${b.works} work${b.works === 1 ? "" : "s"} · ${whereLine(b)}` : " · no commentary"));
