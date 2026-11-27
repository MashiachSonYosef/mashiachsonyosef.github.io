// Scratch (sixth cut): the changes proposed for reader/place.html, written as the page's own functions and run here in node
// with stand-ins for the page's helpers (el, he, rd, tidy, printable: a tiny tree that prints its text). Not the page.
// Usage: node cut6-page-proposed.mjs <page dir> <book> <chapter:verse> <entry> [record id to open whole]
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

// ---- stand-ins for the page's helpers
const node = (tag, cls, kids) => ({ tag, cls: cls ? [cls] : [], kids: kids.filter((k) => k !== "" && k !== null && k !== undefined), append(...k) { this.kids.push(...k.filter((x) => x !== "" && x != null)); }, classList: { add() {} }, dataset: {}, title: "" });
const el = (tag, cls, ...kids) => { const n = node(tag, cls, kids); n.classList = { add: (c) => n.cls.push(c) }; return n; };
const he = (s) => s, rd = (s) => s, tidy = (s) => String(s), printable = (s) => String(s);
const text = (n) => (typeof n === "string" ? n : n.tag === "br" ? "\n" : n.kids.map(text).join("") + (["p", "div", "li"].includes(n.tag) ? "\n" : ""));

// ================= PROPOSED: new helpers, put beside drawHere in reader/place.html
/** Where an unabridged line stands in its record (the h.b row's stem fields b[10] to b[13]): the stem with its point, or
 *  the stem's own head before its numbered senses; a label that names another stem is quoted as the file's label. */
function unabridgedWhere(b) {
  const label = [b[4], b[5]].filter(Boolean).join(" ");
  if (b[12]) return `${b[10]}, before its numbered senses`;
  if (!b[10]) return label || "the opening";
  if (b[13]) return `${b[10]}, at a point the file labels «${label}»`;
  return label.startsWith(b[10]) ? label : `${b[10]} ${label || "(its opening)"}`;
}
// ================= PROPOSED: replaces the `if (h.b) { … }` block of drawHere
function drawHereUnabridged(h, body, srcHead) {
  if (h.b) {
    const row = el("div", "row", srcHead("unabridged_bdb_1906", "cites this verse"));
    for (const b of h.b) row.append(el("p", "line", he(b[7]), " ", el("span", "gap", `${unabridgedWhere(b)} `), b[6].length ? rd(b[6].map((d) => `«${tidy(d)}»`).join(", ")) : ""));
    const many = Math.max(...h.b.map((b) => b[8]));
    if (many > 1) row.append(el("p", "sub", `STEP's number for this word stands on ${many} records of this file. Only a record whose own headword is this word's is shown here.`));
    if (h.b.some((b) => b[13])) row.append(el("p", "sub", "Where a point's label names another stem, the file has written a cross-reference into the label; the line names the stem the record's own headings put the verse under."));
    body.append(row);
  }
}
// ================= PROPOSED: in openCard, after the loop that draws «At this word» for each form (before `if (!drawn)`)
function pairSentence(e, here) {
  if (e.k === 1 && e.f.length === 2) {
    const key = (b) => b.slice(0, 13).join("|"); const first = new Set(((e.f[0].h || {}).b || []).map(key));
    const both = ((e.f[1].h || {}).b || []).filter((b) => first.has(key(b))).length;
    if (both) here.append(el("p", "form-h", `${both === 1 ? "One line" : `${both} lines`} of the unabridged Brown-Driver-Briggs stand${both === 1 ? "s" : ""} under both forms: STEP's grammar does not give the two forms different stems there, so nothing in the files tells which form the record means.`));
  }
}
// ================= PROPOSED: in drawEntries, the line that fills citedB becomes
const citedKey = (b) => (b[12] ? `${b[1]}|s${b[11]}` : `${b[1]}|${b[2]}|${b[3]}`);
//   for (const b of h.b || []) { if (!citedB.has(b[0])) citedB.set(b[0], new Set()); citedB.get(b[0]).add(citedKey(b)); }
// ================= PROPOSED: in drawEntries, the `if (isB) { … }` block becomes this (the word's language, word by word)
/** What the card says of the records a number stands on: how many are this word's, and how many are set behind for their language. */
function unabridgedSays(ids0, first, other, tongue, said, citesFirst) {
  const set = ids0.filter((id) => other.has(id)).length;
  const lang = set ? ` ${set === 1 ? "One is a" : `${set} are`} Biblical ${tongue[1]} record${set === 1 ? "" : "s"}; ${said} this word is ${tongue[0]}.` : "";
  const head = `This number stands on ${ids0.length} records of this file.`;
  if (first.length === 1) return `${head}${lang} One has this word's own headword${set ? " in its language" : ""}.`;
  if (first.length) return `${head}${lang} ${first.length} of them have this word's own headword${set ? " in its language" : ""}, and nothing in the files says which is meant.${citesFirst ? " The record that cites this verse stands first." : ""}`;
  return `${head}${lang} None has this word's own headword${set ? " in its language" : ""}.`;
}
function partRecords(line, forms, ids0, idsSorted, byMacula, cites) {
  const out = []; const several = ids0.length > 1; let ids = idsSorted.slice(), behind = [];
  // the records of the other language than this word's: the forms name them (ol); the word's language is what STEP's row
  // at this word says (t.lg), else what STEP's lexicon says (the tag's lg)
  const other = new Set(forms.flatMap((f) => f.ol || []).filter((id) => ids0.includes(id)));
  const rowLg = forms.map((f) => (f.t || {}).lg).find(Boolean); const lg = rowLg || line.lg || null;
  const said = rowLg ? "STEP's row at this word says" : "STEP's lexicon says"; const tongue = lg === "a" ? ["Aramaic", "Hebrew"] : ["Hebrew", "Aramaic"];
  const own = new Set([...Object.keys(line.own || {}), ...ids0.filter((id) => byMacula.has(id))].filter((id) => !other.has(id)));
  if (several) { behind = ids.filter((id) => !own.has(id)); ids = ids.filter((id) => own.has(id)); out.push(el("p", "sub", unabridgedSays(ids0, ids, other, tongue, said, ids.some(cites)))); }
  else if (other.has(ids0[0])) out.push(el("p", "sub", `This record is a Biblical ${tongue[1]} record, and ${said} this word is ${tongue[0]}, so it is not said to cite this word.`));
  else if (!own.has(ids0[0])) out.push(el("p", "sub", "This record's headword is spelled otherwise than this word's dictionary form, so it is not said to cite this word."));
  return { out, ids, behind };
}
// ================= PROPOSED: unabridgedWhole, with a stem's head marked where a verse stands in it (the page's own function, changed where marked)
const ITALIC_SAYS = { main_gloss: "the entry's meaning", tagged_gloss: "a meaning", opening: "the words this point opens with", rendering_of_hebrew: "the English of the Hebrew just quoted", verse_wording: "the English of the verse cited", grammar_word: "a grammar word", abbreviation: "an abbreviation", other_language: "a word of another language", outline_letter: "an outline letter", unclassed: "italic in the lexicon; the file does not tell what it is" };
function unabridgedWhole(e, cited, own) {
  const out = []; const kindOf = new Map();
  const note = (u) => { for (const it of u.italics || []) kindOf.set(it.k, it.kind); };
  e.blocks.forEach((blk, bi) => {
    const starts = new Map(); note(blk.head); (blk.head.sub || []).forEach((s, si) => { starts.set(s.k[0], ["sub", `${bi}|-1|${si}`]); note(s); });
    (blk.points || []).forEach((pt, pi) => { starts.set(pt.k[0], ["point", `${bi}|${pi}|-1`]); note(pt); (pt.sub || []).forEach((s, si) => { starts.set(s.k[0], ["sub", `${bi}|${pi}|${si}`]); note(s); }); });
    // CHANGED: a stem heading inside running text starts a unit of its own (the stem's head); a heading that is a point's
    // label makes that point the stem's head as well
    const also = new Map();
    (blk.stems || []).forEach((h, x) => { if (h.point === undefined) starts.set(h.k, ["stem", `${bi}|s${x}`]); else also.set(`${bi}|${h.point}|-1`, `${bi}|s${x}`); });
    const isCited = (key) => cited.has(key) || (also.has(key) && cited.has(also.get(key)));
    let unit = el("div", "unit"); if (isCited(`${bi}|-1|-1`)) { unit.classList.add("cited"); unit.append(el("span", "cited-note", "cites this verse")); }
    const para = el("div", ""); para.append(unit); let empty = true;
    for (let i = blk.k[0]; i < blk.k[1]; i += 1) {
      if (starts.has(i)) { const [cls, key] = starts.get(i); unit = el(cls === "stem" ? "span" : "div", `unit ${cls}`); if (isCited(key)) { unit.classList.add("cited"); unit.append(el("span", "cited-note", "cites this verse")); } para.append(unit); empty = true; }
      const p = e.k[i];
      if (typeof p === "string") { let s = printable(p).replace(/[  ]/g, " "); if (empty) s = s.replace(/^\s+/, ""); if (s) { unit.append(s); empty = false; } continue; }
      const [what, txt] = p;
      if (what === "<") { if (txt === "<br>" && !empty) unit.append(el("br")); else if (/^<placeholder/.test(txt)) { const g = el("span", "gap", "[…]"); unit.append(g); } continue; }
      empty = false;
      if (what === "bdbheb" || what === "bdbarc") unit.append(he(printable(txt)));
      else if (what === "b") unit.append(el("b", "", printable(txt)));
      else if (what === "highlight" || what === "highlightword") { const k = kindOf.get(i) || "unclassed"; const em = el("em", ["main_gloss", "tagged_gloss", "opening"].includes(k) ? "gl" : "", printable(txt)); em.title = ITALIC_SAYS[k]; unit.append(em); }
      else if (what === "ref") unit.append(el("span", "ref", printable(txt)));
      else unit.append(printable(txt));
    }
    if (e.blocks.length > 1) out.push(el("p", "k", `paragraph ${bi + 1} of ${e.blocks.length}${own ? (own.includes(bi) ? " · this word's headword" : " · another headword") : ""}`));
    out.push(para);
  });
  return out;
}
// A stem's head drawn as a unit of its own needs no style of its own beyond .unit; `span.unit.stem` keeps it in its paragraph's flow:
//   .unit.stem { display: inline; }   .unit.stem.cited { outline: 1px solid var(--cited, currentColor); }

// ---- the harness: one word's card, as text
const [PAGE, BOOK, VERSE, ENTRY, OPEN] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const doc = gz(join(PAGE, BOOK, `${VERSE.split(":")[0]}.json.gz`)); const v = doc.verses.find((x) => x.l === VERSE); const e = v.e.find((x) => x.i === Number(ENTRY));
const here = el("div", ""); const srcHead = (k, s) => el("p", "src", `[${k}] ${s || ""}`);
for (const f of e.f) { if (e.f.length > 1) here.append(el("p", "form-h", f.r === 2 ? "The form written: " : "The form read: ", f.s)); drawHereUnabridged(f.h || {}, here, srcHead); }
pairSentence(e, here);
console.log(`== ${BOOK} ${VERSE} entry ${ENTRY} ${e.s}\n-- At this word (the unabridged BDB):\n${text(here)}`);
const tags = [...new Set(e.f.flatMap((f) => ((f.t || {}).p || []).map((p) => p[1]).filter((t) => t && !/^H9\d\d\d$/.test(t))))];
for (const tag of tags) {
  const file = String(Math.floor(Number(tag.slice(1, 5)) / 50)).padStart(3, "0"); const F = gz(join(PAGE, "entries", "t", `${file}.json.gz`)); const line = F.tags[tag];
  const [, ...ids0] = line.b.unabridged_bdb_1906; if (!ids0.length) continue;
  const citedB = new Map(); const byMacula = new Set(); for (const f of e.f) { for (const id of f.ow || []) byMacula.add(id); for (const b of (f.h || {}).b || []) { if (!citedB.has(b[0])) citedB.set(b[0], new Set()); citedB.get(b[0]).add(citedKey(b)); } }
  const cites = (id) => (citedB.get(id) || new Set()).size > 0;
  const sorted = ids0.slice().sort((x, y) => (cites(y) ? 1 : 0) - (cites(x) ? 1 : 0));
  const r = partRecords(line, e.f, ids0, sorted, byMacula, cites);
  console.log(`-- In the dictionaries, ${tag}: ${r.out.map(text).join("").trim() || "(no sentence)"} | first: ${r.ids.map((id) => `${id} (${F.unabridged[id].language})`).join(", ")} | behind: ${r.behind.join(", ") || "-"}`);
  if (OPEN && ids0.includes(OPEN)) { const U = gz(join(PAGE, "entries", "u", `${String(Math.floor(Number(OPEN.slice(3)) / 50)).padStart(3, "0")}.json.gz`)); const whole = unabridgedWhole(U.entries[OPEN], citedB.get(OPEN) || new Set(), (line.own || {})[OPEN] || null);
    const marked = []; const walk = (n) => { if (typeof n === "string") return; if (n.cls.includes("cited")) marked.push(text(n).replace(/\s+/g, " ").slice(0, 160)); n.kids.forEach(walk); }; whole.forEach(walk);
    console.log(`-- ${OPEN} opened whole: the units marked «cites this verse»:\n   ${marked.join("\n   ")}`); }
}
