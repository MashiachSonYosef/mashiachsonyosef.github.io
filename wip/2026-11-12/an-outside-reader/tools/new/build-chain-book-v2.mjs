#!/usr/bin/env node
// Synthesis lane · chain-book-rule-v2-the-same-book-with-the-meaning-taken-out-and-the-links-under-a-word-are-what-its-card-prints-read-off-the-page
// LEDGER: -
// no frame letter. This serves no reading, changes no letter and decides
// nothing. It republishes a book this site already serves with every visible
// thing replaced by the fingerprint of its own bytes.
//
// THE POINT, WHICH IS NOT DECORATION. This project's whole claim is that a
// particular English is attached to a particular Hebrew by a stated rule, and
// that nothing in between was written, edited or chosen by us. Ordinarily a
// reader has to take that on trust: the page is in our typeface, our words
// sit beside theirs, and the join happens somewhere they cannot see.
//
// Take the meaning out and only the join is left. A word becomes a number. A
// reading becomes a number. The line between them is then a line between two
// fixed things, and a stranger can walk the whole book without reading a
// sentence of our prose or believing a word of it.
//
// WHAT THE LINKS UNDER A WORD ARE. They are what that word's card prints
// when a reader presses the word, read off the reading page itself, never
// worked out here (tools/card-readings-v1.mjs says why, and holds the one
// reading of a card): the card's rows of buttons, the lines it prints above
// its pills, and every pill, with the source its title names. Twice: at
// rest, as a first visit finds the page, and with every switch that
// withholds a reading lifted. So anyone can do what the outside reader did
// on 12 November 2026: press a word, hash each pill, and find it here under
// that word, credited as the card credits it, with nothing left over on
// either side.
//
// WHAT IS NOT HERE, said in the file and on the page. Only the word is
// pressed. A division or a block the card offers and does not open on is
// named (its button is fingerprinted) and its readings are a press away:
// they are not in the file, and the file counts how many such buttons there
// are.
//
// WHAT A FINGERPRINT IS COMPUTED FROM, exactly, so anyone can recompute it
// without asking us. Every hash below is sha256 over UTF-8 bytes, with no
// normalisation, no trimming and no case folding, printed as its first 12 hex
// digits and carried in full in the file beside the page:
//
//   the word        the Hebrew as the page prints it, vowels, cantillation
//                   and all: the licensed text, untouched
//   the key         the consonantal key that word is looked up under
//   a reading       a pill's text, or a line the card prints above its
//                   pills, exactly as the card prints it
//   a source        the source's label, as the pill's title or the line's
//                   chip says it
//   a button        a division, a block, a form or a run's word, as its
//                   button prints it
//
// A FILE SAYS WHAT IT WAS READ OFF: the page and every file the page asked
// for while the cards were read, each by its sha256 (read_off.files). The
// same page over the same files prints the same cards, so a file whose every
// fingerprint stands is what this tree's cards print, and the index is not
// written over one that is not.
//
// WHAT IT PROVES AND WHAT IT DOES NOT. It proves custody: that the bytes we
// serve are the bytes we received, and that the line from a word to a reading
// goes where we say it goes. It cannot prove a dictionary was right. A
// fingerprint is a fact about a file, never about the truth of what the file
// says, and a page that claimed otherwise would be worth nothing.
//
// Run (from reader/):
//   node tools/build-chain-book-v2.mjs               every chained book whose file is not of this tree, then the index
//   node tools/build-chain-book-v2.mjs --all         every chained book, then the index
//   node tools/build-chain-book-v2.mjs --only a,b    those books (a served book not yet chained gets its folder), then the index
//   node tools/build-chain-book-v2.mjs --verify      every chained book read again, nothing written, fails where a file differs
//   node tools/build-chain-book-v2.mjs --index       the index alone
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startedAs } from "./main-guard-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { sha256Of, whyNotOfThisTree } from "./resting-lines-v1.mjs";
import { CHAIN_RULE_ID, STATES, readCards, labelsFor, saidOf } from "./card-readings-v1.mjs";

export { CHAIN_RULE_ID };
export const CHAIN_SCHEMA = "CHAIN_BOOK_V3";
export const CHAIN_FILE = "chain-v1.json.gz";
export const CHAIN_SHORT = 12;
/** how many links the PAGE prints per word; the file beside it carries them all */
export const PAGE_SHOWS = 6;
/** the one function, stated in the page and used nowhere else: sha256 over the UTF-8 bytes, untouched */
export const fp = (s) => createHash("sha256").update(String(s), "utf8").digest("hex");

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
// a number prints one way on every machine: the pages' own sha256 is printed
// as custody, and a page that follows the builder's locale is another file
const num = (v) => Number(v).toLocaleString("en-US");
const esc = (s) => String(s).replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");

/** The chain file of one book as kept, or null. */
export const readChain = (dir, slug) => { const p = join(dir, slug, CHAIN_FILE); return existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : null; };
/** Which books have a chain book is the chain's own folder, never a list. */
export const chainedBooks = (dir) => (existsSync(dir) ? readdirSync(dir).sort().filter((slug) => existsSync(join(dir, slug, CHAIN_FILE))) : []);

/** ONE STYLESHEET FOR BOTH PAGES, because the index and the books it lists are
 *  the same publication and a reader who follows a link from one to the other
 *  should not be able to tell they were built by different code paths. */
export const CHAIN_CSS = `
 :root { --ink:#642460; --faint:#753c6d; --muted:#753c6d; --line:#a06c10; --paper:#ebdec3; --sel:#642460; --tekhelet:#23558a; }
 /* one face, linen, since 2026-09-10; the dark face came off this sheet 2026-10-02.
    The reader's own values since 2026-10-10 (the owner: "personally i dont see a
    gain from more than 2/2/2/2 and 3 linen"; "my main point is uniform coloring
    between logo and site"): the page's ground, the purple regular for titles
    and the dim for text and links, the dim gold for every rule. The paler paper,
    the faint label purple and the gold used as a title's ink are folded in. */
 * { box-sizing: border-box; }
 body { margin:0; padding:1rem 16px 4rem; background:var(--paper); color:var(--ink);
   font:15px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
 .wrap { max-width: 58rem; margin: 0 auto; }
 h1 { font-size: 1rem; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin:0 0 .3rem; }
 .lede { font-size:.82rem; color:var(--muted); line-height:1.6; max-width:44rem; margin:0 0 .6rem; }
 .lede b { color: var(--ink); font-weight:600; }
 details.recipe { border:1px solid var(--line); border-radius:.5rem; padding:.5rem .7rem; margin:.8rem 0 1.2rem; }
 details.recipe > summary { cursor:pointer; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
 details.recipe dl { margin:.6rem 0 0; font-size:.76rem; }
 details.recipe dt { color:var(--sel); }
 details.recipe dd { margin:0 0 .45rem; color:var(--muted); }
 .nums { font-size:.74rem; color:var(--faint); margin:.2rem 0 0; }
 section { border-top:1px solid var(--line); padding:.7rem 0 .2rem; }
 h2 { font-size:.72rem; color:var(--sel); margin:0 0 .5rem; font-weight:600; letter-spacing:.04em; }
 h2 i { font-style:normal; color:var(--faint); padding-left:.5rem; }
 .ws { display:grid; grid-template-columns:repeat(auto-fill,minmax(14.5rem,1fr)); gap:.5rem .9rem; }
 .w { border-left:1px solid var(--line); padding:0 0 .35rem .5rem; }
 .w .k { margin:0; font-size:.8rem; color:var(--ink); }
 .w .k span { color:var(--faint); padding-left:.45rem; font-size:.74rem; }
 .w ul { list-style:none; margin:.15rem 0 0; padding:0; }
 .w li { font-size:.74rem; color:var(--tekhelet); line-height:1.45; }
 .w li b { font-weight:400; }
 .w li i { font-style:normal; color:var(--faint); padding-left:.4rem; font-size:.7rem; }
 .w .none { margin:.15rem 0 0; font-size:.72rem; color:var(--faint); }
 .w li.more { color:var(--faint); font-size:.7rem; }
 footer { margin-top:2rem; font-size:.72rem; color:var(--faint); line-height:1.6; max-width:44rem; }
 a { color:var(--muted); }
 ul.books { list-style:none; margin:.2rem 0 0; padding:0; }
 ul.books li { border-top:1px solid var(--line); padding:.55rem 0; display:flex; flex-wrap:wrap; gap:.15rem .7rem; align-items:baseline; }
 ul.books li a { font-size:.9rem; text-decoration:none; }
 ul.books li a:hover { text-decoration:underline; }
 ul.books .c { font-size:.72rem; color:var(--faint); }
 ul.books .c b { font-weight:400; color:var(--muted); }
 ul.books .fp { font-size:.72rem; color:var(--tekhelet); width:100%; word-break:break-all; }
 p.away { font-size:.76rem; color:var(--muted); line-height:1.6; max-width:44rem; margin:1.4rem 0 0; border-top:1px solid var(--line); padding-top:.8rem; }
`;

// THE PAGE NAMES ITS OWN ADDRESS (Search Console, 2026-10-08: pages with no
// canonical were filed as duplicates of each other). The host is the one the
// site answers at, read from CNAME beside the site root as the door reads it;
// a checkout with no CNAME writes no canonical rather than a guessed one.
const SITE_HOST = (() => { try { return readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "..", "CNAME"), "utf8").trim(); } catch { return ""; } })();
const canon = (path) => (SITE_HOST ? `<link rel="canonical" href="https://${SITE_HOST}${path}">` : "");

/** How the recipe is said, once, on both pages and in the file. */
const RECIPE = {
  function: "sha256 over the UTF-8 bytes of the string, with no normalisation, no trimming and no case folding",
  printed: `the first ${CHAIN_SHORT} hex digits; the whole 64 for every one of them is in full_by_short`,
  inputs: {
    word: "the Hebrew as the page prints it: vowels, cantillation and all, the licensed text untouched",
    key: "the consonantal key the word is looked up under",
    reading: "a pill's text, or a line the card prints above its pills, exactly as the card prints it",
    source: "the source's label, as the pill's title or the line's chip says it",
    button: "a division, a block, a form or a run's word, as its button on the card prints it",
    mark: "the kind of a scribal mark as the book's own record names it",
    role: "which half of a word written one way and read another, as the book's own record names it",
    section: "the section's label as the page prints it",
    year_mark: "any words a pill's title sets beside its year, as the title prints them",
  },
  recompute: "take the string, sha256 it, compare the first 12 hex digits. Nothing here needs this site's code to check.",
};
const SHAPE = "sections[].cells[] in the book's own order, one cell per entry of the book. A word: { w, k, rest, lifted }. A scribal mark: { w, mark }; it is not a word and has no card. A word written one way and read another: { w, halves: [{ role, w, k }], rest, lifted }. `rest` and `lifted` are the word's card read in the two states read_off.states describes, each { forms, chain, chain_words, divisions, blocks, here, pool, on, over }: the first five are the card's rows of buttons where it has them, { of: [each button], on: the one pressed, or null }; `here` is the lines the card prints above its pills, [{ is: \"here\" or \"suggested\", r, s }]; `pool` is the index in pools[] of the card's pills, in the card's own order, or null where it prints none; `on` is the pill that stands pressed; `over`, where the word stands in a run one card joins, is the run's first and last word as the card's own head counts them, from 1 in the section with the marks not counted. A pill in a pool: { r, s, y, by, ym } — the reading, the source its title names, the year its title says (null where it says the source gives none), every source behind it where more than one, and any words the title sets beside the year. One list of pills is written once in pools[] and named by its index wherever a card prints it. Two pills of one card can print one text (two readings that point to one other entry print that entry's English alike); they are two links here, as they are two pills there, and the counts say how many repeat another.";
const NOT_HERE = "Only the word is pressed. A division, a block, a form or a run's word that the card offers and does not open on is named in its row and its readings are a press away: they are not in this file. counts.at_rest.buttons_a_press_away says how many there are.";

/** One book's chain file, from its cards as read in the two states. Throws,
 *  in words, where the reading does not fit the zone it is of. */
const chainOf = (readerDir, work, read, asked) => {
  const zone = JSON.parse(gunzipSync(readFileSync(join(readerDir, "data/zones", `${work}.bin`))).toString("utf8"));
  const zs = zone.sections || [];
  const labels = labelsFor(readerDir);
  const full = {};                      // short -> the whole 64, so nothing is only truncated
  const keep = (s) => {
    const h = fp(s), short = h.slice(0, CHAIN_SHORT);
    if (full[short] && full[short] !== h) throw new Error(`two strings share the fingerprint ${short}: the short form is too short for this book`);
    full[short] = h;
    return short;
  };
  const pools = [], poolAt = new Map();
  const counts = {
    sections: zs.length, words: 0, marks: 0, words_written_one_way_and_read_another: 0,
    at_rest: { words_whose_card_prints_a_reading: 0, words_whose_card_prints_none: 0, words_in_a_run_one_card_joins: 0, links: 0, links_that_print_what_another_link_of_their_card_prints: 0, lines_above_the_pills: 0, buttons_a_press_away: 0, words_with_a_button_a_press_away: 0 },
    lifted: { words_whose_card_prints_a_reading: 0, words_whose_card_prints_none: 0, words_in_a_run_one_card_joins: 0, links: 0, links_that_print_what_another_link_of_their_card_prints: 0, lines_above_the_pills: 0, buttons_a_press_away: 0, words_with_a_button_a_press_away: 0 },
  };
  const cardOf = (raw, tally, where) => {
    let said;
    try { said = saidOf(raw, labels); } catch (e) { throw new Error(`${where}: ${String((e && e.message) || e)}`); }
    const card = {};
    let away = 0;
    for (const [k, r] of Object.entries(said.rows)) {
      if (!r) continue;
      card[k] = { of: r.of.map(keep), on: r.on };
      away += r.of.length - (r.on === null ? 0 : 1);
    }
    if (said.here.length) card.here = said.here.map((h) => ({ is: h.is, r: keep(h.text), s: h.label === null ? null : keep(h.label) }));
    const list = said.pills.map((x) => ({
      r: keep(x.text), s: keep(x.label), y: x.year,
      ...(x.by.length > 1 ? { by: x.by.map(keep) } : {}),
      ...(x.mark ? { ym: keep(x.mark) } : {}),
    }));
    if (list.length) {
      const key = JSON.stringify(list);
      if (!poolAt.has(key)) { poolAt.set(key, pools.length); pools.push(list); }
      card.pool = poolAt.get(key);
    } else card.pool = null;
    card.on = said.on;
    // a word of a run one card joins: the card's own head counts the run's first word to its last
    if (said.over[1] > said.over[0]) { card.over = said.over; tally.words_in_a_run_one_card_joins += 1; }
    if (list.length) tally.words_whose_card_prints_a_reading += 1; else tally.words_whose_card_prints_none += 1;
    tally.links += list.length;
    tally.links_that_print_what_another_link_of_their_card_prints += said.twice;
    tally.lines_above_the_pills += said.here.length;
    tally.buttons_a_press_away += away;
    if (away) tally.words_with_a_button_a_press_away += 1;
    return card;
  };
  for (const name of ["rest", "lifted"]) {
    const got = read[name];
    if (got.of !== zs.length || got.sections.length !== zs.length) throw new Error(`${name}: the page drew ${got.sections.length} of its ${got.of} sections and the zone has ${zs.length}`);
  }
  const sections = zs.map((sec, i) => {
    const words = sec.words || [];
    const at = { rest: new Map(), lifted: new Map() };
    for (const name of ["rest", "lifted"]) {
      const s = read[name].sections[i];
      if (s.entries !== words.length) throw new Error(`${sec.label}, ${name}: the page drew ${s.entries} entries and the zone has ${words.length}`);
      if (s.label && String(sec.label ?? "") && s.label.trim() !== String(sec.label).trim() && !s.label.trim().endsWith(String(sec.label).trim())) throw new Error(`section ${i}: the page calls it "${s.label}" and the zone "${sec.label}"`);
      for (const c of s.cards) at[name].set(c.e, c);
    }
    const cells = words.map((w, e) => {
      const wf = keep(String(w.s ?? ""));
      // A MARK IS NOT A WORD. The scribes' marks (the verse end, the section
      // breaks, the bar between two words) keep their place in the file, so
      // the shape is still the book's shape entry for entry, and are counted
      // as marks. They have no card: the page opens none for them.
      if (w.mark) {
        if (at.rest.has(e) || at.lifted.has(e)) throw new Error(`${sec.label}, entry ${e}: the page opened a card on a scribal mark`);
        counts.marks += 1;
        return { w: wf, mark: keep(w.mark.kind) };
      }
      counts.words += 1;
      const where = `${sec.label}, word ${words.slice(0, e + 1).filter((x) => !x.mark).length}`;
      if (!at.rest.has(e) || !at.lifted.has(e)) throw new Error(`${where}: no card was read for it`);
      const rest = cardOf(at.rest.get(e), counts.at_rest, `${where}, at rest`);
      const lifted = cardOf(at.lifted.get(e), counts.lifted, `${where}, lifted`);
      // WRITTEN ONE WAY AND READ ANOTHER. The zone holds such a word as its
      // halves, each with its own letters and its own key; the page opens one
      // card for the word, on the half it chooses, and the card's row of
      // forms says which.
      if (Array.isArray(w.w)) {
        counts.words_written_one_way_and_read_another += 1;
        const halves = w.w.map((r) => { const hk = String((r && r.k) ?? ""); return { role: keep(String((r && r.role) ?? "")), w: keep(String((r && r.s) ?? "")), k: hk ? keep(hk) : null }; });
        return { w: wf, halves, rest, lifted };
      }
      const key = String(w.k ?? "");
      return { w: wf, k: key ? keep(key) : null, rest, lifted };
    });
    return { label: String(sec.label ?? ""), lf: keep(String(sec.label ?? "")), cells };
  });
  const files = {};
  for (const rel of [...asked].sort()) files[rel] = sha256Of(join(readerDir, rel));
  const store = JSON.parse(readFileSync(join(readerDir, "data/route-store/index.json"), "utf8"));
  counts.pools = pools.length;
  counts.distinct_fingerprints = Object.keys(full).length;
  return {
    schema_version: CHAIN_SCHEMA, rule_id: CHAIN_RULE_ID, generated_by: "tools/build-chain-book-v2.mjs", work,
    shape: SHAPE,
    recipe: RECIPE,
    what_this_proves: "custody: that the bytes served are the bytes received, and that the line from a word to a reading goes where this site says it goes",
    what_this_does_not_prove: "that any dictionary is right. A fingerprint is a fact about a file, never about the truth of what the file says.",
    what_is_not_here: NOT_HERE,
    read_off: {
      address: `zone.html?b=${work}`,
      how: "every word pressed as a reader presses it, in the book's own order, and the card the page opens read when its readings have arrived; nothing else pressed, nothing scrolled, every section built by the page's own function",
      states: { rest: { says: STATES.rest.says, page: read.rest.state }, lifted: { says: STATES.lifted.says, page: read.lifted.state } },
      files,
    },
    store: { store_version: store.store_version, schema: store.schema_version },
    counts,
    full_by_short: full,
    pools,
    sections,
  };
};

/** The book's page: a window on the file, which says so. */
const pageOf = (chain) => {
  const c = chain.counts, slug = chain.work;
  const body = chain.sections.map((sec) => {
    const cells = sec.cells.map((cell) => {
      // THE PAGE IS A WINDOW ON THE FILE, and says so. A word can carry more
      // than a hundred readings; printing every one of them for every word
      // makes a page nobody opens on a phone. So the page shows the first
      // few a first visit is shown and names how many it did not show, and
      // the file beside it carries every link with no window at all.
      if (cell.mark) return `<div class="w"><p class="k">${cell.w}</p><p class="none">a scribal mark, not a word</p></div>`;
      const rest = cell.rest.pool === null ? [] : chain.pools[cell.rest.pool];
      const lifted = cell.lifted.pool === null ? 0 : chain.pools[cell.lifted.pool].length;
      const shown = rest.slice(0, PAGE_SHOWS);
      const reads = shown.map((r) => `<li><b>${r.r}</b><i>${r.s}</i></li>`).join("");
      const left = rest.length - shown.length;
      const more = `<li class="more">${left > 0 ? `and ${num(left)} more at rest · ` : ""}${num(lifted)} with the switches lifted, in the file</li>`;
      const list = reads ? `<ul>${reads}${more}</ul>` : `<p class="none">no reading at rest · ${num(lifted)} with the switches lifted, in the file</p>`;
      const head = cell.halves ? `<p class="k">${cell.w}</p><p class="none">written one way and read another</p>` : `<p class="k">${cell.w}${cell.k ? `<span>${cell.k}</span>` : ""}</p>`;
      return `<div class="w">${head}${list}</div>`;
    }).join("");
    return `<section><h2>${sec.lf}<i>${esc(sec.label)}</i></h2><div class="ws">${cells}</div></section>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(slug)} · the same book with the meaning taken out</title>
${canon(`/chain/${slug}/`)}
<style>${CHAIN_CSS}</style></head><body><div class="wrap">
<h1><a href="../">the chain</a> · ${esc(slug)}</h1>
<p class="lede">This is the same book this site serves, with the meaning taken out. Every word is the fingerprint of its own bytes, every reading is the fingerprint of its own text, and the links under a word are what that word's card prints when a reader presses it, read off the reading page itself. <b>Nothing here is written by this project.</b> Strip the language away and only the joins are left, so you can walk the whole book without reading a sentence of our prose or believing any of it.</p>
<p class="nums">${num(c.sections)} sections · ${num(c.words)} words · ${num(c.marks)} scribal marks, which are not words · at rest ${num(c.at_rest.links)} links on ${num(c.at_rest.words_whose_card_prints_a_reading)} cards, ${num(c.at_rest.words_whose_card_prints_none)} cards print none · with the switches lifted ${num(c.lifted.links)} links on ${num(c.lifted.words_whose_card_prints_a_reading)} cards, ${num(c.lifted.words_whose_card_prints_none)} print none · ${num(c.distinct_fingerprints)} distinct fingerprints · route store ${esc(chain.store.store_version)}</p>
<p class="nums">This page prints the first ${PAGE_SHOWS} links a first visit is shown under each word and says how many it left out. <a href="${CHAIN_FILE}">${CHAIN_FILE}</a> beside it carries them all, in both states, with every fingerprint at its full 64 digits.</p>
<details class="recipe"><summary>how to recompute any number on this page</summary>
<dl>
<dt>the function</dt><dd>sha256 over the UTF-8 bytes of the string, with no normalisation, no trimming and no case folding. Printed as the first ${CHAIN_SHORT} hex digits; all 64 for every one of them are in <a href="${CHAIN_FILE}">${CHAIN_FILE}</a> beside this page.</dd>
<dt>a word</dt><dd>the Hebrew as the page prints it: vowels, cantillation and all, the licensed text untouched. The pale number beside it is its consonantal key.</dd>
<dt>a reading</dt><dd>a pill's text exactly as the card prints it. The pale number after it is the label of the source the pill's title names. Open the reading page, press the word, hash each pill: those are the links under the word here, in the card's own order.</dd>
<dt>at rest, and lifted</dt><dd>the cards were read twice. At rest: as a first visit finds the page, nothing kept on the device. Lifted: with every switch that withholds a reading lifted, which is the pointing kept whatever a source points, a source's own signs printed and every source on. The file holds both; this page prints the first.</dd>
<dt>what is not here</dt><dd>only the word is pressed. A division or a block the card offers and does not open on is named in the file and its readings are a press away: they are not in it. At rest that is ${num(c.at_rest.buttons_a_press_away)} buttons on ${num(c.at_rest.words_with_a_button_a_press_away)} cards.</dd>
<dt>a mark</dt><dd>the scribes' marks (the end of a verse, a section break, the bar between two words) keep their place and are not words. The number is the mark as the page prints it.</dd>
<dt>a word written one way and read another</dt><dd>the number is the whole word as the page prints it; the links are those of the card the page opens for it, and the file names its halves.</dd>
<dt>what it proves</dt><dd>custody: the bytes served are the bytes received, and the line from a word to a reading goes where this site says it goes.</dd>
<dt>what it does not prove</dt><dd>that any dictionary is right. A fingerprint is a fact about a file, never about the truth of what the file says.</dd>
</dl></details>
${body}
<footer>Read off the reading page by <code>tools/build-chain-book-v2.mjs</code>: every word pressed, its card read, in the same round that built the page. If this book and that one ever disagree — a word missing, a link moved, a count off — one of them is wrong, and both are published.</footer>
</div></body></html>`;
};

/** THE INDEX IS ITSELF A CUSTODY RECORD, not a table of contents.
 *
 *  A list of links would be this site talking about its own chain, which is
 *  the one thing the chain exists to make unnecessary. So the index prints,
 *  beside each book, the sha256 OF THAT BOOK'S CHAIN FILE — the whole 64,
 *  over the bytes as served. A reader downloads the file, hashes it, and
 *  compares; if it matches, everything inside it is the copy this page
 *  stands behind, and every fingerprint in it can be recomputed from there
 *  without ever running our code. The index is the root of the tree and the
 *  only number on it that a reader has to take from us is the first one they
 *  check for themselves.
 *
 *  It also names what is NOT here. Chaining a book means pressing every word
 *  of it twice, so this carries a stated subset and says which books it left
 *  out and why, in words, with the arithmetic. A silent subset is a claim of
 *  completeness.
 *
 *  AND IT IS NOT WRITTEN OVER A FILE THAT IS NOT OF THIS TREE. Each file
 *  names the page and the files its cards were read off; where one of them
 *  has moved, the file is a recording of another page and this throws. */
export function writeIndex(dir, readerDir, servedWords = null) {
  const books = [], seen = new Map();
  for (const slug of chainedBooks(dir)) {
    const car = join(dir, slug, CHAIN_FILE), pg = join(dir, slug, "index.html");
    if (!existsSync(pg)) continue;
    const carBytes = readFileSync(car), pgBytes = readFileSync(pg);
    const s = JSON.parse(gunzipSync(carBytes).toString("utf8"));
    const why = whyNotOfThisTree(readerDir, s, seen, CHAIN_SCHEMA);
    if (why.length) throw new Error(`${slug}: the chain kept for it is not what this tree's cards print (${why.slice(0, 3).join("; ")}${why.length > 3 ? `; and ${why.length - 3} more` : ""}). Read it again with tools/build-chain-book-v2.mjs — refusing output`);
    books.push({ slug, c: s.counts, store: (s.store || {}).store_version || "—",
      car: createHash("sha256").update(carBytes).digest("hex"),
      pgfp: createHash("sha256").update(pgBytes).digest("hex"),
      carKB: carBytes.length / 1024, pgKB: pgBytes.length / 1024 });
  }
  const tot = books.reduce((a, b) => ({ words: a.words + b.c.words, rest: a.rest + b.c.at_rest.links, lifted: a.lifted + b.c.lifted.links, kb: a.kb + b.carKB + b.pgKB }), { words: 0, rest: 0, lifted: 0, kb: 0 });

  const rows = books.map((b) => `<li>
   <a href="${esc(b.slug)}/">${esc(b.slug)}</a>
   <span class="c"><b>${num(b.c.sections)}</b> sections · <b>${num(b.c.words)}</b> words · <b>${num(b.c.at_rest.links)}</b> links at rest · <b>${num(b.c.lifted.links)}</b> with the switches lifted · <b>${num(b.c.distinct_fingerprints)}</b> distinct fingerprints · ${(b.carKB + b.pgKB).toFixed(0)} KB</span>
   <span class="fp">${CHAIN_FILE} &nbsp;${b.car}</span>
   <span class="fp">index.html &nbsp;${b.pgfp}</span>
  </li>`).join("\n");

  // said only while books are away: chained whole, the shelf has nothing to
  // name as left out, and the paragraph would have claimed a subset of itself
  const away = servedWords && servedWords.total && books.length < servedWords.books
    ? `<p class="away">This is ${books.length} book${books.length === 1 ? "" : "s"} of the ${servedWords.books} the reading side serves — ${num(tot.words)} words of ${num(servedWords.total)}. The rest are not here and the reason is size and time, not doubt: every word of a chained book is pressed twice and its card read, and a word here costs about ${num(Math.round((tot.kb * 1024) / Math.max(1, tot.words)))} bytes once its links are written out, so chaining the whole shelf would be near ${num(Math.max(1, Math.round((servedWords.total * (tot.kb / Math.max(1, tot.words))) / 1024)))} MB of files. Every book that is here was read off the same reading page by the same command. Nothing was chosen for being clean.</p>`
    : "";

  const page = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>the chain</title>
${canon("/chain/")}
<style>${CHAIN_CSS}</style></head><body><div class="wrap">
<h1>the chain</h1>
<p class="lede">These are books this site serves, with the meaning taken out. Every word is the fingerprint of its own bytes, every reading is the fingerprint of its own text, and the links under a word are what that word's card prints when a reader presses it, read off the reading page itself. <b>Nothing in them is written by this project.</b> Strip the language away and only the joins are left, so a stranger can walk a whole book without reading a sentence of our prose or believing any of it.</p>
<p class="lede">The two numbers under each book are the sha256 of the files themselves, as served. Download one, hash it, compare. If it matches, everything inside it is the copy this page stands behind — and every fingerprint inside it can be recomputed the same way, with a tool that is not ours.</p>
<p class="nums">${books.length} book${books.length === 1 ? "" : "s"} · ${num(tot.words)} words · ${num(tot.rest)} links at rest · ${num(tot.lifted)} with the switches lifted · ${(tot.kb / 1024).toFixed(1)} MB</p>
<details class="recipe"><summary>how to recompute any number on this page</summary>
<dl>
<dt>the function</dt><dd>sha256 over the UTF-8 bytes of the string, with no normalisation, no trimming and no case folding. A book's pages print the first ${CHAIN_SHORT} hex digits; all 64 for every one of them are in that book's ${CHAIN_FILE}. The two numbers on this page are sha256 over the FILES, byte for byte as served.</dd>
<dt>a word</dt><dd>the Hebrew as the reading page prints it: vowels, cantillation and all, the licensed text untouched.</dd>
<dt>a reading</dt><dd>a pill's text exactly as the word's card prints it. Open the reading page, press a word, hash each pill: those are the links under that word, credited to the source the pill's title names.</dd>
<dt>at rest, and lifted</dt><dd>the cards were read twice: as a first visit finds the page, and with every switch that withholds a reading lifted. Each book's file holds both.</dd>
<dt>what is not here</dt><dd>only the word is pressed. A division or a block the card offers and does not open on is named in the file and its readings are a press away.</dd>
<dt>what it proves</dt><dd>custody: the bytes served are the bytes received, and the line from a word to a reading goes where this site says it goes.</dd>
<dt>what it does not prove</dt><dd>that any dictionary is right. A fingerprint is a fact about a file, never about the truth of what the file says.</dd>
</dl></details>
<ul class="books">
${rows}
</ul>
${away}
<footer>Read off the reading pages by <code>tools/build-chain-book-v2.mjs</code>: every word pressed, its card read. If a book here and the book it mirrors ever disagree — a word missing, a link moved, a count off — one of them is wrong, and both are published.</footer>
</div></body></html>`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page);
  console.log(`${join(dir, "index.html")} · ${books.length} books · ${num(tot.words)} words · ${num(tot.rest)} links at rest · ${num(tot.lifted)} lifted · ${(tot.kb / 1024).toFixed(1)} MB on disk`);
  return { books: books.length, words: tot.words, rest: tot.rest, lifted: tot.lifted };
}

/** What the reading side serves, asked of the shelf rather than typed here. */
const servedWordsOf = (readerDir) => {
  const zs = zonesServed();
  let total = 0;
  for (const z of zs) { const d = JSON.parse(gunzipSync(readFileSync(join(readerDir, "data/zones", `${z}.bin`))).toString("utf8")); for (const s of d.sections || []) total += (s.words || []).filter((w) => !w.mark).length; }
  return { books: zs.length, total };
};

// run as a program, not imported (tools/main-guard-v1.mjs says why it is asked this way)
if (startedAs(import.meta.url)) {
  const READER = ".";
  const DIR = arg("--dir", join("..", "chain"));
  const only = arg("--only");
  const VERIFY = process.argv.includes("--verify");
  const ALL = process.argv.includes("--all");
  const JOBS = Math.max(1, Number(arg("--jobs", "3")) || 3);
  const STALL = Number(process.env.CHAIN_STALL_MS) || 600000;
  if (process.argv.includes("--index")) { writeIndex(DIR, READER, servedWordsOf(READER)); process.exit(0); }
  const served = zonesServed();
  const books = only ? only.split(",").filter(Boolean) : chainedBooks(DIR);
  const strangers = books.filter((w) => !served.includes(w));
  if (strangers.length) { console.error(`not served here: ${strangers.join(", ")}`); process.exit(2); }
  if (!books.length) { console.error(`no chained book under ${DIR}`); process.exit(2); }
  const pw = await loadPlaywright();
  const queue = books.map((work, at) => ({ work, at }));
  const done = new Array(books.length);
  const seen = new Map();
  const stalled = [];
  const worker = async () => {
    const tree = await serveTree(READER);
    let browser = null;
    try {
      for (let job = queue.shift(); job; job = queue.shift()) {
        const { work, at } = job;
        const old = readChain(DIR, work);
        if (!VERIFY && !ALL && old && !whyNotOfThisTree(READER, old, seen, CHAIN_SCHEMA).length && existsSync(join(DIR, work, "index.html"))) { done[at] = { work, chain: old, how: "kept " }; continue; }
        tree.asked.clear();
        const read = {};
        let why = "";
        for (const name of ["rest", "lifted"]) {
          for (let attempt = 0; attempt < 2 && !read[name] && !why; attempt += 1) {
            if (!browser) browser = await pw.chromium.launch(launchOptions());
            let timer = null;
            const late = new Promise((_, no) => { timer = setTimeout(() => no(new Error("STALLED")), STALL); });
            try { read[name] = await Promise.race([readCards(browser, tree.base, work, name), late]); }
            catch (e) {
              const said = String((e && e.message) || e).split("\n")[0];
              if (said === "STALLED") { stalled.push(`${work} (${name})`); await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 5000))]).catch(() => {}); browser = null; if (attempt === 1) why = `the browser stopped answering twice (${STALL / 1000} s each), ${name}`; }
              else why = `${name}: ${said}`;
            } finally { clearTimeout(timer); }
          }
          if (why) break;
        }
        if (why) { done[at] = { work, failed: why }; continue; }
        let chain;
        try { chain = chainOf(READER, work, read, tree.asked); }
        catch (e) { done[at] = { work, failed: String((e && e.message) || e) }; continue; }
        const same = !!old && JSON.stringify(old) === JSON.stringify(chain);
        if (VERIFY) { done[at] = same ? { work, chain, how: "same " } : { work, chain, how: "DIFF ", moved: !old ? "no file is kept" : JSON.stringify(old.sections) === JSON.stringify(chain.sections) && JSON.stringify(old.pools) === JSON.stringify(chain.pools) ? "the cards are the same and the tree they were read off has moved" : "the cards read now are not the cards kept" }; continue; }
        const out = join(DIR, work);
        mkdirSync(out, { recursive: true });
        const page = pageOf(chain);
        if (!same) writeFileSync(join(out, CHAIN_FILE), gzipSync(Buffer.from(JSON.stringify(chain), "utf8"), { level: 9 }));
        const pagePath = join(out, "index.html");
        if (!existsSync(pagePath) || readFileSync(pagePath, "utf8") !== page) writeFileSync(pagePath, page);
        done[at] = { work, chain, how: same ? "same " : "wrote" };
      }
    } finally { if (browser) await browser.close().catch(() => {}); await tree.close(); }
  };
  await Promise.all(Array.from({ length: Math.min(JOBS, books.length) }, () => worker()));
  const total = { words: 0, rest: 0, lifted: 0 };
  const count = (how) => done.filter((d) => d && d.how === how).length;
  const failed = done.filter((d) => d && d.failed), moved = done.filter((d) => d && d.moved);
  for (const d of done) {
    if (d.failed) { console.log(`FAIL  ${d.work}  ·  ${d.failed}`); continue; }
    const c = d.chain.counts;
    total.words += c.words; total.rest += c.at_rest.links; total.lifted += c.lifted.links;
    console.log(`  ${d.how} ${d.work}  ·  ${num(c.sections)} sections · ${num(c.words)} words · at rest ${num(c.at_rest.links)} links (${num(c.at_rest.words_whose_card_prints_none)} cards print none, ${num(c.at_rest.links_that_print_what_another_link_of_their_card_prints)} links repeat another of their card) · lifted ${num(c.lifted.links)} (${num(c.lifted.words_whose_card_prints_none)} none, ${num(c.lifted.links_that_print_what_another_link_of_their_card_prints)} repeat) · ${num(c.pools)} lists of pills · ${num(c.at_rest.buttons_a_press_away)} buttons a press away · ${Object.keys(d.chain.read_off.files).length} files asked for`);
  }
  if (stalled.length) console.log(`the browser stopped answering and was opened again for: ${stalled.join(", ")}`);
  console.log(`${books.length} books · ${num(total.words)} words · ${num(total.rest)} links at rest · ${num(total.lifted)} lifted · ${VERIFY ? `${count("same ")} files the same, ${moved.length} not` : `${count("wrote")} written, ${count("same ")} read again and the same, ${count("kept ")} kept as still of this tree`}${failed.length ? ` · ${failed.length} FAILED` : ""}`);
  for (const m of moved) console.log(`DIFF  ${m.work}: ${m.moved}`);
  if (failed.length || (VERIFY && moved.length)) process.exit(1);
  if (!VERIFY) writeIndex(DIR, READER, servedWordsOf(READER));
}
